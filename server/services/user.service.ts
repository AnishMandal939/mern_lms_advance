import { Response } from "express";
// import userModel from "../models/user.model"
import { redis } from "../utils/redis";
import userModel from "../models/user.model";

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

// get all users -- only admin can access this route
export const getAllUsersService = async(res: Response) => {
    const users = await userModel.find().sort({createdAt: -1}); // from mongodb
    // const usersJson = await redis.get("users"); // from redis - since we store users in redis after fetching from mongodb
    // if(users){
    //     const user = JSON.parse(users as any);
    //     res.status(201).json({
    //         success: true,
    //         user
    //     });
    // }
    res.status(201).json({
        success: true,
        users
    });
}

// update user role -- only for admin
export const updateUserRoleService = async(id: string, role: string, res: Response) => {
    const user = await userModel.findByIdAndUpdate(id, {role}, {new: true}); // from mongodb
    if(!user){
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }
    user.role = role;
    await user.save();
    res.status(201).json({
        success: true,
        user
    });
}