import { Router } from 'express';
import { requireAdmin } from '../middleware/auth';
import {
  listNews,
  getNewsCategories,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  publishNews,
  unpublishNews,
} from '../controllers/newsController';

// ── Public routes ─────────────────────────────────────────────────────────────
export const newsRouter = Router();

// /news/categories must come before /news/:id
newsRouter.get('/categories', getNewsCategories);
newsRouter.get('/',           listNews);
newsRouter.get('/:id',        getNewsById);

// ── Admin routes ──────────────────────────────────────────────────────────────
export const adminNewsRouter = Router();

adminNewsRouter.post('/',                requireAdmin, createNews);
adminNewsRouter.put('/:id',              requireAdmin, updateNews);
adminNewsRouter.delete('/:id',           requireAdmin, deleteNews);
adminNewsRouter.post('/:id/publish',     requireAdmin, publishNews);
adminNewsRouter.post('/:id/unpublish',   requireAdmin, unpublishNews);
