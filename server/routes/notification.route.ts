import express from 'express';
import { getNotifications, updateNotificationStatus } from '../controllers/notification.controller';
import { authorizeRoles, isAuthenticated } from '../middleware/auth';
const notificationRoute = express.Router();

// routes
notificationRoute.get('/get-all-notifications', isAuthenticated, authorizeRoles("admin"), getNotifications);
notificationRoute.put('/update-notification/:id', isAuthenticated, authorizeRoles("admin"), updateNotificationStatus);
export default notificationRoute;