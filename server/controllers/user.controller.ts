require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import Jwt, { JwtPayload, Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import { accessTokenOptions, refreshTokenOptions, sendToken } from "../utils/jwt";
import { redis } from "../utils/redis";
import { getAllUsersService, getUserById, updateUserRoleService } from "../services/user.service";
import { v2 as cloudinary } from "cloudinary";
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

        // delete session from redis
        const userId = req.user?._id || "";
        // console.log(userId)
        redis.del(userId);

        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})


// update access token
export const updateAccessToken = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        // get refresh token
        const refresh_token = req.cookies.refresh_token as string;
        // verify refresh token
        const decoded = Jwt.verify(refresh_token, process.env.REFRESH_TOKEN as string) as JwtPayload;

        const message = "Could not refresh token, please login again";
        // check if refresh token is valid - refresh token will expire after 3 days - so we need to check if it is expired or not
        if (!decoded) {
            return next(new ErrorHandler(message, 401));
        };

        // check session
        const session = await redis.get(decoded.id as string);

        if (!session) {
            return next(new ErrorHandler(message, 401));
        };

        // create new access token
        const user = JSON.parse(session);
        // make access token
        const accessToken = Jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN as string, { expiresIn: "5m" });

        // refresh token creation
        const refreshToken = Jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN as string, { expiresIn: "3d" });

        // setting token in user
        req.user = user;

        // set cookies
        res.cookie("access_token", accessToken, accessTokenOptions);
        res.cookie("refresh_token", refreshToken, refreshTokenOptions);

        res.status(200).json({
            status: "success",
            accessToken
        })


    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

// get user info
export const getUserInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id;
        getUserById(userId, res);
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

// social auth - backend -nextAuth(Frontend)
interface ISocialAuthBody {
    email: string;
    name: string;
    avatar: string;
}
export const socialAuth = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, name, avatar } = req.body as ISocialAuthBody;
        const user = await userModel.findOne({ email: email });
        if (!user) {
            const newUser = await userModel.create({
                name,
                email,
                avatar
            });
            sendToken(newUser, 200, res);
        }
        else {
            sendToken(user, 200, res);
        }
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// update user info
interface IUpdateUserInfo {
    name?: string;
    email?: string;
};
export const updateUserInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email } = req.body as IUpdateUserInfo;
        const userId = req.user?._id;

        const user = await userModel.findById(userId);
        // searching if exist email is already in database
        if (email && user) {
            const isEmailExist = await userModel.findOne({ email: email });
            if (isEmailExist) {
                return next(new ErrorHandler("Email already exists", 400));
            }
            user.email = email;
        }
        if (name && user) {
            user.name = name;
        }
        await user?.save();
        await redis.set(userId, JSON.stringify(user));
        res.status(200).json({
            success: true,
            user
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));

    }
});

// update user password
interface IUpdatePassword {
    oldPassword: string;
    newPassword: string;
}
export const updatePassword = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { oldPassword, newPassword } = req.body as IUpdatePassword;

        // for social login user - not have old password
        if (!oldPassword || !newPassword) {
            return next(new ErrorHandler("Please enter old and new password", 400));
        }

        const user = await userModel.findById(req.user?._id).select("+password");

        // validate if social login user - since social login user does not have password
        if (user?.password === undefined) {
            return next(new ErrorHandler("Please login with your social account | Invalid User", 400));
        }
        // check if old password is correct
        const isPasswordMatched = await user?.comparePassword(oldPassword);
        if (!isPasswordMatched) {
            return next(new ErrorHandler("Invalid Old password is incorrect", 400));
        }
        // update password
        user.password = newPassword;
        await user?.save();
        await redis.set(user?._id, JSON.stringify(user));
        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });

        // user!.password = newPassword;
        // await user?.save();
        // await redis.set(user?._id, JSON.stringify(user));
        // res.status(200).json({
        //     success: true,
        //     message: "Password updated successfully"
        // });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// update profile picture | avatar
interface IUpdateAvatar {
    avatar: string;
}
export const updateAvatar = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { avatar } = req.body as IUpdateAvatar;

        const userId = req.user?._id;

        const user = await userModel.findById(userId);

        if (avatar && user) {
            if (user?.avatar?.public_id) {
                // delete previous avatar
                await cloudinary.uploader.destroy(user?.avatar?.public_id); // delete previous avatar
                // create new avatar
                const myCloud = await cloudinary.uploader.upload(avatar, {
                    folder: "avatars",
                    width: 150,
                });
                user.avatar = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url
                }
            } else {
                // create new avatar
                const myCloud = await cloudinary.uploader.upload(avatar, {
                    folder: "avatars",
                    width: 150,
                });
                user.avatar = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url
                }
            }
        }

        await user?.save();
        await redis.set(userId, JSON.stringify(user));

        res.status(200).json({
            success: true,
            message: "Avatar updated successfully",
            user
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
    // console.log(updateAvatar)
});

// get all users -- only admin can access this route
export const getAllUsers = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        getAllUsersService(res);
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// update user role -- only admin can access this route
export const updateUserRole = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, role } = req.body;
        updateUserRoleService(id, role, res);
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// forgot password  -- user
interface IForgotPassword {
    email: string;
}
export const forgotPassword = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        // TODO: send email to user with reset password link
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// reset password  -- user
export const resetPassword = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        //    TODO:  
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// delete user -- admin
export const deleteUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const user = await userModel.findById(id);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }
        // remove avatar from cloudinary
        if (user.avatar?.public_id) {
            await cloudinary.uploader.destroy(user.avatar.public_id);
        }
        await user.deleteOne({ id });
        // delete fron redis
        await redis.del(id);
        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// forgot password is for user - reset password is for admin