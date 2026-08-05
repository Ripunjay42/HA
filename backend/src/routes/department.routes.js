import express from 'express';
import {
  createDepartment, listDepartments, updateDepartment, deleteDepartment,
} from '../controllers/department.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', authenticate, listDepartments);
router.post('/', authenticate, authorize('admin'), createDepartment);
router.patch('/:id', authenticate, authorize('admin'), updateDepartment);
router.delete('/:id', authenticate, authorize('admin'), deleteDepartment);

export default router;
