import NotificationModel from "../models/notificationModel";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import { ErrorMiddleware } from "../middleware/error";
import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import cron from "node-cron";

// get all notifications -- only admin can access this route
export const getNotifications = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notifications = await NotificationModel.find().sort({ createdAt: -1 });

        res.status(201).json({
            success: true,
            notifications
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});


// update notification status -- only admin can access this route
export const updateNotificationStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notification = await NotificationModel.findById(req.params.id);
        if (!notification) {
            return next(new ErrorHandler('Notification not found', 404));
        } else {
            notification.status ? notification.status = 'read' : notification.status;
        }
        await notification.save();

        // for frontend state to change the status of the notification
        const notifications = await NotificationModel.find().sort({ createdAt: -1 });
        res.status(201).json({
            success: true,
            notifications
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));

    }
});

// cron job to delete notifications after 30 days - only admin

// call every day midnight
cron.schedule("0 0 0 * * *", async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago 
    await NotificationModel.deleteMany({ status: "read", createdAt: { $lt: thirtyDaysAgo } });
    console.log("Deleted notifications older than 30 days");
    // try {
    //     await NotificationModel.deleteMany({ createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });
    // } catch (error: any) {
    //     console.log(error);
    // }
}
);
// test
// cron.schedule("*/5 * * * * *", function(){
//     console.log("------------");
//     console.log("Running Cron Job");
// })