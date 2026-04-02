import { Router } from 'express';
import { createRecord, getRecords, updateRecord, deleteRecord } from '../controllers/record.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// All record routes require the user to be logged in
router.use(authenticate);

// Admins only for mutations
router.post('/', authorize(['ADMIN']), createRecord);
router.put('/:id', authorize(['ADMIN']), updateRecord);
router.delete('/:id', authorize(['ADMIN']), deleteRecord);

// Admins, Analysts, and Viewers can read
router.get('/', authorize(['ADMIN', 'ANALYST', 'VIEWER']), getRecords);

export default router;