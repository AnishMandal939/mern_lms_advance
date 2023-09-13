import express from "express";
import { activateUser, getUserInfo, loginUser, logoutUser, registrationUser, socialAuth, updateAccessToken, updateAvatar, updatePassword, updateUserInfo } from "../controllers/user.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { editCourse, getAllCourses, getSingleCourse, uploadCourse } from "../controllers/course.controller";

// router
const courseRouter = express.Router();

// create course
courseRouter.post("/create-course", isAuthenticated, authorizeRoles("admin"), uploadCourse);
courseRouter.put("/edit-course/:id", isAuthenticated, authorizeRoles("admin"), editCourse);
courseRouter.get("/get-course/:id", getSingleCourse);
courseRouter.get("/get-courses", getAllCourses);





export default courseRouter;