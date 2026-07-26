import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    version: 'v1',
    endpoints: {
      auth: [
        'POST /auth/register',
        'POST /auth/login',
        'POST /auth/logout',
        'POST /auth/refresh',
        'GET  /auth/me',
      ],
      notifications: [
        'GET  /notifications',
        'GET  /notifications/unread-count',
        'GET  /notifications/stats',
        'POST /notifications/read',
        'GET  /notifications/:id',
        'POST /notifications/:id/archive',
        'DELETE /notifications/:id',
        'DELETE /notifications',
      ],
      notificationPreferences: [
        'GET  /notification-preferences',
        'PATCH /notification-preferences',
        'POST /notification-preferences/reset',
        'POST /notification-preferences/mute',
        'POST /notification-preferences/unmute',
      ],
      status: [
        'GET  /status/feed',
        'GET  /status/me',
        'POST /status',
        'GET  /status/:id',
        'POST /status/:id/view',
        'POST /status/:id/react',
        'GET  /status/:id/views',
        'POST /status/:id/reply',
        'DELETE /status/:id',
      ],
      search: ['GET /search', 'GET /search/suggestions'],
      sync: ['GET /sync/pull', 'GET /sync/state', 'POST /sync/ack'],
      messages: [
        'GET  /messages',
        'POST /messages',
        'GET  /messages/:id',
        'PATCH /messages/:id',
        'DELETE /messages/:id',
        'POST /messages/:id/react',
        'POST /messages/:id/read',
        'POST /messages/:id/delivered',
      ],
      conversations: ['GET /conversations', 'POST /conversations', 'GET /conversations/:id'],
      friends: [
        'GET  /friends',
        'POST /friends/:userId/request',
        'POST /friends/:userId/accept',
        'POST /friends/:userId/reject',
        'DELETE /friends/:userId',
      ],
      groups: ['GET /groups', 'POST /groups', 'GET /groups/:id'],
      communities: ['GET /communities', 'POST /communities', 'GET /communities/:id'],
      calls: ['POST /calls', 'GET /calls/:id', 'PUT /calls/:id/end'],
      media: ['POST /media/upload', 'GET /media/:id', 'DELETE /media/:id'],
      profile: ['GET /profile/:username', 'PATCH /profile'],
      presence: ['GET /presence/:userId', 'PUT /presence'],
    },
  });
});

export default router;
