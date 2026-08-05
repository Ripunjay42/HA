import express from 'express';
import { createCompany, listCompanies, updateCompany } from '../controllers/company.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', authenticate, listCompanies);
router.post('/', authenticate, authorize('admin'), createCompany);
router.patch('/:id', authenticate, authorize('admin'), updateCompany);

export default router;
