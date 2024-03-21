import { NextFunction, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import OrderModel from "../models/orderModel";

// create new order
export const newOrder = CatchAsyncError(async (data: any, res: Response, next: NextFunction) => {
    const order = await OrderModel.create(data);
    res.status(200).json({
        success: true,
        order
    });
    
});

// get all orders -- only admin can access this route
export const getAllOrderService = async(res: Response) => {
    const courses = await OrderModel.find().sort({createdAt: -1}); // from mongodb
    res.status(201).json({
        success: true,
        courses
    });
}