require("dotenv").config(); // load .env file
import express, { Request, Response, NextFunction } from 'express';
export const app = express();
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ErrorMiddleware } from './middleware/error';
import userRouter from './routes/user.route';
import courseRouter from './routes/course.route';
import orderRouter from './routes/order.route';
import notificationRouter from './routes/notification.route';
import analyticsRouter from './routes/analytics.route';
import layoutRouter from './routes/layout.route';


// make bodyParser available globally
app.use(express.json({ limit: '50mb' })); // for parsing application/json (limit to 50mb) , cloudinary images are base64 encoded

// make cookie-parser available globally - for parsing cookies - used for authentication and authorization, sync
app.use(cookieParser());

// make cors available globally - for cross origin resource sharing - sync
app.use(cors({ credentials: true, origin: process.env.ORIGIN }));


// router ===========================
app.use('/api/v1', userRouter, courseRouter, orderRouter, notificationRouter, analyticsRouter, layoutRouter);

// routes ===========================



// make routes available globally - testing api
app.get('/test', (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        success: true,
        message: 'Hello World!'
    });
});


// unknown route handler
app.all('*', (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Can't find ${req.originalUrl} on this server!`) as any; // typecasting, since Error has no statusCode property
    res.status(404).json({
        success: false,
        message: 'Route not found',
        error: err.message
    });
    err.statusCode = 404;
    next(err);
});


// error handler
app.use(ErrorMiddleware);