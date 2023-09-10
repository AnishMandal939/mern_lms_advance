import express from "express";
import { activateUser, loginUser, logoutUser, registrationUser } from "../controllers/user.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

// router
const userRouter = express.Router();

userRouter.post("/registration", registrationUser);
// activation  request | POST
userRouter.post("/activate-user", activateUser);

userRouter.post("/login",loginUser);
userRouter.get("/logout", isAuthenticated , authorizeRoles("admin") ,logoutUser);

export default userRouter;