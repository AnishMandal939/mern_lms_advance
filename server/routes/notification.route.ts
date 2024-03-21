import express from 'express';
import { getNotifications } from '../controllers/notification.controller';
import { authorizeRoles, isAuthenticated } from '../middleware/auth';
const notificationRoute = express.Router();

// routes
notificationRoute.get('/get-all-notifications', isAuthenticated, authorizeRoles("admin"), getNotifications);

export default notificationRoute;