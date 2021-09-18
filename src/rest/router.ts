import { Router } from 'express'

import ticketRouter from './ticket'

const router = Router()

router.use('/ticket', ticketRouter)

export default router
