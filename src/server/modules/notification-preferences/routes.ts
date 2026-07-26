import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { notificationPreferenceController } from './controller/index.js';

const router = Router();

router.use(authenticate);

// GET  /notification-preferences — fetch current user's preferences
router.get(
  '/',
  notificationPreferenceController.getPreferences.bind(notificationPreferenceController),
);

// PATCH /notification-preferences — update preferences
router.patch(
  '/',
  notificationPreferenceController.updatePreferences.bind(notificationPreferenceController),
);

// POST /notification-preferences/reset — reset to defaults
router.post(
  '/reset',
  notificationPreferenceController.resetToDefaults.bind(notificationPreferenceController),
);

// POST /notification-preferences/mute — mute a conversation/group/community/channel
router.post(
  '/mute',
  notificationPreferenceController.muteEntity.bind(notificationPreferenceController),
);

// POST /notification-preferences/unmute — unmute
router.post(
  '/unmute',
  notificationPreferenceController.unmuteEntity.bind(notificationPreferenceController),
);

export default router;
