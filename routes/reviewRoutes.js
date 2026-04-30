const express = require("express");
const reviewController = require(`${__dirname}/../controllers/reviewController`);
const authController = require(`${__dirname}/../controllers/authController`);


const router = express.Router({mergeParams: true});

router.use(authController.protect);

router.route("/")
.post(authController.restrictTo("user") , reviewController.setUserTourIds , reviewController.addReview)
.get(reviewController.getAllReviews);

router.route("/:id")
.delete(reviewController.deleteReview)
.patch(authController.restrictTo("user" , "admin") , reviewController.updateReview)
.get(authController.restrictTo("user" , "admin") , reviewController.getReview);



module.exports = router;