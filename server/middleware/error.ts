import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";

export const ErrorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500; // 500 - internal server error
    err.message = err.message || "Internal Server Error";

    // if (process.env.NODE_ENV === "DEVELOPMENT") {
    //     res.status(err.statusCode).json({
    //         success: false,
    //         error: err,
    //         errMessage: err.message,
    //         stack: err.stack
    //     });
    // }

    // wrong mongodb id error
    if (err.name === "CastError") {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // duplicate mongodb key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(message, 400);
    }

    // wrong jwt error
    if (err.name === "JsonWebTokenError") {
        const message = `JSON Web Token is invalid. Try again!!!`;
        err = new ErrorHandler(message, 400);
    }

    // JWt expired error
    if (err.name === "TokenExpiredError") {
        const message = `JSON Web Token is expired. Try again!!!`;
        err = new ErrorHandler(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
};