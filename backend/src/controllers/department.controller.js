import asyncHandler from '../utils/asyncHandler.js';
import * as departmentService from '../services/department.service.js';

export const createDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.createDepartment(req.body);
  res.status(201).json({ status: 'ok', department });
});

export const listDepartments = asyncHandler(async (req, res) => {
  const departments = await departmentService.listDepartments();
  res.status(200).json({ status: 'ok', departments });
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.updateDepartment(req.params.id, req.body);
  res.status(200).json({ status: 'ok', department });
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  await departmentService.deleteDepartment(req.params.id);
  res.status(204).send();
});
