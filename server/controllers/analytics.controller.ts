import { Request, Response, NextFunction } from 'express';
import ErrorHandler from '../utils/ErrorHandler';
import { CatchAsyncError } from '../middleware/catchAsyncError';
import { generateLast12MonthsData } from '../utils/analytics.generator';
import userModel from '../models/user.model';
import courseModel from '../models/course.model';
import OrderModel from '../models/orderModel';

// get user data analytics - how many user created -- only admin
export const getUserAnalytics = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await generateLast12MonthsData(userModel);
        res.status(200).json({
            success: true,
            users
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// get course data analytics - how many course created -- only admin
export const getCourseAnalytics = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courses = await generateLast12MonthsData(courseModel);
        res.status(200).json({
            success: true,
            courses
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// get order data analytics - how many order created -- only admin
export const getOrderAnalytics = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await generateLast12MonthsData(OrderModel);
        res.status(200).json({
            success: true,
            orders
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// get all data analytics - only admin
export const getAllDataAnalytics = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await generateLast12MonthsData(userModel);
        const courses = await generateLast12MonthsData(courseModel);
        const orders = await generateLast12MonthsData(OrderModel);
        res.status(200).json({
            success: true,
            users,
            courses,
            orders
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});