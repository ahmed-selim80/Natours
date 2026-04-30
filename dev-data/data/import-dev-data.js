const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");

const Tour = require(`${__dirname}/../../models/tourModel`)
const User = require(`${__dirname}/../../models/userModel`)
const Review = require(`${__dirname}/../../models/reviewModel`)

dotenv.config({path: `${__dirname}/../../config.env`});

// defining and connection to our database
const DB = process.env.DATABASE.replace("<PASSWORD>" , process.env.DATABASE_PASSWORD);
mongoose.connect(DB).then(con => console.log("DB connected Successfully"));

// Read JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json` , "utf-8"));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json` , "utf-8"));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json` , "utf-8"));

// Import data from Json file to database
const importData = async ()=>{
    try{
        await Tour.create(tours);
        await User.create(users , {validateBeforeSave: false});
        await Review.create(reviews);
        console.log("Data successfully added");
    }catch(err){
        console.log(err);
    }finally{
        process.exit();
    }
}

// delete all data from the database
const deleteData = async ()=>{
    try{
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("Data successfully deleted");
    }catch(err){
        console.log(err);
    }finally{
        process.exit();
    }
}

if(process.argv[2] == '--import'){
    importData();
} else if(process.argv[2] == '--delete'){
    deleteData();
}