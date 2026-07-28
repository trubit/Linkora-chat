import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { notificationController } from './controller/index.js';
import { notificationReadLimiter } from '../../security/notificationRateLimit.js';

const router = Router();

router.use(authenticate);
router.use(notificationReadLimiter);

// GET /notifications — paginated list
router.get('/', notificationController.getNotifications.bind(notificationController));

// GET /notifications/unread-count
router.get('/unread-count', notificationController.getUnreadCount.bind(notificationController));

// GET /notifications/stats
router.get('/stats', notificationController.getStats.bind(notificationController));

// POST /notifications/read — mark one or more (or all) as read
router.post('/read', notificationController.markRead.bind(notificationController));

// DELETE /notifications — delete all
router.delete('/', notificationController.deleteAllNotifications.bind(notificationController));

// GET /notifications/:id
router.get('/:id', notificationController.getNotification.bind(notificationController));

// POST /notifications/:id/archive
router.post(
  '/:id/archive',
  notificationController.archiveNotification.bind(notificationController),
);

// DELETE /notifications/:id
router.delete('/:id', notificationController.deleteNotification.bind(notificationController));

export default router;
