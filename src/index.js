
// 1. method

import './config.js'

import { DB_NAME } from "./constants.js";
// import connectDB from "./db/index.js"; // normal import (preferred)
import { app } from "./app.js";


const { default: connectDB } = await import("./db/index.js");
connectDB().then(()=>{
    app.listen(process.env.PORT||5000,()=>{
        console.log(`Server is running on Port ${process.env.PORT}`)
    })
}).catch((error)=>{
    console.log("Mongo db connection failed !!",error)
})



/*
import express from 'express'

const app=express();

(async()=>{
    console.log("inside async")
    try{
        console.log("inside async")
        const connectionInstance=await mongoose.connect(`${process.env.DATABASE_URI}/${DB_NAME}`)
        console.log("connectionInstance--->",connectionInstance.connection.host)
        app.on("error",(error)=>{
            console.log("error:->",error)
            throw error;
        })
        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port-->`,process.env.PORT)
        })

    }catch(error){
        console.log("error-->",error)
    }
})()
    */

