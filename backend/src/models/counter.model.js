import { Schema, model } from 'mongoose';

// Generic named atomic counter (e.g. "tokenNo") used wherever a strictly
// sequential, collision-proof number is needed -- incrementing via
// findOneAndUpdate($inc) is atomic at the DB level, unlike counting existing
// documents, which races when multiple requests generate a number at once.
const counterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export default model('Counter', counterSchema);
