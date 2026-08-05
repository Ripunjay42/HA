import express from 'express';
import { staffLogin, patientLogin } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/login', staffLogin);
router.post('/patient-login', patientLogin);

export default router;
