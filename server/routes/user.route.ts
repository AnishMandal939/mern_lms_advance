import express from "express";
import { registrationUser } from "../controllers/user.controller";

// router
const userRouter = express.Router();

userRouter.route("/registration").post(registrationUser);

export default userRouter;