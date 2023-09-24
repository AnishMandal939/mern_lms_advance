import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { createCourse } from "../services/course.service";
import courseModel from "../models/course.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";


// upload course
export const uploadCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses"
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }
        createCourse(data, res, next);
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// edit course
export const editCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            await cloudinary.v2.uploader.destroy(data.thumbnail.public_id); // delete old thumbnail

            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses"
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }

        // update course - findByIdAndUpdate
        const courseId = req.params.id;
        const course = await courseModel.findByIdAndUpdate(courseId, {
            $set: data
        },
            {
                new: true,
                // runValidators: true,
                // useFindAndModify: false
            });
        res.status(201).json({
            success: true,
            course
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// get single course - without purchasing | GET /api/v1/course/:id
export const getSingleCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        // receive data - for caching
        const courseId = req.params.id;
        const isCacheExist: any = await redis.get(courseId);
        console.log("hitting redis", isCacheExist); // this will show you all data of course - if exist in cache


        if (isCacheExist) {
            const course = JSON.parse(isCacheExist);
            res.status(200).json({
                success: true,
                course
            });
        } else {
            // const course = await courseModel.findById(req.params.id); // this provides you all data of course , to secure data use select method
            const course = await courseModel.findById(req.params.id).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"); // this provides you all data of course , to secure data use select method
            console.log("hitting mongodb", course); // this will show you all data of course
            // caching to handle multiple request for same course - without purchasing
            await redis.set(courseId, JSON.stringify(course)); // set cache
            res.status(200).json({
                success: true,
                course
            });
        }


    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// get all courses - without purchase | GET /api/v1/courses
export const getAllCourses = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const isCacheExist: any = await redis.get("allCourses");
        if (isCacheExist) {
            const courses = JSON.parse(isCacheExist);
            console.log("hitting redis");
            res.status(200).json({
                success: true,
                courses
            });
        } else {
            const courses = await courseModel.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"); // this provides you all data of course , to secure data use select method
            console.log("hitting mongo");
            await redis.set("allCourses", JSON.stringify(courses)); // set cache
            res.status(200).json({
                success: true,
                courses
            });
        }

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// get course content -- only for valid user
export const getCourseByUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        // get user courses
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;
        // check if user has purchased this course
        const courseExist = userCourseList?.find((course: any) => course._id.toString() === courseId.toString());
        if (!courseExist) {
            return next(new ErrorHandler("You have not purchased/ eligible to this course", 400));
        }
        // get course
        const course = await courseModel.findById(courseId);
        // get course content
        const content = course?.courseData;
        res.status(200).json({
            success: true,
            course, content
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// add question in course
interface IAddQuestionData {
    question: string;
    courseId: string;
    contentId: string;
}

export const addQuestion = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { question, courseId, contentId }: IAddQuestionData = req.body;
        // get course
        const course = await courseModel.findById(courseId);

        // checking if course exist or not with valid id
        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("Invalid content id", 400));
        }
        // get course content
        const courseContent = course?.courseData?.find((content: any) => content._id.equals(contentId));
        if (!courseContent) {
            return next(new ErrorHandler("Invalid content id", 400));
        }
        // add question | create new question object
        const newQuestion: any = {
            user: req.user,
            question,
            questionReplies: [],
        }

        // add these question in course content
        courseContent.questions.push(newQuestion);

        // save course
        await course?.save();
        res.status(200).json({
            success: true,
            course
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// add answer in question
interface IAddAnswerData {
    answer: string;
    courseId: string;
    contentId: string;
    questionId: string;
}

export const addAnswer = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { answer, courseId, contentId, questionId }: IAddAnswerData = req.body;
        // get course
        const course = await courseModel.findById(courseId);

        // checking if course exist or not with valid id
        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("Invalid content id", 400));
        }
        // get course content
        const courseContent = course?.courseData?.find((content: any) => content._id.equals(contentId));
        if (!courseContent) {
            return next(new ErrorHandler("Invalid content id", 400));
        }
        // get question
        const question = courseContent.questions.find((question: any) => question._id.equals(questionId));
        if (!question) {
            return next(new ErrorHandler("Invalid question id", 400));
        }
        // add answer | create new answer object
        const newAnswer: any = {
            user: req.user,
            answer,
        }

        // add these answer in question
        question.questionReplies?.push(newAnswer);

        // save course
        await course?.save();
        if (req.user?._id === question.user._id) {
            //create reply notification here
        } else {
            // send email
            const data = {
                name: question.user.name,
                title: courseContent.title,
            }
            const html = await ejs.renderFile(path.join(__dirname, "../mails/question-reply.ejs"), data);

            try {
                await sendMail({
                    email: question.user.email,
                    subject: "Question Reply",
                    template: "question-reply",
                    data,
                })
            } catch (error: any) {
                return next(new ErrorHandler(error.message, 500));
            }
        }
        res.status(200).json({
            success: true,
            course
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});