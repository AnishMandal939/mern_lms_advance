import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import OrderModel, {IOrder} from "../models/orderModel";
import userModel from "../models/user.model";
import courseModel from "../models/course.model";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notificationModel";
import { newOrder } from "../services/order.service";

export const createOrder = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {courseId, payment_info} = req.body as IOrder;

        // find user
        const user = await userModel?.findById(req.user?._id);

        // search is logged in user already purchased this course or not if yes then throw error
        const courseExistInUser = user?.courses.some((course: any) => course._id.toString() === courseId);

        if(courseExistInUser){
            return next(new ErrorHandler("You already purchased this course", 400));
        }

        // else purchase course proceed
        const course = await courseModel?.findById(courseId);

        if(!course){
            return next(new ErrorHandler("Course not found", 404));
        }

        const data: any =  {
            courseId: course._id,
            userId: user?._id,
            payment_info
        }

        const mailData = {
            order: {
                _id: course._id.toString().slice(0,6),
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'}),
            }
        }

        const html = await ejs.renderFile(path.join(__dirname, "../mails/order-confirmation.ejs"), {order: mailData});

        try {
            if(user){
                await sendMail({
                    email: user.email,
                    subject: "Order Confirmation",
                    template: "order-confirmation",
                    data: mailData,
                });
            }
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }

        // after purchase update user courses
        user?.courses.push(course?._id);

        await user?.save();

        await NotificationModel.create({
            user: user?._id,
            title: "New Order",
            message: `You have a new order from ${course?.name}`
        });
        // update purchase number
        course.purchased ? course.purchased +=  1 : course.purchased;
        await course?.save();

        newOrder(data, res, next);

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
    
});