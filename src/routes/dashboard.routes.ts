import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Only ADMIN and ANALYST can view the dashboard summaries
router.get('/summary', authenticate, authorize(['ADMIN', 'ANALYST']), getDashboardSummary);

export default router;