import { Router } from 'express'
import {
  getSGIs, getSGOs, getFunds,
  createSGI, updateSGI, deleteSGI,
  createSGO, updateSGO, deleteSGO,
  createFund, updateFund, deleteFund,
} from '../controllers/marketParticipantsController'
import { requireAdmin } from '../middleware/auth'

const router = Router()

// ── GET (publics) ─────────────────────────────────────────────────────────────
router.get('/sgis', getSGIs)
router.get('/sgos', getSGOs)
router.get('/funds', getFunds)

// ── SGI CRUD (admin only) ─────────────────────────────────────────────────────
router.post('/sgis', requireAdmin, createSGI)
router.put('/sgis/:id', requireAdmin, updateSGI)
router.delete('/sgis/:id', requireAdmin, deleteSGI)

// ── SGO CRUD (admin only) ─────────────────────────────────────────────────────
router.post('/sgos', requireAdmin, createSGO)
router.put('/sgos/:id', requireAdmin, updateSGO)
router.delete('/sgos/:id', requireAdmin, deleteSGO)

// ── Funds CRUD (admin only) ───────────────────────────────────────────────────
router.post('/funds', requireAdmin, createFund)
router.put('/funds/:id', requireAdmin, updateFund)
router.delete('/funds/:id', requireAdmin, deleteFund)

export default router
