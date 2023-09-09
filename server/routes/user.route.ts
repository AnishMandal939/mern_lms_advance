import express from "express";
import { activateUser, loginUser, logoutUser, registrationUser } from "../controllers/user.controller";

// router
const userRouter = express.Router();

userRouter.route("/registration").post(registrationUser);
// activation  request | POST
userRouter.route("/activate-user").post(activateUser);

userRouter.route("/login").post(loginUser);
userRouter.route("/logout").get(logoutUser);

export default userRouter;