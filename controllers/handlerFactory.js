const catchAsync = require(`./../Utils/catchAsync`);
const AppError = require(`./../Utils/appError`);
const APIFeatures = require(`${__dirname}/../Utils/apiFeatures`);



exports.createOne = Model => catchAsync(async (req , res , next)=>{
  const document = await Model.create(req.body);
    
  // 201 status code stands for created
  res.status(201).json({
    status: "successful",
    data: {document}
  })
});


exports.updateOne = Model => catchAsync(async (req, res, next) => {
  const document = await Model.findByIdAndUpdate(req.params.id , req.body , {
    new: true,
    runValidators: true
  });

  if(!document){
    return next(new AppError(`No document found with that ID` , 404))
  }

  return res.status(200).json({
    status: "successful",
    data: {document}
  });
});


exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if(!document){
        return next(new AppError(`No document found with that ID` , 404))
    }

    res.status(204).end();
});


exports.getOne = (Model , populateOptions) => catchAsync(async (req , res, next)=>{
    // checking to see if there's any population
    let query = Model.findById(req.params.id);
    if(populateOptions) query = query.populate(populateOptions);

    const document = await query;
    
    if(!document){
        return next(new AppError(`No document found with that ID` , 404));
    }
    
    res.status(200).json({
        status: "success",
        data: {
        document
        }
    })
});


exports.getAll = Model => catchAsync(async (req , res, next)=>{
    // To allow for nested GET reviews on tour
    let filter = {};
    if(req.params.tourId) filter = {tour: req.params.tourId};

    const features = new APIFeatures(Model.find() , req.query).filter().sort().limitFields().paginate();
    const documents = await features.query.explain();
    
    res.status(200).json({
        status: "success",
        results: documents.length,
        data: {
        documents
        }
    })
});






// exports.deleteTour = catchAsync(async (req, res, next) => {

//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if(!tour){
//     console.log("tour not found")
//     return next(new AppError(`No tour found with that ID` , 404))
//   }

//   res.status(204).end();
// });