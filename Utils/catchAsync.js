module.exports = fn => {
  return (req , res , next)=>{
    // so the catchAsync function now returns this function that will be assigned to addTour
    fn(req , res , next).catch(err => next(err));
  }
}

