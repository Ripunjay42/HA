import express from 'express';
import { listPayments } from '../controllers/payment.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', authenticate, authorize('admin', 'receptionist'), listPayments);

export default router;
