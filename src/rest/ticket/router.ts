import { Router } from 'express'
import handler from './handler'
import { authMiddleware } from '../account'

const router = Router()

router.use(authMiddleware)
router.post('/book', handler.createTicketOrder)
router.post('/pay', handler.payTicketOrder)
router.post('/cancel', handler.cancelTicketOrder)

export default router
