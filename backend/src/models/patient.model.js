import { Schema, model } from 'mongoose';

const patientSchema = new Schema({
  mrNo: { type: String, required: true, unique: true },
  uhid: { type: String, unique: true, sparse: true },
  tokenNo: { type: String, sparse: true },
  name: { type: String, required: true },
  age: Number,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  phone: { type: String, required: true },
  address: String,
  guardianName: String,
  registrationSource: {
    type: String, enum: ['self', 'receptionist'], default: 'self',
  },
  registeredBy: { type: Schema.Types.ObjectId, ref: 'Receptionist' },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  paymentCategory: {
    type: String,
    enum: ['payment', 'non_payment'],
    default: 'payment',
  },
  assignedNurse: { type: Schema.Types.ObjectId, ref: 'Nurse' },
  vitals: {
    weight: Number,
    bp: String,
    temperature: Number,
    height: Number,
    pulse: Number,
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'Nurse' },
    recordedAt: Date,
  },
  status: {
    type: String,
    enum: [
      'registered', 'nurse_assigned',
      'vitals_recorded', 'token_generated',
    ],
    default: 'registered',
  },
}, { timestamps: true });

export default model('Patient', patientSchema);
