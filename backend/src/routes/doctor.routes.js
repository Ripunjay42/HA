import express from 'express';
import { listDoctors, getDoctor } from '../controllers/doctor.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', authenticate, listDoctors);
router.get('/:id', authenticate, getDoctor);

export default router;
