import roleModels from '../utils/roleModels.js';
import { generateStaffId } from '../utils/generateIds.js';
import Patient from '../models/patient.model.js';
import Appointment from '../models/appointment.model.js';
import Payment from '../models/payment.model.js';
import ApiError from '../utils/ApiError.js';

const staffIdPrefix = { receptionist: 'RC', nurse: 'NR', doctor: 'DR' };

const getModelOrThrow = (role) => {
  const Model = roleModels[role];
  if (!Model) throw new ApiError(400, `Unsupported staff role: ${role}`);
  return Model;
};

// Document bytes are only needed when actually downloading a document, so
// every other staff response strips `data` and keeps just the metadata.
const stripDocumentData = (doc) => {
  const { data, ...rest } = doc;
  return rest;
};

export const createStaff = async (role, data) => {
  const Model = getModelOrThrow(role);
  const { password, ...rest } = data;

  const payload = { ...rest, passwordHash: password };

  if (staffIdPrefix[role]) {
    payload.staffId = await generateStaffId(Model, staffIdPrefix[role]);
  }

  const staff = await Model.create(payload);
  const { passwordHash, ...safeStaff } = staff.toObject();
  return safeStaff;
};

export const listStaff = async (role, filters = {}) => {
  const Model = getModelOrThrow(role);
  const query = Model.find(filters).select('-passwordHash -documents.data');
  if (role === 'doctor') query.populate('departmentId', 'name');
  return query;
};

export const setStaffStatus = async (role, id, status) => {
  const Model = getModelOrThrow(role);
  const staff = await Model.findByIdAndUpdate(id, { status }, { new: true }).select('-passwordHash');
  if (!staff) throw new ApiError(404, 'Staff member not found');
  return staff;
};

export const addStaffDocument = async (role, id, document) => {
  const Model = getModelOrThrow(role);
  const staff = await Model.findById(id);
  if (!staff) throw new ApiError(404, 'Staff member not found');

  staff.documents.push({ ...document, uploadedAt: new Date() });
  await staff.save();
  const { passwordHash, documents, ...safeStaff } = staff.toObject();
  return { ...safeStaff, documents: documents.map(stripDocumentData) };
};

export const getStaffDocument = async (role, id, documentId) => {
  const Model = getModelOrThrow(role);
  const staff = await Model.findById(id).select('documents');
  if (!staff) throw new ApiError(404, 'Staff member not found');

  const document = staff.documents.id(documentId);
  if (!document) throw new ApiError(404, 'Document not found');
  return document;
};

export const updateStaff = async (role, id, data) => {
  const Model = getModelOrThrow(role);
  const { password, documents, staffId, ...rest } = data;

  const staff = await Model.findById(id);
  if (!staff) throw new ApiError(404, 'Staff member not found');

  Object.assign(staff, rest);
  if (password) staff.passwordHash = password;

  await staff.save();
  const { passwordHash, documents: docs, ...safeStaff } = staff.toObject();
  return { ...safeStaff, documents: docs.map(stripDocumentData) };
};

export const getReports = async () => {
  const [patientCount, appointmentsByStatus, doctorCount, nurseCount, receptionistCount, revenue] =
    await Promise.all([
      Patient.countDocuments(),
      Appointment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      roleModels.doctor.countDocuments(),
      roleModels.nurse.countDocuments(),
      roleModels.receptionist.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

  return {
    patients: patientCount,
    appointmentsByStatus: appointmentsByStatus.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, {}),
    staff: { doctors: doctorCount, nurses: nurseCount, receptionists: receptionistCount },
    totalRevenue: revenue[0]?.total || 0,
  };
};
