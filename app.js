const path = require("path");
const morgan = require("morgan");
const express = require('express');
const compression = require('compression');
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");

const AppError = require(`${__dirname}/Utils/appError`);
const globalErrorHandler = require(`${__dirname}/controllers/errorController`);
const tourRouter = require(`${__dirname}/routes/tourRoutes`);
const userRouter = require(`${__dirname}/routes/userRoutes`);
const reviewRouter = require(`${__dirname}/routes/reviewRoutes`);
const viewRouter = require(`${__dirname}/routes/viewRoutes`);
const bookingRouter = require(`${__dirname}/routes/bookingRoutes`);

const app = express();

app.enable('trust proxy');

app.set("view engine" , 'pug');
app.set("views" , path.join(__dirname ,`views`));

// serving static files
app.use(express.static( path.join(__dirname ,`public`)));

// Set Security HTTP headers
// app.js
// ----- CODE STARTS HERE -----

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://unpkg.com', 'https://js.stripe.com'],
      frameSrc: ["'self'", 'https://js.stripe.com'],
      connectSrc: ["'self'", 'https://api.stripe.com'],
      styleSrc: ["'self'", 'https://fonts.googleapis.com', 'https://unpkg.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://www.natours.dev']
    }
  })
);

// ----- CODE ENDS HERE -----

// Only show logging when in development mode
if(process.env.NODE_ENV === "development"){
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, PLease try again in an hour!"
})
app.use('/api' , limiter);

// body parser , reading data from body into req.body
app.use(express.json({limit: '10kb'}));
app.use(express.urlencoded({extended: true , limit: "10kb"}));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: [
    'duration',
    'ratingsAverage',
    'ratingsQuantity',
    'maxGroupSize',
    'price',
    'difficulty',
  ]
}));

app.use(compression());

// Test middleware
app.use((req , res , next) => {
  req.requestTime = new Date().toISOString();
  next();
})

// Mounting a router (Mounting this route: tourRouter , on this route `/api/v1/tours`)
app.use(`/` , viewRouter);
app.use(`/api/v1/tours` , tourRouter);
app.use(`/api/v1/users` , userRouter);
app.use(`/api/v1/reviews` , reviewRouter);
app.use(`/api/v1/bookings` , bookingRouter);

app.all("*" , (req , res , next)=>{
  // res.status(404).json({
  //   status: "fail",
  // message: `Can't find ${req.originalUrl} on this server!`
  // })

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.statusCode = 404;
  // err.status = "fail";


  next(new AppError(`Can't find ${req.originalUrl} on this server!` , 404));
})

app.use(globalErrorHandler);

module.exports = app;