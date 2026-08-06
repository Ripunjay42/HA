import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const nurseSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  staffId: { type: String, required: true, unique: true },
  phone: String,
  ward: String,
  shift: { type: String, enum: ['morning', 'evening', 'night'] },
  aadhaarNumber: String,
  panNumber: String,
  documents: [{
    type: {
      type: String,
      enum: ['aadhaar', 'pan', 'employment_other'],
    },
    fileName: String,
    contentType: String,
    data: Buffer,
    uploadedAt: Date,
  }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

nurseSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  next();
});

nurseSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

export default model('Nurse', nurseSchema);
