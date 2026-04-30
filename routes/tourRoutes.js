const express = require("express");
const tourController = require(`${__dirname}/../controllers/tourController`);
const authController = require(`${__dirname}/../controllers/authController`);
const reviewController = require(`${__dirname}/../controllers/reviewController`);

const reviewRouter = require(`${__dirname}/../routes/reviewRoutes`);

// Routes
const router = express.Router();

// Mounting this specific url to the reviewRouter to deal with
router.use('/:tourId/reviews' , reviewRouter);

router.route('/top-5-cheapest')
   .get(tourController.aliasTopTours , tourController.getAllTours);

router.route("/tour-stats")
   .get(tourController.getTourStats);

router.route("/monthly-plan/:year")
   .get(authController.protect , authController.restrictTo("lead-guide" , "admin" , "guide") , tourController.getMonthlyPlan);

router.route('/tours-within/:distance/center/:latlng/unit/:unit')
   .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router.route(`/`) 
   .get(tourController.getAllTours)
   .post(authController.protect , authController.restrictTo("lead-guide" , "admin") , tourController.addTour);


router.route(`/:id`)
   .get(tourController.getTour)
   .patch(authController.protect , authController.restrictTo("lead-guide" , "admin") , tourController.uploadTourImages , tourController.resizeTourImages ,tourController.updateTour)
   .delete(authController.protect , authController.restrictTo("admin" , "lead-guide") , tourController.deleteTour);


// POST /tour/343434/reviews
// GET /tour/343434/reviews
// POST /tour/343434/reviews/5345443

// router.route('/:tourId/reviews')
// .post(authController.protect , authController.restrictTo("user") , reviewController.addReview);


module.exports = router;