const multer = require('multer');
const sharp = require('sharp');
const User = require(`${__dirname}/../models/userModel`);
const catchAsync = require(`${__dirname}/../Utils/catchAsync`);
const AppError = require(`${__dirname}/../Utils/appError`);
const factory = require(`${__dirname}/handlerFactory`);

// const multerStorage = multer.diskStorage({
//   destination: (req , file , cb) => {
//     cb(null , 'public/img/users');
//   },

//   filename: (req , file , cb) => {
//     const extension = file.mimetype.split('/')[1];
//     cb(null , `user-${req.user.id}-${Date.now()}.${extension}`);
//   }
// });

// the images will be stored as buffers in the memory
const multerStorage = multer.memoryStorage();

const multerFilter = (req , file , cb) => {
  if (file.mimetype.startsWith('image')){
    cb(null , true);
  }
  else{
    cb(new AppError('Not an Image!! Please Upload only images.' , 400) , false);
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');


exports.resizeUserPhoto = catchAsync (async (req , res , next) => {
  // if no image was provided
  if(!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality: 90}).toFile(`public/img/users/${req.file.filename}`);
  next();
});

const filterObj = (obj , ...allowedFields) => {
  const newObj =  {};
  
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  })
  
  return newObj;
}

exports.getMe = (req , res , next) => {
  req.params.id = req.user.id;
  next();
}




exports.updateMe = catchAsync (async (req , res , next) =>{
  // 1) Create error if user POSTs Password data
  if (req.body.password || req.body.passwordConfirm){
    return next(new AppError("This route is not for password updates. Please use /updateMyPassword" , 400)) // 400 -> bad request
  }
  
  // 2) Update user document
  const filteredBody = filterObj(req.body , "name" , "email");

  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id , filteredBody , {
    new: true,
    runValidators: true
  })
  
  res.status(200).json({
    status: "success",
    user: updatedUser
  })
});


exports.deleteMe = catchAsync (async (req , res , next) => {
  await User.findByIdAndUpdate(req.user.id , {active: false});
  
  res.status(204).json({
    status: "success",
    data: null
  })
});



exports.addUser = (req , res)=>{
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined, Please use Signup instead"
  })
};


// Do NOT update password with this
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);