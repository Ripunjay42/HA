import Company from '../models/company.model.js';
import ApiError from '../utils/ApiError.js';

export const createCompany = (data) => Company.create(data);

export const listCompanies = () => Company.find();

export const updateCompany = async (id, data) => {
  const company = await Company.findByIdAndUpdate(id, data, { new: true });
  if (!company) throw new ApiError(404, 'Company not found');
  return company;
};
