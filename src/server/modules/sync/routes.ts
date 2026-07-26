import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { syncController } from './controller/index.js';

const router = Router();

router.use(authenticate);

// GET  /sync/pull?deviceId=xxx&lastVersion=0&limit=100
router.get('/pull', syncController.pull.bind(syncController));

// GET  /sync/state?deviceId=xxx
router.get('/state', syncController.getState.bind(syncController));

// POST /sync/ack — acknowledge processed sync version
router.post('/ack', syncController.acknowledge.bind(syncController));

export default router;
