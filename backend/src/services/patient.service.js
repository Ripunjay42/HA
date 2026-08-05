import Patient from '../models/patient.model.js';
import Company from '../models/company.model.js';
import Nurse from '../models/nurse.model.js';
import { generateMrNo, generateUhid, generateTokenNo } from '../utils/generateIds.js';
import ApiError from '../utils/ApiError.js';

// Employer name is checked against the registered companies list at
// registration time; a match makes the patient Non-Payment (company-covered).
const resolvePaymentCategory = async (employerName) => {
  if (!employerName) return { companyId: null, paymentCategory: 'payment' };

  const company = await Company.findOne({
    name: new RegExp(`^${employerName.trim()}$`, 'i'),
    status: 'active',
  });

  return company
    ? { companyId: company._id, paymentCategory: 'non_payment' }
    : { companyId: null, paymentCategory: 'payment' };
};

export const registerPatient = async (data, { source, registeredBy }) => {
  const { employerName, ...patientData } = data;
  const { companyId, paymentCategory } = await resolvePaymentCategory(employerName);
  const mrNo = await generateMrNo();

  const patient = await Patient.create({
    ...patientData,
    mrNo,
    companyId,
    paymentCategory,
    registrationSource: source,
    registeredBy: registeredBy || undefined,
  });

  return patient;
};

export const getPatientByMrNo = async (mrNo) => {
  const patient = await Patient.findOne({ mrNo });
  if (!patient) throw new ApiError(404, 'Patient not found');
  return patient;
};

export const getPatientById = async (id) => {
  const patient = await Patient.findById(id);
  if (!patient) throw new ApiError(404, 'Patient not found');
  return patient;
};

export const getPatientByUhid = async (uhid) => {
  const patient = await Patient.findOne({ uhid });
  if (!patient) throw new ApiError(404, 'Patient not found');
  return patient;
};

export const listPatients = (filters = {}) => Patient.find(filters).sort({ createdAt: -1 });

export const assignNurse = async (mrNo, staffId) => {
  const nurse = await Nurse.findOne({ staffId, status: 'active' });
  if (!nurse) throw new ApiError(404, 'Nurse not found or inactive');

  const patient = await getPatientByMrNo(mrNo);
  patient.assignedNurse = nurse._id;
  patient.status = 'nurse_assigned';
  await patient.save();
  return patient;
};

export const recordVitals = async (mrNo, vitals, nurseId) => {
  const patient = await getPatientByMrNo(mrNo);

  if (!patient.assignedNurse || String(patient.assignedNurse) !== String(nurseId)) {
    throw new ApiError(403, 'You are not the nurse assigned to this patient');
  }

  patient.vitals = { ...vitals, recordedBy: nurseId, recordedAt: new Date() };
  patient.status = 'vitals_recorded';
  await patient.save();

  patient.uhid = await generateUhid();
  patient.tokenNo = await generateTokenNo();
  patient.status = 'token_generated';
  await patient.save();

  return patient;
};
