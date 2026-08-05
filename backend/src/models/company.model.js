import { Schema, model } from 'mongoose';

const companySchema = new Schema({
  name: { type: String, required: true, unique: true },
  code: String,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

export default model('Company', companySchema);
