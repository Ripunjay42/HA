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
  const { type, fileName, contentType, base64 } = req.body;
  const staff = await adminService.addStaffDocument(role, id, {
    type,
    fileName,
    contentType,
    data: Buffer.from(base64, 'base64'),
  });
  res.status(200).json({ status: 'ok', staff });
});

export const getStaffDocument = asyncHandler(async (req, res) => {
  const { role, id, documentId } = req.params;
  const document = await adminService.getStaffDocument(role, id, documentId);
  res.set('Content-Type', document.contentType || 'application/octet-stream');
  res.set('Content-Disposition', `inline; filename="${document.fileName || documentId}"`);
  res.send(document.data);
});

export const updateStaff = asyncHandler(async (req, res) => {
  const { role, id } = req.params;
  const staff = await adminService.updateStaff(role, id, req.body);
  res.status(200).json({ status: 'ok', staff });
});

export const getReports = asyncHandler(async (req, res) => {
  const reports = await adminService.getReports();
  res.status(200).json({ status: 'ok', reports });
});
