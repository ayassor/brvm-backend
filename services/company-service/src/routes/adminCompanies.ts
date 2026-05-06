import { Router } from 'express';
import multer from 'multer';
import { requireAdmin } from '../middleware/auth';
import {
  createReport, updateReport, deleteReport, uploadReport,
} from '../controllers/reportController';
import {
  createAnnouncement, updateAnnouncement, deleteAnnouncement,
} from '../controllers/announcementController';
import { createVideo, updateVideo, deleteVideo } from '../controllers/videoController';
import { upsertSummary }                         from '../controllers/summaryController';
import {
  upsertRecommendation, upsertThesis,
  createAnalystRecommendation, updateAnalystRecommendation, deleteAnalystRecommendation,
} from '../controllers/recommendationController';
import {
  updateCompanyInfo,
  upsertFinancialHistory,
  replaceShareholders,
  createDividend, updateDividend, deleteDividend,
  createNews, deleteNews,
} from '../controllers/adminFundamentalsController';

const router  = Router();
const upload  = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// ── Rapports ──────────────────────────────────────────────────────────────────
router.post(  '/:ticker/reports',              requireAdmin, createReport);
router.put(   '/:ticker/reports/:id',          requireAdmin, updateReport);
router.delete('/:ticker/reports/:id',          requireAdmin, deleteReport);
router.post(  '/:ticker/reports/:id/upload',   requireAdmin, upload.single('file'), uploadReport);

// ── Communiqués ───────────────────────────────────────────────────────────────
router.post(  '/:ticker/announcements',        requireAdmin, createAnnouncement);
router.put(   '/:ticker/announcements/:id',    requireAdmin, updateAnnouncement);
router.delete('/:ticker/announcements/:id',    requireAdmin, deleteAnnouncement);

// ── Vidéos ────────────────────────────────────────────────────────────────────
router.post(  '/:ticker/videos',               requireAdmin, createVideo);
router.put(   '/:ticker/videos/:id',           requireAdmin, updateVideo);
router.delete('/:ticker/videos/:id',           requireAdmin, deleteVideo);

// ── Résumé exécutif ───────────────────────────────────────────────────────────
router.put(   '/:ticker/summary',              requireAdmin, upsertSummary);

// ── Recommandation & Thèse ────────────────────────────────────────────────────
router.put(   '/:ticker/recommendation',       requireAdmin, upsertRecommendation);
router.put(   '/:ticker/thesis',               requireAdmin, upsertThesis);

// ── Recommandations analystes ─────────────────────────────────────────────────
router.post(  '/:ticker/analyst-recommendations',        requireAdmin, createAnalystRecommendation);
router.put(   '/:ticker/analyst-recommendations/:id',    requireAdmin, updateAnalystRecommendation);
router.delete('/:ticker/analyst-recommendations/:id',    requireAdmin, deleteAnalystRecommendation);

// ── Infos société & fondamentaux ──────────────────────────────────────────────
router.put(   '/:ticker',                                requireAdmin, updateCompanyInfo);
router.put(   '/:ticker/financial-history',              requireAdmin, upsertFinancialHistory);
router.put(   '/:ticker/shareholders',                   requireAdmin, replaceShareholders);
router.post(  '/:ticker/dividends',                      requireAdmin, createDividend);
router.put(   '/:ticker/dividends/:id',                  requireAdmin, updateDividend);
router.delete('/:ticker/dividends/:id',                  requireAdmin, deleteDividend);
router.post(  '/:ticker/news',                           requireAdmin, createNews);
router.delete('/:ticker/news/:id',                       requireAdmin, deleteNews);

export default router;
