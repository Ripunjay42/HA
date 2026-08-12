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
  const { employerName, password, ...patientData } = data;

  if (!/^[0-9]{10}$/.test(patientData.phone || '')) {
    throw new ApiError(400, 'Phone number must be exactly 10 digits');
  }
  if (patientData.emergencyContactPhone) {
    if (!/^[0-9]{10}$/.test(patientData.emergencyContactPhone)) {
      throw new ApiError(400, 'Emergency contact number must be exactly 10 digits');
    }
    if (patientData.emergencyContactPhone === patientData.phone) {
      throw new ApiError(400, 'Emergency contact number cannot be the same as the patient\'s phone number');
    }
  }

  const { companyId, paymentCategory } = await resolvePaymentCategory(employerName);
  const mrNo = await generateMrNo();

  const patient = await Patient.create({
    ...patientData,
    mrNo,
    passwordHash: password,
    companyId,
    paymentCategory,
    registrationSource: source,
    registeredBy: registeredBy || undefined,
  });

  const { passwordHash, ...safePatient } = patient.toObject();
  return safePatient;
};

// `.select('-passwordHash')` is safe to combine with a later `.save()` --
// mongoose tracks unselected paths and skips them on save rather than
// nulling them out or failing required validation.
export const getPatientByMrNo = async (mrNo) => {
  const patient = await Patient.findOne({ mrNo })
    .select('-passwordHash')
    .populate('assignedNurse', 'name staffId')
    .populate('companyId', 'name code');
  if (!patient) throw new ApiError(404, 'Patient not found');
  return patient;
};

export const getPatientById = async (id) => {
  const patient = await Patient.findById(id).select('-passwordHash');
  if (!patient) throw new ApiError(404, 'Patient not found');
  return patient;
};

export const getPatientByUhid = async (uhid) => {
  const patient = await Patient.findOne({ uhid }).select('-passwordHash');
  if (!patient) throw new ApiError(404, 'Patient not found');
  return patient;
};

export const listPatients = (filters = {}) =>
  Patient.find(filters)
    .select('-passwordHash')
    .populate('assignedNurse', 'name staffId')
    .sort({ createdAt: -1 });

export const assignNurse = async (mrNo, staffId) => {
  const nurse = await Nurse.findOne({ staffId, status: 'active' });
  if (!nurse) throw new ApiError(404, 'Nurse not found or inactive');

  const patient = await getPatientByMrNo(mrNo);
  if (patient.status === 'token_generated') {
    throw new ApiError(400, 'Cannot reassign nurse while the token is still active');
  }
  patient.assignedNurse = nurse._id;
  patient.status = 'nurse_assigned';
  await patient.save();
  return patient;
};

export const unassignNurse = async (mrNo) => {
  const patient = await getPatientByMrNo(mrNo);
  if (patient.status === 'token_generated') {
    throw new ApiError(400, 'Cannot unassign nurse while the token is still active');
  }
  patient.assignedNurse = undefined;
  patient.status = 'registered';
  await patient.save();
  return patient;
};

const assertAssignedNurse = (patient, nurseId) => {
  // getPatientByMrNo populates assignedNurse into {_id, name, staffId}, so
  // compare against its _id rather than stringifying the whole subdocument.
  const assignedNurseId = patient.assignedNurse?._id || patient.assignedNurse;
  if (!assignedNurseId || String(assignedNurseId) !== String(nurseId)) {
    throw new ApiError(403, 'You are not the nurse assigned to this patient');
  }
};

// Vitals have already been recorded and a token issued for this visit --
// correct the reading in place without touching the token or its history.
export const updateVitals = async (mrNo, vitals, nurseId) => {
  const patient = await getPatientByMrNo(mrNo);
  assertAssignedNurse(patient, nurseId);

  if (!patient.vitals?.recordedAt) {
    throw new ApiError(400, 'No vitals have been recorded yet for this patient');
  }

  patient.vitals = { ...patient.vitals.toObject(), ...vitals, recordedBy: nurseId, recordedAt: new Date() };
  await patient.save();
  return patient;
};

export const recordVitals = async (mrNo, vitals, nurseId) => {
  const patient = await getPatientByMrNo(mrNo);
  assertAssignedNurse(patient, nurseId);

  // Archive the outgoing token (if any) before it's overwritten, so a
  // patient's full token history stays visible even after regeneration.
  if (patient.tokenNo) {
    patient.tokenHistory.push({
      tokenNo: patient.tokenNo,
      issuedAt: patient.vitals?.recordedAt || patient.updatedAt,
      expiredAt: new Date(),
    });
  }

  patient.vitals = { ...vitals, recordedBy: nurseId, recordedAt: new Date() };
  patient.status = 'vitals_recorded';
  await patient.save();

  if (!patient.uhid) {
    patient.uhid = await generateUhid();
  }
  patient.tokenNo = await generateTokenNo();
  patient.status = 'token_generated';
  await patient.save();

  return patient;
};
