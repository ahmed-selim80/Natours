const mongoose = require("mongoose");
const slugify = require("slugify");

// Don't need to import when referencing
// const User = require(`${__dirname}/userModel`);

// creating the tour schema
const tourSchema = new mongoose.Schema({
  name:{
    type: String,
    required: [true , 'A tour must have a name'],
    unique: true,
    trim: true,
    maxlength: [40 , "A tour's name must be less than 40 characters"],
    minlength: [5 , "A tour's name must be more than 5 characters"],
  },

  slug: String,

  duration:{
    type: Number,
    required: [true , 'A tour must have a duration'],
  },

  ratingsAverage:{
    type: Number,
    default: 4.5,
    min: [1 , "Rating must be above 1.0"],
    max: [5 , "Rating must be below 5.0"],
    set: val => Math.round(val * 10) / 10,
  },

  ratingsQuantity:{
    type: Number,
    default: 0
  },

  price:{
    type: Number,
    required: [true, 'A tour must have a price']
  },

  priceDisount:{
    type: Number,
    validate: {
      validator: function(val){
        return val < this.price;
    },
      message: 'Discount price ({VALUE}) must be below regular price' 
  }
  },

  summary:{
    type: String,
    trim: true,
    required: [true , 'A tour must have a description'],
  },

  maxGroupSize:{
    type: Number,
    required: [true , 'A tour must have a max group size'],
  },

  difficulty:{
    type: String,
    required: [true , 'A tour must have a difficulty'],
    enum: {
      values: ["easy", "medium", "difficult"],
      message: "Difficulty must be either: easy , medium, difficult" 
    }
  },

  description:{
    type: String,
    trim: true,
  },
  
  imageCover:{
    type: String,
    required: [true , 'A tour must have a cover image'],
  },

  images:{
    type: [String],
  },

  createdAt:{
    type: Date,
    default: Date.now(),
    select: false,
  },

  startDates: [Date],
  
  secretTour: {
    type: Boolean,
    default: false
  },

  startLocation: {
    // GeoJSON
    type: {
      type: String,
      default: "Point",
      enum: ["Point"],
    },

    coordinates: [Number],
    address: String,
    description: String,
  },

  locations: [
    {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"]
      },

      coordinates: [Number],
      address: String,
      description: String,
      day: Number // day in tour
    }
  ],

  guides : [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User"
    }
  ]
}, 
// virtual properties options
{
  toJSON: {virtuals: true},
  toObject: {virtuals: true},
})

tourSchema.index({price : 1 , ratingsAverage : -1});
tourSchema.index({slug : 1});
tourSchema.index({startLocation : '2dsphere'});

// Virtual properties
tourSchema.virtual("durationWeeks").get(function(){
  return this.duration / 7;
});

tourSchema.virtual('reviews' , {
  ref : "Review",
  foreignField: "tour",
  localField: "_id"
})

// Document Middleware
tourSchema.pre("save" , async function(){
  this.slug = slugify(this.name, {lower:true});
})

// Populating Tour with guides
tourSchema.pre(/^find/ , function() {
  this.populate({
    path: "guides", // field we want to populate
    select: "-__v -passwordChangedAt"
  });
})

// Embedding users (guides) in tours
// tourSchema.pre("save" , async function(){
//   // getting all the users
//   const guidesPromises = this.guides.map( async id => await User.findById(id));
  
//   // changing the documents to include the guides not just their ID's
//   this.guides = await Promise.all(guidesPromises);
// });

// doc is the document already saved
// tourSchema.post("save" , function(doc){
//   console.log(doc);
// })


// Query Middleware
tourSchema.pre(/^find/ , function(){
  this.find({secretTour : {$ne : true}});
});

// Aggregation Middleware
tourSchema.pre("aggregate" , function(){
  this.pipeline().unshift({$match : {secretTour: {$ne : true}}});
})

const Tour = mongoose.model("Tour" , tourSchema);

module.exports = Tour;