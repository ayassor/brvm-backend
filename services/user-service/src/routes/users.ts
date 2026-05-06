import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { getMe, updateMe, changePassword, getUserById } from '../controllers/userController';
import {
  listUsers,
  grantCourseAccess,
  revokeCourseAccess,
  listUserCourseAccess,
} from '../controllers/adminController';

const router = Router();

// User self-service
router.get('/me', requireAuth, getMe);
router.put('/me', requireAuth, updateMe);
router.put('/me/password', requireAuth, changePassword);

// Admin — user management
router.get('/admin/users', requireAdmin, listUsers);
router.get('/admin/users/:id/course-access', requireAdmin, listUserCourseAccess);
router.post('/admin/users/:id/course-access', requireAdmin, grantCourseAccess);
router.delete('/admin/users/:id/course-access/:courseId', requireAdmin, revokeCourseAccess);

// Admin — get user by id (existing)
router.get('/:id', requireAdmin, getUserById);

export default router;
