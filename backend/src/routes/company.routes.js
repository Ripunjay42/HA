import express from 'express';
import { createCompany, listCompanies, updateCompany } from '../controllers/company.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Public (no auth) -- the patient self-registration screen needs this list
// before the patient has a token, to offer the employer picker that drives
// the Payment/Non-Payment classification.
router.get('/', listCompanies);
router.post('/', authenticate, authorize('admin'), createCompany);
router.patch('/:id', authenticate, authorize('admin'), updateCompany);

export default router;
