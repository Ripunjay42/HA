import { Schema, model } from 'mongoose';

const departmentSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  symptomKeywords: [{ type: String, lowercase: true, trim: true }],
}, { timestamps: true });

export default model('Department', departmentSchema);
