require("dotenv").config(); // load .env file
import { Response } from "express";
import { IUser } from "../models/user.model";
import Jwt, { Secret } from "jsonwebtoken";
import { redis } from "./redis";

// interface
interface ITokenOptions{
    expiresIn: Date;
    maxAge: number;
    httpOnly: boolean;
    sameSite: 'lax' | 'strict' | 'none' | undefined;
    secure?: boolean;
}

// create access token
export const sendToken = (user: IUser, statusCode: number, res: Response) => {
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();

    // upload session to redis
    // redis.set(refreshToken, user._id.toString(), "EX", 60 * 60 * 24 * 30); // 30 days
    redis.set(user._id, JSON.stringify(user) as any); // 30 days

    // parse env variable to integrate with fallback values
    const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || "300", 10);
    const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || "1200", 10);

    // options for cookies
    const accessTokenOptions: ITokenOptions = {
        expiresIn: new Date(Date.now() + accessTokenExpire * 1000),
        maxAge: accessTokenExpire * 1000,
        httpOnly: true,
        sameSite: "lax",
        // secure: process.env.NODE_ENV === "production" ? true : false,
    };

    const refreshTokenOptions: ITokenOptions = {
        expiresIn: new Date(Date.now() + refreshTokenExpire * 1000),
        maxAge: refreshTokenExpire * 1000,
        httpOnly: true,
        sameSite: "lax",
        // secure: process.env.NODE_ENV === "production" ? true : false,
    };

    // only set secure to true in production
    if (process.env.NODE_ENV === "production") {
        accessTokenOptions.secure = true;
        // refreshTokenOptions.secure = true;
    }

    // set cookies
    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);

    // send response
    res.status(statusCode).json({
        success: true,
        accessToken,
        user,
    });

   
};