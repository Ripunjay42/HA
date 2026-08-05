import roleModels from '../utils/roleModels.js';
import { generateStaffId } from '../utils/generateIds.js';
import Patient from '../models/patient.model.js';
import Appointment from '../models/appointment.model.js';
import Payment from '../models/payment.model.js';
import ApiError from '../utils/ApiError.js';

const staffIdPrefix = { receptionist: 'RC', nurse: 'NR' };

const getModelOrThrow = (role) => {
  const Model = roleModels[role];
  if (!Model) throw new ApiError(400, `Unsupported staff role: ${role}`);
  return Model;
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
  return Model.find(filters).select('-passwordHash');
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
  const { passwordHash, ...safeStaff } = staff.toObject();
  return safeStaff;
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
