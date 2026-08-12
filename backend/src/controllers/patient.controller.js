import asyncHandler from '../utils/asyncHandler.js';
import * as patientService from '../services/patient.service.js';

export const registerSelf = asyncHandler(async (req, res) => {
  const patient = await patientService.registerPatient(req.body, { source: 'self' });
  res.status(201).json({ status: 'ok', patient });
});

export const registerByReceptionist = asyncHandler(async (req, res) => {
  const patient = await patientService.registerPatient(req.body, {
    source: 'receptionist',
    registeredBy: req.user.id,
  });
  res.status(201).json({ status: 'ok', patient });
});

export const getByMrNo = asyncHandler(async (req, res) => {
  const patient = await patientService.getPatientByMrNo(req.params.mrNo);
  res.status(200).json({ status: 'ok', patient });
});

export const getMe = asyncHandler(async (req, res) => {
  const patient = await patientService.getPatientById(req.user.id);
  res.status(200).json({ status: 'ok', patient });
});

export const list = asyncHandler(async (req, res) => {
  const filters = req.user.role === 'nurse' ? { assignedNurse: req.user.id } : {};
  const patients = await patientService.listPatients(filters);
  res.status(200).json({ status: 'ok', patients });
});

export const assignNurse = asyncHandler(async (req, res) => {
  const patient = await patientService.assignNurse(req.params.mrNo, req.body.staffId);
  res.status(200).json({ status: 'ok', patient });
});

export const unassignNurse = asyncHandler(async (req, res) => {
  const patient = await patientService.unassignNurse(req.params.mrNo);
  res.status(200).json({ status: 'ok', patient });
});

export const recordVitals = asyncHandler(async (req, res) => {
  const patient = await patientService.recordVitals(req.params.mrNo, req.body, req.user.id);
  res.status(200).json({ status: 'ok', patient });
});

export const updateVitals = asyncHandler(async (req, res) => {
  const patient = await patientService.updateVitals(req.params.mrNo, req.body, req.user.id);
  res.status(200).json({ status: 'ok', patient });
});
