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

// Patients aren't given a password at registration (per spec), so they
// authenticate with the two identifiers only they and the hospital know:
// their phone number and the MR No issued to them at registration.
export const loginPatient = async ({ phone, mrNo }) => {
  const patient = await Patient.findOne({ phone, mrNo });
  if (!patient) throw new ApiError(401, 'Invalid phone number or MR No');

  const token = signToken({ id: patient._id, role: 'patient' });
  return { token, user: patient };
};
