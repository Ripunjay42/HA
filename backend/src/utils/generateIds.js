import Patient from '../models/patient.model.js';
import Counter from '../models/counter.model.js';

const randomDigits = (length) =>
  Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');

const randomAlphaNum = (length) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const datePrefix = () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
};

// MR No is assigned at registration and is not required to be permanent,
// so a date-prefixed random suffix (retried on collision) is sufficient.
export const generateMrNo = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = `MR${datePrefix()}${randomDigits(4)}`;
    // eslint-disable-next-line no-await-in-loop
    const exists = await Patient.exists({ mrNo: candidate });
    if (!exists) return candidate;
  }
  throw new Error('Failed to generate a unique MR No, please retry');
};

// UHID must stay permanent for the patient across all future visits,
// so it is generated once (after vitals) and never regenerated.
export const generateUhid = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = `UH${randomAlphaNum(8)}`;
    // eslint-disable-next-line no-await-in-loop
    const exists = await Patient.exists({ uhid: candidate });
    if (!exists) return candidate;
  }
  throw new Error('Failed to generate a unique UHID, please retry');
};

// Shared by Receptionist and Nurse onboarding, which both require a unique staffId.
export const generateStaffId = async (Model, prefix) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = `${prefix}${randomDigits(5)}`;
    // eslint-disable-next-line no-await-in-loop
    const exists = await Model.exists({ staffId: candidate });
    if (!exists) return candidate;
  }
  throw new Error('Failed to generate a unique staff ID, please retry');
};

// Token No is not tied to a calendar day -- a token can stay active across
// multiple days (e.g. an appointment booked for a later date), so numbering
// must never reset daily. A single global counter, incremented atomically
// via findOneAndUpdate, guarantees every token ever issued is unique across
// all patients, active or expired, for the lifetime of the deployment.
export const generateTokenNo = async () => {
  const counter = await Counter.findOneAndUpdate(
    { _id: 'tokenNo' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  return `T${String(counter.seq).padStart(5, '0')}`;
};
