import express from "express";
import { activateUser, getUserInfo, loginUser, logoutUser, registrationUser, socialAuth, updateAccessToken, updateAvatar, updatePassword, updateUserInfo } from "../controllers/user.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { addAnswer, addQuestion, addReview, editCourse, getAllCourse, getAllCourses, getCourseByUser, getSingleCourse, replyToReview, uploadCourse } from "../controllers/course.controller";

// router
const courseRouter = express.Router();

// create course
courseRouter.post("/create-course", isAuthenticated, authorizeRoles("admin"), uploadCourse);
courseRouter.put("/edit-course/:id", isAuthenticated, authorizeRoles("admin"), editCourse);
courseRouter.get("/get-course/:id", getSingleCourse);
courseRouter.get("/get-courses", getAllCourses);
courseRouter.get("/get-course-content/:id",isAuthenticated, getCourseByUser);
courseRouter.put("/add-question",isAuthenticated, addQuestion);
courseRouter.put("/add-answer",isAuthenticated, addAnswer);
courseRouter.put("/add-review/:id",isAuthenticated, addReview);
// replies on review
courseRouter.put("/add-reply",isAuthenticated, authorizeRoles("admin"), replyToReview);


courseRouter.get("/get-courses",isAuthenticated, authorizeRoles("admin"), getAllCourse);






export default courseRouter;