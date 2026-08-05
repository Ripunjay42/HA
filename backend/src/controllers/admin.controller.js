import asyncHandler from '../utils/asyncHandler.js';
import * as adminService from '../services/admin.service.js';

export const createStaff = asyncHandler(async (req, res) => {
  const { role, ...data } = req.body;
  const staff = await adminService.createStaff(role, data);
  res.status(201).json({ status: 'ok', staff });
});

export const listStaff = asyncHandler(async (req, res) => {
  const { role, status } = req.query;
  const filters = status ? { status } : {};
  const staff = await adminService.listStaff(role, filters);
  res.status(200).json({ status: 'ok', staff });
});

export const setStaffStatus = asyncHandler(async (req, res) => {
  const { role, id } = req.params;
  const { status } = req.body;
  const staff = await adminService.setStaffStatus(role, id, status);
  res.status(200).json({ status: 'ok', staff });
});

export const addStaffDocument = asyncHandler(async (req, res) => {
  const { role, id } = req.params;
  const { type } = req.body;
  const fileUrl = `/uploads/${req.file.filename}`;
  const staff = await adminService.addStaffDocument(role, id, { type, fileUrl });
  res.status(200).json({ status: 'ok', staff });
});

export const getReports = asyncHandler(async (req, res) => {
  const reports = await adminService.getReports();
  res.status(200).json({ status: 'ok', reports });
});
