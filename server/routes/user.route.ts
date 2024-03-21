import express from "express";
import { activateUser, getUserInfo, loginUser, logoutUser, registrationUser, socialAuth, updateAccessToken, updateAvatar, updatePassword, updateUserInfo } from "../controllers/user.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { getAllUsers } from "../controllers/user.controller";

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

userRouter.put("/update-user-info",isAuthenticated, updateUserInfo);
userRouter.put("/update-user-password",isAuthenticated, updatePassword);
userRouter.put("/update-user-avatar",isAuthenticated, updateAvatar);

// get all usrs
userRouter.get("/get-users", isAuthenticated, authorizeRoles("admin"), getAllUsers);





export default userRouter;