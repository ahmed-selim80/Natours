const mongoose = require("mongoose");
const Tour = require(`${__dirname}/tourModel`);

const reviewSchema = mongoose.Schema({
    review: {
        type: String,
        required: [true , "Review Cannot be empty"],
    },

    rating: {
        type: Number,
        min: 1,
        max: 5
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

    tour:{
        type: mongoose.Schema.ObjectId,
        ref: "Tour",
        required: [true , "Review must belong to a tour"]
    },

    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true , "Review must belong to a user"]
    }
},
    //  making sure visual properties can show
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true},
    }
);


reviewSchema.index({tour: 1 , user: 1} , {unique: true});

reviewSchema.pre(/^find/ , function(){
    // this.populate({
    //     path: "tour",
    //     select: "name"
    // }).populate({
    //     path: "user",
    //     select: "name photo"
    // })

    this.populate({
        path: "user",
        select: "name photo"
    })
})

reviewSchema.statics.calcAverageRatings = async function(tourId){
    // this points to current Model (Review)
    const stats = await this.aggregate([
        {
            $match : {tour : tourId}
        },
        {
            $group: {
                _id: '$tour',
                numRatings : {$sum : 1}, // Number of ratings
                avgRating: {$avg : '$rating'} // Average of ratings
            }
        }
    ]);

    // checking if there are reviews still
    if(stats.length > 0){
        await Tour.findByIdAndUpdate(tourId , {
            ratingsQuantity: stats[0].numRatings,
            ratingsAverage: stats[0].avgRating
        }) 
    }
    // means all reviews are gone , either there aren't any yet or they all have been deleted
    else{
        await Tour.findByIdAndUpdate(tourId , {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        }) 
    }
}

reviewSchema.post("save" , function(){
    // this point to current document -> constructor is the Model
    this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/ , async function(){
    // this is the query
    this.review = await this.model.findOne(this.getQuery()); // Attaching the review document to the query
});

reviewSchema.post(/^findOneAnd/ , async function(){
    // this is the query
    await this.review.constructor.calcAverageRatings(this.review.tour);
});


const Review = mongoose.model("Review" , reviewSchema);
module.exports = Review;