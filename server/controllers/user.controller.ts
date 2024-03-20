require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import  userModel,{IUser} from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import Jwt, { Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
// register user

// interface
interface IRegistrationBody{
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

        const user:IRegistrationBody = {
            name,
            email,
            password
        };
        const activationToken = createActivationToken(user); // returning object with token and activationCode

        const activationCode = activationToken.activationCode; // getting activationCode from object

        const data = {user: {name: user.name}, activationCode};
        const html = await ejs.renderFile(path.join(__dirname, "../mails/activation-mail.ejs"), data);
        try {
            TODO:
            PROGRESS:
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

interface IActivationToken{
    token: string;
    activationCode: string;
}

export const createActivationToken = (user: any): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = Jwt.sign({
        user,activationCode
    },
        process.env.ACTIVATION_SECRET as Secret,{
            expiresIn: "5m"
        });
    return { token, activationCode };
}
