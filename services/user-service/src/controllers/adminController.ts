import { Response } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { CourseAccess } from '../models/CourseAccess';

// GET /admin/users — list all users with optional search + pagination
export async function listUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search) {
      where[Op.or as any] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: ['id', 'name', 'email', 'role', 'subscription_type', 'is_active', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: limitNum,
      offset,
    });

    res.json({
      users: rows,
      total: count,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(count / limitNum),
    });
  } catch (err) {
    console.error('[GET /admin/users]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// POST /admin/users/:id/course-access — grant course access
export async function grantCourseAccess(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = parseInt(req.params.id);
    const { course_id, expires_at, note } = req.body;

    if (!course_id) {
      res.status(400).json({ error: 'course_id requis.' });
      return;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ error: 'Utilisateur introuvable.' });
      return;
    }

    const [access, created] = await CourseAccess.findOrCreate({
      where: { user_id: userId, course_id },
      defaults: {
        user_id: userId,
        course_id,
        granted_by: req.userId!,
        expires_at: expires_at ? new Date(expires_at) : null,
        note: note || null,
      },
    });

    if (!created) {
      // Update existing
      await access.update({
        granted_by: req.userId!,
        expires_at: expires_at ? new Date(expires_at) : null,
        note: note || null,
      });
    }

    res.status(created ? 201 : 200).json({ message: 'Accès accordé.', access });
  } catch (err) {
    console.error('[POST /admin/users/:id/course-access]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// DELETE /admin/users/:id/course-access/:courseId — revoke course access
export async function revokeCourseAccess(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = parseInt(req.params.id);
    const courseId = parseInt(req.params.courseId);

    const deleted = await CourseAccess.destroy({
      where: { user_id: userId, course_id: courseId },
    });

    if (!deleted) {
      res.status(404).json({ error: 'Accès introuvable.' });
      return;
    }

    res.json({ message: 'Accès révoqué.' });
  } catch (err) {
    console.error('[DELETE /admin/users/:id/course-access/:courseId]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// GET /admin/users/:id/course-access — list user's course accesses
export async function listUserCourseAccess(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = parseInt(req.params.id);

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email'],
    });
    if (!user) {
      res.status(404).json({ error: 'Utilisateur introuvable.' });
      return;
    }

    const accesses = await CourseAccess.findAll({
      where: { user_id: userId },
      order: [['granted_at', 'DESC']],
    });

    res.json({ user, accesses });
  } catch (err) {
    console.error('[GET /admin/users/:id/course-access]', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}
