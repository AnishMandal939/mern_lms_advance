import { Response } from "express";
// import userModel from "../models/user.model"
import { redis } from "../utils/redis";

// get user id
export const getUserById = async(id: string, res: Response) => {
    // const user = await userModel.findById(id); // from mongodb
    const userJson = await redis.get(id); // from redis - since we store user in redis after login
    if(userJson){
        const user = JSON.parse(userJson as any);
        // if(!user){
        //     return res.status(404).json({
        //         success: false,
        //         message: "User not found"
        //     });
        // }
        res.status(201).json({
            success: true,
            user
        });
    }
};