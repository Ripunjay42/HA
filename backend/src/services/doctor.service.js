import Doctor from '../models/doctor.model.js';
import ApiError from '../utils/ApiError.js';

export const listDoctors = (filters = {}) => Doctor.find(filters).select('-passwordHash -documents.data');

export const getDoctorById = async (id) => {
  const doctor = await Doctor.findById(id).select('-passwordHash -documents.data');
  if (!doctor) throw new ApiError(404, 'Doctor not found');
  return doctor;
};
