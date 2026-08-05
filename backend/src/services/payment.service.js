import Payment from '../models/payment.model.js';

export const listPayments = () =>
  Payment.find().populate('patientId').populate('appointmentId').sort({ createdAt: -1 });
