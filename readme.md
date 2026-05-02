No — don’t paste that exact version. It has broken markdown at the end and may claim things you didn’t finish.

Paste this cleaner version into `README.md`. Replace only the placeholders inside `[ ... ]`.

````md
# Natours

Natours is a full-stack tour booking application built with Node.js, Express, MongoDB, Mongoose, Pug, and Stripe.

This project was built while completing Jonas Schmedtmann’s Node.js, Express, MongoDB & More bootcamp. It covers production-style backend architecture, authentication, payments, file uploads, server-side rendering, security, and deployment preparation.

## Live Demo

Live project: [Add your deployed app link here]

Demo login:

```txt
Email: laura@example.com
Password: test1234
```
````

> Payments are processed in Stripe test mode. Do not use real card details.

Test card:

```txt
4242 4242 4242 4242
Any future expiry date
Any CVC
```

## Features

### Authentication and Authorization

- User signup and login
- JWT-based authentication
- Secure HTTP-only cookies
- Protected routes
- Role-based authorization
- Password reset flow using reset tokens
- Password hashing with bcrypt
- Password change invalidates old JWTs

### Tours

- View all tours
- View individual tour details
- Tour guides and reviews population
- Tour locations displayed on a map
- Advanced API filtering, sorting, field limiting, and pagination
- Tour statistics and aggregation endpoints
- Geospatial queries for tours within a distance

### Reviews

- Users can review tours
- Nested routes for tour reviews
- Review authorization rules
- Average ratings calculated using Mongoose middleware

### Bookings and Payments

- Stripe Checkout integration
- Stripe webhook handling for booking creation
- Booking model connecting users and tours
- “My bookings” page showing tours booked by the logged-in user
- Booking API restricted to admins and lead guides

### User Account

- Update profile information
- Upload user photo
- Image resizing and optimization with Sharp
- Account page rendered with Pug templates

### Security and Production

- Security HTTP headers with Helmet
- Rate limiting
- Data sanitization against NoSQL query injection
- XSS sanitization
- Parameter pollution prevention
- CORS configuration
- Global error handling
- Operational vs programming error handling
- Production-ready environment variable setup
- Response compression
- Graceful shutdown handling for SIGTERM and unhandled rejections

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Stripe
- Nodemailer
- SendGrid / Mailtrap
- Multer
- Sharp
- Helmet
- Express Rate Limit
- Express Mongo Sanitize
- XSS Clean
- HPP
- Compression

### Frontend / Views

- Pug templates
- CSS
- Vanilla JavaScript
- Axios
- Parcel
- Leaflet

### Tools

- Postman
- MongoDB Atlas
- MongoDB Compass
- Git and GitHub
- Deployment platform: [Render / Fly / other platform]

## Project Structure

```txt
natours/
├── controllers/
│   ├── authController.js
│   ├── bookingController.js
│   ├── errorController.js
│   ├── handlerFactory.js
│   ├── reviewController.js
│   ├── tourController.js
│   ├── userController.js
│   └── viewsController.js
│
├── models/
│   ├── bookingModel.js
│   ├── reviewModel.js
│   ├── tourModel.js
│   └── userModel.js
│
├── routes/
│   ├── bookingRoutes.js
│   ├── reviewRoutes.js
│   ├── tourRoutes.js
│   ├── userRoutes.js
│   └── viewRoutes.js
│
├── public/
│   ├── css/
│   ├── img/
│   └── js/
│
├── utils/
│   ├── apiFeatures.js
│   ├── appError.js
│   ├── catchAsync.js
│   └── email.js
│
├── views/
│   ├── emails/
│   ├── account.pug
│   ├── base.pug
│   ├── error.pug
│   ├── login.pug
│   ├── overview.pug
│   └── tour.pug
│
├── app.js
├── server.js
├── package.json
└── README.md
```

## Main API Endpoints

### Auth

```txt
POST   /api/v1/users/signup
POST   /api/v1/users/login
GET    /api/v1/users/logout
POST   /api/v1/users/forgotPassword
PATCH  /api/v1/users/resetPassword/:token
PATCH  /api/v1/users/updateMyPassword
```

### Users

```txt
GET     /api/v1/users
GET     /api/v1/users/:id
PATCH   /api/v1/users/:id
DELETE  /api/v1/users/:id
PATCH   /api/v1/users/updateMe
DELETE  /api/v1/users/deleteMe
GET     /api/v1/users/me
```

### Tours

```txt
GET     /api/v1/tours
POST    /api/v1/tours
GET     /api/v1/tours/:id
PATCH   /api/v1/tours/:id
DELETE  /api/v1/tours/:id

GET     /api/v1/tours/tour-stats
GET     /api/v1/tours/monthly-plan/:year
GET     /api/v1/tours/tours-within/:distance/center/:latlng/unit/:unit
GET     /api/v1/tours/distances/:latlng/unit/:unit
```

### Reviews

```txt
GET     /api/v1/reviews
POST    /api/v1/reviews
GET     /api/v1/reviews/:id
PATCH   /api/v1/reviews/:id
DELETE  /api/v1/reviews/:id

GET     /api/v1/tours/:tourId/reviews
POST    /api/v1/tours/:tourId/reviews
```

### Bookings

```txt
GET     /api/v1/bookings/checkout-session/:tourId
GET     /api/v1/bookings
POST    /api/v1/bookings
GET     /api/v1/bookings/:id
PATCH   /api/v1/bookings/:id
DELETE  /api/v1/bookings/:id
```

## Pages

```txt
GET /                 Overview page
GET /tour/:slug       Tour detail page
GET /login            Login page
GET /me               Account page
GET /my-tours         My bookings page
```

## Environment Variables

Create a `config.env` file in the root directory for local development.

```env
NODE_ENV=development
PORT=3000

DATABASE=your_mongodb_connection_string
DATABASE_PASSWORD=your_database_password

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

EMAIL_USERNAME=your_mailtrap_username
EMAIL_PASSWORD=your_mailtrap_password
EMAIL_HOST=your_mailtrap_host
EMAIL_PORT=your_mailtrap_port
EMAIL_FROM=your_verified_sender_email

SENDGRID_USERNAME=apikey
SENDGRID_PASSWORD=your_sendgrid_api_key

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

> Never commit `config.env`, `.env`, API keys, passwords, or secrets.

## Installation

Clone the repository:

```bash
git clone https://github.com/[your-username]/[your-repo-name].git
cd [your-repo-name]
```

Install dependencies:

```bash
npm install
```

Build frontend assets:

```bash
npm run build:js
```

Start development server:

```bash
npm run dev
```

Start production server:

```bash
npm start
```

## Scripts

```json
{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "watch:js": "parcel watch ./public/js/index.js --dist-dir ./public/js --out-file bundle.js",
  "build:js": "parcel build ./public/js/index.js --dist-dir ./public/js --out-file bundle.js"
}
```

## Deployment Notes

Before deployment:

- Use relative API URLs in frontend JavaScript.
- Build the final JavaScript bundle.
- Set all environment variables on the hosting platform.
- Make sure the app listens on `process.env.PORT`.
- Make sure secrets are not committed to GitHub.
- Configure Stripe webhook endpoint in production.
- Configure CORS and security settings for the production domain.

## What I Learned

This project helped me understand how real backend applications are structured beyond basic CRUD. Key concepts I practiced include:

- MVC architecture
- Middleware pipelines
- Authentication and authorization
- Secure password reset workflows
- Mongoose data modeling and relationships
- Query middleware and document middleware
- Server-side rendering
- File uploads and image processing
- Payment integration with Stripe
- Webhooks
- Centralized error handling
- Production deployment and environment configuration

## Certificate

Completed: Node.js, Express, MongoDB & More: The Complete Bootcamp by Jonas Schmedtmann

Certificate: [https://ude.my/UC-2aafbdd3-4ae8-4767-9577-a07e48f8b945]

## Author

Ahmed Selim

GitHub: [https://github.com/ahmed-selim80]
LinkedIn: [www.linkedin.com/in/ahmed-selim-noshi80]
