import { Router } from 'express';
import { getUsers, updateUser } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ONLY Admins can view and manage users
router.get('/', authorize(['ADMIN']), getUsers);
router.patch('/:id', authorize(['ADMIN']), updateUser);

export default router;