
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv"
import { DB_NAME } from "./constants.js";
import { app } from "./app.js";

console.log("db name--->",DB_NAME)


// Resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from parent folder of src
 dotenv.config({ path: path.resolve(__dirname, "../.env") });
console.log("env--->",process.env.DATABASE_URI)

const { default: connectDB } = await import("./db/index.js");


connectDB().then(()=>{
    app.listen(process.env.PORT||8000,()=>{
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