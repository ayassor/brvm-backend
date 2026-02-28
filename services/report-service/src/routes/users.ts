import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { getMe, updateMe, changePassword, getUserById } from '../controllers/userController';

const router = Router();
router.get('/me', requireAuth, getMe);
router.put('/me', requireAuth, updateMe);
router.put('/me/password', requireAuth, changePassword);
router.get('/:id', requireAdmin, getUserById);
export default router;
