import Appointment from '../models/appointment.model.js';
import Doctor from '../models/doctor.model.js';
import Payment from '../models/payment.model.js';
import Patient from '../models/patient.model.js';
import { matchDepartmentBySymptoms } from '../utils/matchDepartment.js';
import ApiError from '../utils/ApiError.js';

const POPULATE_FIELDS = [
  { path: 'patientId', select: '-passwordHash' },
  { path: 'matchedDepartment' },
  { path: 'matchedDoctors', select: '-passwordHash -documents.data' },
  { path: 'selectedDoctor', select: '-passwordHash -documents.data' },
];

const getAppointmentOr404 = async (id) => {
  const appointment = await Appointment.findById(id).populate(POPULATE_FIELDS);
  if (!appointment) throw new ApiError(404, 'Appointment not found');
  return appointment;
};

// Nurses may act on behalf of a patient for every step except vitals and
// payment; this checks the caller is either the patient themselves or the
// nurse assigned to them, per the spec's "nurse can assist" rule.
const assertCanActOnPatient = (patient, actor) => {
  if (actor.role === 'patient' && String(patient._id) === String(actor.id)) return;
  if (actor.role === 'nurse' && String(patient.assignedNurse) === String(actor.id)) return;
  throw new ApiError(403, 'You are not authorized to act on this patient\'s behalf');
};

// Statuses before a doctor/slot is locked in and paid for -- resuming the
// booking flow (e.g. re-entering symptom check or department browsing)
// should continue this appointment rather than spawn a duplicate.
const IN_PROGRESS_STATUSES = ['pending_doctor', 'pending_slot', 'pending_payment'];

export const createAppointment = async ({ uhid, purpose, symptoms }, actor) => {
  const patient = await Patient.findOne({ uhid });
  if (!patient) throw new ApiError(404, 'Patient not found or UHID not yet generated');

  assertCanActOnPatient(patient, actor);

  const match = await matchDepartmentBySymptoms(symptoms, purpose);

  const existing = await Appointment.findOne({
    patientId: patient._id,
    status: { $in: IN_PROGRESS_STATUSES },
  }).sort({ createdAt: -1 });

  if (existing) {
    existing.purpose = purpose;
    existing.symptoms = symptoms;
    existing.symptomsEnteredBy = actor.role;
    existing.matchedDepartment = match?.department._id || null;
    existing.matchedDoctors = match?.doctors.map((d) => d._id) || [];
    await existing.save();
    return getAppointmentOr404(existing._id);
  }

  const appointment = await Appointment.create({
    patientId: patient._id,
    purpose,
    symptoms,
    symptomsEnteredBy: actor.role,
    bookedBy: actor.role,
    matchedDepartment: match?.department._id || null,
    matchedDoctors: match?.doctors.map((d) => d._id) || [],
    status: 'pending_doctor',
  });

  return getAppointmentOr404(appointment._id);
};

export const selectDoctor = async (appointmentId, doctorId, actor) => {
  const appointment = await getAppointmentOr404(appointmentId);
  assertCanActOnPatient(appointment.patientId, actor);

  const doctor = await Doctor.findOne({ _id: doctorId, status: 'active' });
  if (!doctor) throw new ApiError(404, 'Doctor not found or inactive');

  appointment.selectedDoctor = doctorId;
  appointment.status = 'pending_slot';
  await appointment.save();
  return getAppointmentOr404(appointment._id);
};

export const getAvailableSlots = async (appointmentId) => {
  const appointment = await getAppointmentOr404(appointmentId);
  if (!appointment.selectedDoctor) throw new ApiError(400, 'Select a doctor before viewing slots');

  const doctor = await Doctor.findById(appointment.selectedDoctor._id);
  return doctor.availability.map(({ day, slots }) => ({
    day,
    slots: slots.filter((slot) => !slot.isBooked),
  }));
};

export const selectSlot = async (appointmentId, { day, date, startTime, endTime }, actor) => {
  const appointment = await getAppointmentOr404(appointmentId);
  assertCanActOnPatient(appointment.patientId, actor);

  if (!appointment.selectedDoctor) throw new ApiError(400, 'Select a doctor before selecting a slot');

  const doctor = await Doctor.findById(appointment.selectedDoctor._id);
  const dayEntry = doctor.availability.find((a) => a.day === day);
  const slot = dayEntry?.slots.find((s) => s.startTime === startTime && s.endTime === endTime);

  if (!slot || slot.isBooked) throw new ApiError(409, 'Slot is not available');

  slot.isBooked = true;
  await doctor.save();

  appointment.slot = { date, startTime, endTime };

  const patient = await Patient.findById(appointment.patientId._id);
  appointment.status = patient.paymentCategory === 'non_payment' ? 'confirmed' : 'pending_payment';
  await appointment.save();

  return getAppointmentOr404(appointment._id);
};

export const payForAppointment = async (appointmentId, { paymentMethod, transactionId }, actor) => {
  if (actor.role !== 'patient') throw new ApiError(403, 'Only the patient can make payment');

  const appointment = await getAppointmentOr404(appointmentId);
  if (String(appointment.patientId._id) !== String(actor.id)) {
    throw new ApiError(403, 'You are not authorized to pay for this appointment');
  }
  if (appointment.status !== 'pending_payment') {
    throw new ApiError(400, 'This appointment is not awaiting payment');
  }

  const payment = await Payment.create({
    appointmentId: appointment._id,
    patientId: appointment.patientId._id,
    amount: appointment.selectedDoctor.consultationFee,
    paymentMethod,
    transactionId,
    status: 'success',
    paidAt: new Date(),
  });

  appointment.paymentId = payment._id;
  appointment.status = 'confirmed';
  await appointment.save();

  return { appointment: await getAppointmentOr404(appointment._id), payment };
};

export const getMyAppointments = (patientId) =>
  Appointment.find({ patientId }).populate(POPULATE_FIELDS).sort({ createdAt: -1 });

export const getAppointmentsForUhid = async (uhid, actor) => {
  const patient = await Patient.findOne({ uhid });
  if (!patient) throw new ApiError(404, 'Patient not found');
  if (actor.role !== 'admin') assertCanActOnPatient(patient, actor);
  return Appointment.find({ patientId: patient._id }).populate(POPULATE_FIELDS).sort({ createdAt: -1 });
};

export const getDoctorAppointments = (doctorId) =>
  Appointment.find({ selectedDoctor: doctorId }).populate(POPULATE_FIELDS).sort({ 'slot.date': 1 });

export const recordConsultationNotes = async (appointmentId, { rawImageUrl }, doctorId) => {
  const appointment = await getAppointmentOr404(appointmentId);
  if (String(appointment.selectedDoctor._id) !== String(doctorId)) {
    throw new ApiError(403, 'You are not the doctor assigned to this appointment');
  }

  appointment.consultationNotes = { rawImageUrl, recordedAt: new Date() };
  appointment.status = 'completed';
  await appointment.save();
  return getAppointmentOr404(appointment._id);
};

export const getAppointmentById = (id) => getAppointmentOr404(id);
