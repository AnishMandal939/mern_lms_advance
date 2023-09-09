require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import Jwt, { Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import { sendToken } from "../utils/jwt";
// register user

// interface
interface IRegistrationBody {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

export const registrationUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password, avatar } = req.body;
        const isEmailExist: IUser | null = await userModel.findOne({ email: email });
        if (isEmailExist) {
            return next(new ErrorHandler("Email already exists", 400));
        }

        const user: IRegistrationBody = {
            name,
            email,
            password
        };
        const activationToken = createActivationToken(user); // returning object with token and activationCode

        const activationCode = activationToken.activationCode; // getting activationCode from object

        const data = { user: { name: user.name }, activationCode };
        const html = await ejs.renderFile(path.join(__dirname, "../mails/activation-mail.ejs"), data);
        try {
            await sendMail({
                email: user.email,
                subject: "Account activation",
                template: "activation-mail",
                // data: { user: { name: user.name }, activationCode },
                data,
            });
            res.status(201).json({
                success: true,
                message: `Please check your email to activate your account ${user.email}`,
                activationToken: activationToken.token,
            });

        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400))
        }

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
});

interface IActivationToken {
    token: string;
    activationCode: string;
}

export const createActivationToken = (user: any): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = Jwt.sign({
        user, activationCode
    },
        process.env.ACTIVATION_SECRET as Secret, {
        expiresIn: "5m"
    });
    return { token, activationCode };
}


// user activation | activate user
interface IActivationRequest {
    activation_token: string;
    activation_code: string;
}

export const activateUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { activation_token, activation_code } = req.body as IActivationRequest;

        const newUser: { user: IUser, activationCode: string } = Jwt.verify(
            activation_token,
            process.env.ACTIVATION_SECRET as string,
        ) as { user: IUser, activationCode: string };

        // check activation code is valid | matched that is sent to email

        if (newUser.activationCode !== activation_code) {
            return next(new ErrorHandler("Invalid activation code", 400));
        }

        // otherwise
        const { name, email, password } = newUser.user;
        const existUser = await userModel.findOne({ email: email });
        if (existUser) {
            return next(new ErrorHandler("Email already exists", 400));
        }
        // get user
        const user = await userModel.create({
            name,
            email,
            password,
        });
        // send response
        res.status(201).json({
            success: true,
            message: "Account activated successfully",
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// login user
interface ILoginRequest {
    email: string;
    password: string;
}

export const loginUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body as ILoginRequest;
        // check if email and password is entered by user
        if (!email || !password) {
            return next(new ErrorHandler("Please enter email & password", 400));
        }
        // find user in database
        const user = await userModel.findOne({ email: email }).select("+password"); // select password field also - since it is not selected by default
        if (!user) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }
        // check if password is correct
        const isPasswordMatched = await user.comparePassword(password);
        if (!isPasswordMatched) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }
        // check if user is verified
        // if(!user.isVerified){
        //     return next(new ErrorHandler("Please verify your email to login", 401));
        // }
        // send token
        sendToken(user, 200, res);
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// logout user

export const logoutUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.cookie("access_token", "", { maxAge: 1 });
        res.cookie("refresh_token", "", { maxAge: 1 });

        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})