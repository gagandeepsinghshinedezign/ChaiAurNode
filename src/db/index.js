import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import express from 'express';

const app=express();

console.log("Loaded DATABASE_URI:", process.env.DATABASE_URI);

const connectDB=async()=>{
    try{

        const connectionInstance=await mongoose.connect(`${process.env.DATABASE_URI}/${DB_NAME}`)
        console.log("connectionInstance--->",connectionInstance.connection.host)
        app.on("error",(error)=>{
            console.log("error--->",error)
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is running on port `,process.env.PORT)
        })

    }catch(error){
        console.log("ERROR in db:",error)
    }
}

export default connectDB