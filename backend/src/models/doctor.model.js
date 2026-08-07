import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const doctorSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  phone: String,
  staffId: { type: String, unique: true, sparse: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
  specialization: String,
  qualifications: String,
  experienceYears: Number,
  consultationFee: { type: Number, required: true },
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
  availability: [{
    day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    slots: [{
      startTime: String,
      endTime: String,
      isBooked: { type: Boolean, default: false },
    }],
  }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

doctorSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  next();
});

doctorSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

export default model('Doctor', doctorSchema);
