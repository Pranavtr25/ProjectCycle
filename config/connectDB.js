const mongoose = require("mongoose");

const connectDB=async () =>{
    try{
        await mongoose.connect(process.env.mongo_URL)
        console.log("connected database successffully")
    }
    catch(error){
        console.log(`error in connecting database \n${error}`);
    }
}

module.exports=connectDB;

