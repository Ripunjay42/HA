import Department from '../models/department.model.js';
import ApiError from '../utils/ApiError.js';

export const createDepartment = (data) => Department.create(data);

export const listDepartments = () => Department.find();

export const updateDepartment = async (id, data) => {
  const department = await Department.findByIdAndUpdate(id, data, { new: true });
  if (!department) throw new ApiError(404, 'Department not found');
  return department;
};

export const deleteDepartment = async (id) => {
  const department = await Department.findByIdAndDelete(id);
  if (!department) throw new ApiError(404, 'Department not found');
};
