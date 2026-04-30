const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException" , err =>{
  console.log(err, err.name , "ERROR MESSAGE ->" ,err.message);
  console.log("UNCAUGHT EXCEPTION , SHUTTING DOWN ...")
  process.exit(1);
})

dotenv.config({path: `${__dirname}/config.env`});

const app = require("./app");


// defining and connection to our database
const DB = process.env.DATABASE.replace("<PASSWORD>" , process.env.DATABASE_PASSWORD);


mongoose.connect(DB)
.then(con => console.log("DB connected Successfully"))
.catch(err=> console.log(`DB connection Error: ${err}`));


const port = process.env.PORT || 3000;
// starting the server and listening for requests
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// safety net to handle all unhandled rejections globally
process.on("unhandledRejection" , err =>{
  console.log(err, err.name , err.message);
  console.log("UNHANDLED REJECTION , SHUTTING DOWN ...")
  server.close(()=>{
    process.exit(1);
  })
})


// 