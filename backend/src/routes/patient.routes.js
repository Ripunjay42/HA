import express from 'express';
import {
  registerSelf, registerByReceptionist, getByMrNo, getMe, list, assignNurse, recordVitals,
} from '../controllers/patient.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', registerSelf);
router.post(
  '/register-by-receptionist',
  authenticate,
  authorize('receptionist'),
  registerByReceptionist,
);

router.get('/me', authenticate, authorize('patient'), getMe);
router.get('/', authenticate, authorize('admin', 'receptionist', 'nurse'), list);
router.get(
  '/mr/:mrNo',
  authenticate,
  authorize('admin', 'receptionist', 'nurse', 'doctor'),
  getByMrNo,
);

router.patch(
  '/mr/:mrNo/assign-nurse',
  authenticate,
  authorize('admin', 'receptionist'),
  assignNurse,
);

router.patch('/mr/:mrNo/vitals', authenticate, authorize('nurse'), recordVitals);

export default router;
