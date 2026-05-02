const path = require('path');
const morgan = require('morgan');
const express = require('express');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const AppError = require(`${__dirname}/Utils/appError`);
const globalErrorHandler = require(`${__dirname}/controllers/errorController`);
const tourRouter = require(`${__dirname}/routes/tourRoutes`);
const userRouter = require(`${__dirname}/routes/userRoutes`);
const reviewRouter = require(`${__dirname}/routes/reviewRoutes`);
const viewRouter = require(`${__dirname}/routes/viewRoutes`);
const bookingRouter = require(`${__dirname}/routes/bookingRoutes`);
const bookingController = require(`${__dirname}/controllers/bookingController`);

const app = express();

// Needed because Render/proxies sit in front of your app.
// Use 1, NOT app.enable('trust proxy'), because express-rate-limit rejects overly permissive trust proxy.
app.set('trust proxy', 1);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Stripe webhook route MUST come before express.json(),
// because Stripe needs the raw body for signature verification.
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

// Implement CORS
app.use(cors());
app.options('*', cors());

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set Security HTTP headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],

      scriptSrc: [
        "'self'",
        'https://cdn.jsdelivr.net',
        'https://unpkg.com',
        'https://js.stripe.com'
      ],

      styleSrc: [
        "'self'",
        'https://fonts.googleapis.com',
        'https://unpkg.com'
      ],

      fontSrc: [
        "'self'",
        'https://fonts.gstatic.com'
      ],

      imgSrc: [
        "'self'",
        'data:',
        'https://a.tile.openstreetmap.org',
        'https://b.tile.openstreetmap.org',
        'https://c.tile.openstreetmap.org',
        'https://*.tile.openstreetmap.org',
        'https://www.natours.dev'
      ],

      connectSrc: [
        "'self'",
        'https://api.stripe.com'
      ],

      frameSrc: [
        "'self'",
        'https://js.stripe.com',
        'https://hooks.stripe.com'
      ]
    }
  })
);

// Only show logging when in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});

app.use('/api', limiter);

// Body parser: reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'price',
      'difficulty'
    ]
  })
);

// Compress text responses
app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Mount routers
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;