const Review = require(`../models/reviewModel`);
const catchAsync = require(`${__dirname}/../Utils/catchAsync`);

const factory = require(`${__dirname}/handlerFactory`);


exports.setUserTourIds = (req , res , next) => {
    // Allow nested routes
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;

    next();
}

exports.addReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.getReview = factory.getOne(Review);
exports.getAllReviews = factory.getAll(Review);