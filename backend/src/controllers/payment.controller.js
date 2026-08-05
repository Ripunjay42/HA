import asyncHandler from '../utils/asyncHandler.js';
import * as paymentService from '../services/payment.service.js';

export const listPayments = asyncHandler(async (req, res) => {
  const payments = await paymentService.listPayments();
  res.status(200).json({ status: 'ok', payments });
});
