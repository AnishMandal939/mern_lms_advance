import express from 'express';
import { getAllDataAnalytics, getCourseAnalytics, getOrderAnalytics, getUserAnalytics } from '../controllers/analytics.controller';
import { authorizeRoles, isAuthenticated } from '../middleware/auth';
const analyticsRouter = express.Router();

analyticsRouter.get('/get-users-analytics',isAuthenticated, authorizeRoles("admin"), getUserAnalytics);
analyticsRouter.get('/get-courses-analytics',isAuthenticated, authorizeRoles("admin"), getCourseAnalytics);
analyticsRouter.get('/get-orders-analytics',isAuthenticated, authorizeRoles("admin"), getOrderAnalytics);
analyticsRouter.get('/get-all-analytics',isAuthenticated, authorizeRoles("admin"), getAllDataAnalytics);

export default analyticsRouter;