import { Schema, model } from 'mongoose';

const appointmentSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient' },
  purpose: String,
  symptoms: [String],
  symptomsEnteredBy: {
    type: String,
    enum: ['patient', 'nurse'],
    default: 'patient',
  },
  bookedBy: {
    type: String,
    enum: ['patient', 'nurse'],
    default: 'patient',
  },
  matchedDepartment: { type: Schema.Types.ObjectId, ref: 'Department' },
  matchedDoctors: [{ type: Schema.Types.ObjectId, ref: 'Doctor' }],
  recommendedDoctor: { type: Schema.Types.ObjectId, ref: 'Doctor' },
  selectedDoctor: { type: Schema.Types.ObjectId, ref: 'Doctor' },
  slot: {
    date: Date,
    startTime: String,
    endTime: String,
  },
  status: {
    type: String,
    enum: [
      'pending_doctor', 'pending_slot', 'pending_payment',
      'confirmed', 'cancelled', 'completed',
    ],
    default: 'pending_doctor',
  },
  paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
  consultationNotes: {
    rawImageUrl: String,
    recordedAt: Date,
  },
  prescriptionDetails: {
    image: { data: Buffer, contentType: String },
    recognizedText: String,
    recordedAt: Date,
  },
}, { timestamps: true });

export default model('Appointment', appointmentSchema);
