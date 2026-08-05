import asyncHandler from '../utils/asyncHandler.js';
import * as companyService from '../services/company.service.js';

export const createCompany = asyncHandler(async (req, res) => {
  const company = await companyService.createCompany(req.body);
  res.status(201).json({ status: 'ok', company });
});

export const listCompanies = asyncHandler(async (req, res) => {
  const companies = await companyService.listCompanies();
  res.status(200).json({ status: 'ok', companies });
});

export const updateCompany = asyncHandler(async (req, res) => {
  const company = await companyService.updateCompany(req.params.id, req.body);
  res.status(200).json({ status: 'ok', company });
});
