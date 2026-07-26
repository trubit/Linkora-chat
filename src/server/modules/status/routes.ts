import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { statusController } from './controller/index.js';
import { statusCreateLimiter } from '../../security/notificationRateLimit.js';

const router = Router();

router.use(authenticate);

// GET  /status/feed — contact statuses feed (grouped by user)
router.get('/feed', statusController.getFeed.bind(statusController));

// GET  /status/me — my own active statuses
router.get('/me', statusController.getMyStatuses.bind(statusController));

// POST /status — create a new status (rate-limited: 5/hour)
router.post('/', statusCreateLimiter, statusController.createStatus.bind(statusController));

// GET  /status/:id — get a single status
router.get('/:id', statusController.getStatus.bind(statusController));

// POST /status/:id/view — mark a status as viewed
router.post('/:id/view', statusController.viewStatus.bind(statusController));

// POST /status/:id/react — react with emoji
router.post('/:id/react', statusController.reactToStatus.bind(statusController));

// GET  /status/:id/views — get list of viewers (owner only)
router.get('/:id/views', statusController.getStatusViews.bind(statusController));

// POST /status/:id/reply — reply to a status
router.post('/:id/reply', statusController.replyToStatus.bind(statusController));

// DELETE /status/:id
router.delete('/:id', statusController.deleteStatus.bind(statusController));

export default router;
