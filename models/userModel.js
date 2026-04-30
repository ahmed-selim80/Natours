const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true , "A user must have a name"],
        trim: true,
        maxlength: [20 , "A name must be less than 20 letters"] 
    },

    email: {
        type: String,
        required: [true , "A user must have an email"],
        trim: true,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail , "Please provide a valid Email"],
    },

    role: {
        type: String,
        enum: ['user' , 'guide' , 'lead-guide' , 'admin'],
        default: 'user'
    },

    photo: {
        type: String,
        trim: true,
        default: 'default.jpg'
    },

    password: {
        type: String,
        required: [true , "A user must have a password"],
        minlength: 8,
        select: false,
    },

    passwordConfirm: {
        type: String,
        required: [true , "Please Confirm your password"],
        validate: {
            // This only works on CREATE and SAVE!!!
            validator: function(el){
                return el === this.password;
            },
            message: "Passwords are not the same"
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

userSchema.pre(/^find/ , async function(){
    this.find({active : {$ne : false}});
})


userSchema.pre("save" , async function(){
    if (!this.isModified("password") || this.isNew) return ;

    this.passwordChangedAt = Date.now() - 1000;
})

// hashing the password before saving it to the database
userSchema.pre("save" , async function(){
    // if anything other than password has been modified -> exit the function we will not hash the password again
    if(!this.isModified("password")) return;

    // hashing the password and choosing the cost 12: basically how cpu intensive this will be
    // too big of a cost will result in the process taking too much time.
    this.password = await bcrypt.hash(this.password , 12);

    // making the confirmPassword undefined
    this.passwordConfirm = undefined;
});


userSchema.methods.correctPassword = async function (inputPassword , userPassword){
    return await bcrypt.compare(inputPassword , userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000 , 10);

        // basically password changed after token was issued
        return JWTTimestamp < changedTimestamp;
    }
    
    return false;
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest("hex");
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}


const User = mongoose.model("User" , userSchema);

module.exports = User;

