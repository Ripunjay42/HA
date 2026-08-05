import asyncHandler from '../utils/asyncHandler.js';
import * as appointmentService from '../services/appointment.service.js';

const actorFrom = (req) => ({ role: req.user.role, id: req.user.id });

export const createAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.createAppointment(req.body, actorFrom(req));
  res.status(201).json({ status: 'ok', appointment });
});

export const getAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.getAppointmentById(req.params.id);
  res.status(200).json({ status: 'ok', appointment });
});

export const selectDoctor = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.selectDoctor(
    req.params.id,
    req.body.doctorId,
    actorFrom(req),
  );
  res.status(200).json({ status: 'ok', appointment });
});

export const getAvailableSlots = asyncHandler(async (req, res) => {
  const availability = await appointmentService.getAvailableSlots(req.params.id);
  res.status(200).json({ status: 'ok', availability });
});

export const selectSlot = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.selectSlot(req.params.id, req.body, actorFrom(req));
  res.status(200).json({ status: 'ok', appointment });
});

export const pay = asyncHandler(async (req, res) => {
  const result = await appointmentService.payForAppointment(req.params.id, req.body, actorFrom(req));
  res.status(200).json({ status: 'ok', ...result });
});

export const getMine = asyncHandler(async (req, res) => {
  const appointments = await appointmentService.getMyAppointments(req.user.id);
  res.status(200).json({ status: 'ok', appointments });
});

export const getForUhid = asyncHandler(async (req, res) => {
  const appointments = await appointmentService.getAppointmentsForUhid(
    req.params.uhid,
    actorFrom(req),
  );
  res.status(200).json({ status: 'ok', appointments });
});

export const getDoctorAppointments = asyncHandler(async (req, res) => {
  const appointments = await appointmentService.getDoctorAppointments(req.user.id);
  res.status(200).json({ status: 'ok', appointments });
});

export const recordConsultationNotes = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.recordConsultationNotes(
    req.params.id,
    req.body,
    req.user.id,
  );
  res.status(200).json({ status: 'ok', appointment });
});
