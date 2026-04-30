const express = require("express");
const viewController = require(`${__dirname}/../controllers/viewController`);
const authController = require(`${__dirname}/../controllers/authController`);
const bookingController = require(`${__dirname}/../controllers/bookingController`);

const router = express.Router();

router.get("/login" , viewController.getLoginForm);
router.get("/me" , authController.protect , viewController.getAccount);
router.get("/my-tours" , authController.protect , viewController.getMyTours);
router.post('/submit-user-data' , authController.protect , viewController.updateUserData);

router.use(authController.isLoggedIn)

router.get("/" , bookingController.createBookingCheckout , authController.isLoggedIn ,  viewController.getOverview);
router.get("/tour/:slug" , viewController.getTour);



module.exports = router;