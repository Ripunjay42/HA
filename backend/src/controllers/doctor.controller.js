import asyncHandler from '../utils/asyncHandler.js';
import * as doctorService from '../services/doctor.service.js';

export const listDoctors = asyncHandler(async (req, res) => {
  const { departmentId } = req.query;
  const filters = { status: 'active', ...(departmentId && { departmentId }) };
  const doctors = await doctorService.listDoctors(filters);
  res.status(200).json({ status: 'ok', doctors });
});

export const getDoctor = asyncHandler(async (req, res) => {
  const doctor = await doctorService.getDoctorById(req.params.id);
  res.status(200).json({ status: 'ok', doctor });
});
