import asyncHandler from '../utils/asyncHandler.js';
import * as authService from '../services/auth.service.js';

export const staffLogin = asyncHandler(async (req, res) => {
  const { role, email, password } = req.body;
  const result = await authService.loginStaff({ role, email, password });
  res.status(200).json({ status: 'ok', ...result });
});

export const patientLogin = asyncHandler(async (req, res) => {
  const { phone, mrNo } = req.body;
  const result = await authService.loginPatient({ phone, mrNo });
  res.status(200).json({ status: 'ok', ...result });
});
