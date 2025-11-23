import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'

export const verifyJwt=asyncHandler(async(req,res,next)=>{
    try {
        const accessToken=req.cookies.accessToken||req.header("Authorization")?.replace("Bearer ","");
    
        if(!accessToken){
            throw new ApiError(401,"Unauthorized ")
        }
        
        const decodeToken=await jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)
    
        const user=await User.findById(decodeToken?._id);
    
        if(!user){
            throw new ApiError(401,"Invalid access token.")
        }
    
        req.user=user;
    
        next();
    
    } catch (error) {
        throw new ApiError(500,"Something went wrong when try to get access token.")
        
    }

})