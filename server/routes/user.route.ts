import express from "express";
import { activateUser, getUserInfo, loginUser, logoutUser, registrationUser, socialAuth, updateAccessToken } from "../controllers/user.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

// router
const userRouter = express.Router();

userRouter.post("/registration", registrationUser);
// activation  request | POST
userRouter.post("/activate-user", activateUser);

// login request | POST || logout request | GET || refresh token | GET
userRouter.post("/login",loginUser);
userRouter.get("/logout", isAuthenticated , authorizeRoles("admin") ,logoutUser);
userRouter.get("/refresh", updateAccessToken);

// user profile
userRouter.get("/me", isAuthenticated, getUserInfo);

userRouter.post("/social-auth", socialAuth);


export default userRouter;