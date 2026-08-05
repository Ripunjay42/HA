import { Schema, model } from 'mongoose';

const paymentSchema = new Schema({
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient' },
  amount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['upi', 'card', 'netbanking', 'cash', 'wallet'],
  },
  transactionId: String,
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending',
  },
  paidAt: Date,
}, { timestamps: true });

export default model('Payment', paymentSchema);
