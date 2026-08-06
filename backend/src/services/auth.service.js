import Patient from '../models/patient.model.js';
import roleModels from '../utils/roleModels.js';
import { signToken } from '../utils/jwt.js';
import ApiError from '../utils/ApiError.js';

export const loginStaff = async ({ role, email, password }) => {
  const Model = roleModels[role];
  if (!Model) throw new ApiError(400, 'Invalid role');

  const user = await Model.findOne({ email });
  if (!user) throw new ApiError(401, 'Invalid email or password');

  if (user.status === 'inactive') throw new ApiError(403, 'Account is inactive');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  const token = signToken({ id: user._id, role });
  const { passwordHash, ...safeUser } = user.toObject();

  return { token, user: safeUser };
};

export const loginPatient = async ({ phone, password }) => {
  const patient = await Patient.findOne({ phone });
  if (!patient) throw new ApiError(401, 'Invalid phone number or password');

  const isMatch = await patient.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid phone number or password');

  const token = signToken({ id: patient._id, role: 'patient' });
  const { passwordHash, ...safePatient } = patient.toObject();

  return { token, user: safePatient };
};
