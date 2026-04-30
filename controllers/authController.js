const crypto = require("crypto");
const util = require("util");
const jwt = require("jsonwebtoken");
const User = require(`${__dirname}/../models/userModel`);
const catchAsync = require(`${__dirname}/../Utils/catchAsync`);
const AppError = require(`${__dirname}/../Utils/appError`);
const Email = require(`${__dirname}/../Utils/email`);


const signToken = id => {
    return jwt.sign({id} , process.env.JWT_SECRET , {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}
 
const createSendToken = (user , statusCode , res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date( Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

    
    res.cookie("JWT" , token , cookieOptions);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    })
}

exports.signup = catchAsync(async (req , res , next)=>{

    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });

    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser , url).sendWelcome();
    createSendToken(newUser , 201 , res);
});


exports.login = catchAsync( async (req , res , next) =>{
    const {email , password} = req.body;

    // 1) Check if email and password exist
    if (!email || !password){
        return next(new AppError("Please provide email and password", 400)) // 400 status code for bad request
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({email}).select(`+password`);

    // if user doesn't exist or password is wrong
    if (!user || ! (await user.correctPassword(password , user.password))){
        return next(new AppError("Incorrect Email or Password" , 401)) // 401 status code for unauthorized
    }

    // 3) If everything ok, send token to client
   createSendToken(user , 200 , res);
});
  

exports.protect = catchAsync (async (req , res , next) => {
    let token;

    // 1) Getting token
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1];
    } else if(req.cookies.JWT){
        token = req.cookies.JWT;
    }
    
    // if no token throw an error
    if (!token) {
        return next(new AppError("You are not logged in !! , Please login to gain access", 401)) // 401 -> Unauthorized
    }

    // 2) Verifying token
    const decoded = await util.promisify(jwt.verify)(token , process.env.JWT_SECRET);

    // 3) Check if user still exists
    const freshUser = await User.findById(decoded.id);
    if(!freshUser){
        return next(new AppError("The user belonging to this token doesn't exist anymore" , 401))
    }

    // 4) Check if user changed password after the token was issued
    if(freshUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError("User Recently changed password! Please log in again" , 401))
    }

    // Grant access to protected route
    req.user = freshUser;
    
    // to be able to use it in all templates
    res.locals.user = freshUser;
    next();
});


// only for Rendered pages
exports.isLoggedIn = async (req , res , next) => {
    try{
        // 1) Getting token
        if(req.cookies.JWT){
            // 2) verifies the token
            const decoded = await util.promisify(jwt.verify)(req.cookies.JWT , process.env.JWT_SECRET);

            // 3) Check if user still exists
            const freshUser = await User.findById(decoded.id);
            if(!freshUser){
                return next();
            }

            // 4) Check if user changed password after the token was issued
            if(freshUser.changedPasswordAfter(decoded.iat)){
                return next()
            }

            // There is a logged in user
            res.locals.user = freshUser;
            return next();
        }
    }catch(err){
        console.log(err);
    }
    next();
};

exports.restrictTo = (...roles) =>{
    return (req , res , next) => {
        // eg. roles = ['admin' , 'lead-guide']

        // user's role isn't in the allowed roles
        if(!roles.includes(req.user.role)){
            return next(new AppError("You don't have permission to perform this action" , 403)) // 403 -> forbidden
        }
        // otherwise the user has permission , move on to the next middleware
        next();
    }
}


exports.forgotPassword = catchAsync( async (req , res , next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({email: req.body.email});
    if(!user) return next(new AppError("No user with that email" , 404)) // 404 -> Not Found

    // 2) Generate random rest token
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});
    
    try{
        // 3) Send it to the user's email
        const resetPasswordURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
        await new Email(user , resetPasswordURL).sendPasswordReset();

        res.status(200).json({
            status: "success",
            message: "Reset password token sent to email"
        })
    }catch(err){
        console.log("Email Error!!!!!" , err)
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;
        await user.save({validateBeforeSave: false});
        return next(new AppError("There was a problem sending the email, Try again later!" , 500));
    }
});



exports.resetPassword = catchAsync (async (req , res , next) => {

    // 1) Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest("hex");

    const user = await User.findOne({passwordResetToken: hashedToken , passwordResetTokenExpires : {$gt: Date.now()}});

    // 2) If token has not expired, and there is user, set the new password
    if(!user) return next(new AppError("Token is invalid or has expired" , 400)) // 400 -> Bad Request

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save();

    // 3) Update changedPasswordAt property for the user

    // 4) Log the user in , send JWT

    createSendToken(user , 200 , res);
});


exports.updatePassword = catchAsync ( async(req , res , next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select("+password");

    // 2) Check if POSTed current password is correct
    if (!await user.correctPassword(req.body.passwordCurrent , user.password)) 
        return next(new AppError("You entered the wrong password" , 401));

    // 3) If so , update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();


    // 4) log user in , send JWT
    createSendToken(user , 200 , res);
});


exports.logout = (req , res) => {
    // so basically sending another cookie without the token to overwrite the old cookie instead of just deleting it
    res.cookie('JWT' , 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    return res.status(200).json({status: 'success'});
}