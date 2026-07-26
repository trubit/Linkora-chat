import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { searchController } from './controller/index.js';
import { searchLimiter } from '../../security/notificationRateLimit.js';

const router = Router();

router.use(authenticate);
router.use(searchLimiter);

// GET /search?q=...&types=user,group&page=1&limit=20
router.get('/', searchController.search.bind(searchController));

// GET /search/suggestions?q=...
router.get('/suggestions', searchController.getSuggestions.bind(searchController));

export default router;
