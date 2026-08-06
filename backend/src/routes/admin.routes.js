import express from 'express';
import {
  createStaff, listStaff, setStaffStatus, updateStaff, addStaffDocument, getStaffDocument, getReports,
} from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

// Receptionists need to look up nurses (by staffId) to assign them to a
// patient, so the read-only staff directory is open to them too; every
// write action below stays admin-only.
router.get('/staff', authorize('admin', 'receptionist'), listStaff);
router.get('/staff/:role/:id/documents/:documentId', authorize('admin', 'receptionist'), getStaffDocument);

router.use(authorize('admin'));

router.post('/staff', createStaff);
router.patch('/staff/:role/:id', updateStaff);
router.patch('/staff/:role/:id/status', setStaffStatus);
router.post('/staff/:role/:id/documents', addStaffDocument);
router.get('/reports', getReports);

export default router;
