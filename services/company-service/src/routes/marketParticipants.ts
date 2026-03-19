import { Router } from 'express'
import { getSGIs, getSGOs } from '../controllers/marketParticipantsController'

const router = Router()
router.get('/sgis', getSGIs)
router.get('/sgos', getSGOs)
export default router
