import express from 'express';
import {
  createAppointment, getAppointment, selectDoctor, getAvailableSlots, selectSlot,
  pay, getMine, getForUhid, getDoctorAppointments, recordConsultationNotes,
} from '../controllers/appointment.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('patient', 'nurse'), createAppointment);
router.get('/mine', authorize('patient'), getMine);
router.get('/doctor/mine', authorize('doctor'), getDoctorAppointments);
router.get('/patient/:uhid', authorize('patient', 'nurse', 'admin'), getForUhid);
router.get('/:id', getAppointment);
router.get('/:id/slots', getAvailableSlots);

router.patch('/:id/doctor', authorize('patient', 'nurse'), selectDoctor);
router.patch('/:id/slot', authorize('patient', 'nurse'), selectSlot);
router.post('/:id/pay', authorize('patient'), pay);
router.patch('/:id/consultation-notes', authorize('doctor'), recordConsultationNotes);

export default router;
