import 'dotenv/config';
import connectDB from './src/config/db.js';
import Admin from './src/models/admin.model.js';
import Department from './src/models/department.model.js';
import Company from './src/models/company.model.js';
import Doctor from './src/models/doctor.model.js';
import Nurse from './src/models/nurse.model.js';
import Receptionist from './src/models/receptionist.model.js';
import mongoose from 'mongoose';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const STANDARD_SLOTS = [
  { startTime: '09:00', endTime: '09:30' },
  { startTime: '10:30', endTime: '11:00' },
  { startTime: '15:00', endTime: '15:30' },
];
const availabilityForAllDays = () => ALL_DAYS.map((day) => ({ day, slots: STANDARD_SLOTS.map((s) => ({ ...s })) }));

const departments = [
  { name: 'General Medicine', description: 'General physician consultations', symptomKeywords: ['fever', 'cold', 'cough', 'weakness', 'headache', 'body ache', 'fatigue'] },
  { name: 'Cardiology', description: 'Heart and cardiovascular care', symptomKeywords: ['chest pain', 'palpitation', 'breathlessness', 'high blood pressure', 'heart'] },
  { name: 'Orthopedics', description: 'Bone, joint, and muscle care', symptomKeywords: ['joint pain', 'fracture', 'back pain', 'knee pain', 'swelling', 'sprain'] },
  { name: 'ENT', description: 'Ear, nose, and throat care', symptomKeywords: ['sore throat', 'ear pain', 'sinus', 'hearing loss', 'nose block'] },
  { name: 'Dermatology', description: 'Skin, hair, and nail care', symptomKeywords: ['rash', 'itching', 'acne', 'skin allergy', 'hair fall'] },
  { name: 'Pediatrics', description: 'Child healthcare', symptomKeywords: ['child fever', 'vaccination', 'infant', 'growth issue'] },
];

const companies = [
  { name: 'Example Corp', code: 'EXC001', status: 'active' },
  { name: 'Acme Industries', code: 'ACM002', status: 'active' },
];

const run = async () => {
  await connectDB();

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const existingAdmin = await Admin.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await Admin.create({
      name: 'Super Admin',
      email: adminEmail,
      passwordHash: process.env.SEED_ADMIN_PASSWORD,
      role: 'superadmin',
    });
    console.log(`Created superadmin: ${adminEmail}`);
  } else {
    console.log('Superadmin already exists, skipping');
  }

  for (const dept of departments) {
    // eslint-disable-next-line no-await-in-loop
    await Department.findOneAndUpdate({ name: dept.name }, dept, { upsert: true });
  }
  console.log(`Seeded ${departments.length} departments`);

  for (const company of companies) {
    // eslint-disable-next-line no-await-in-loop
    await Company.findOneAndUpdate({ name: company.name }, company, { upsert: true });
  }
  console.log(`Seeded ${companies.length} companies`);

  const deptByName = Object.fromEntries(
    (await Department.find()).map((d) => [d.name, d._id]),
  );

  const doctors = [
    {
      name: 'Dr. James Carter', email: 'doctor1@has.local', passwordHash: 'Doctor@123',
      departmentId: deptByName.Cardiology, specialization: 'Cardiologist',
      qualifications: 'MD, DM Cardiology', experienceYears: 12, consultationFee: 500,
      availability: availabilityForAllDays(),
    },
    {
      name: 'Dr. Priya Sharma', email: 'doctor2@has.local', passwordHash: 'Doctor@123',
      departmentId: deptByName['General Medicine'], specialization: 'General Physician',
      qualifications: 'MBBS, MD', experienceYears: 8, consultationFee: 300,
      availability: availabilityForAllDays(),
    },
    {
      name: 'Dr. Arjun Mehta', email: 'doctor3@has.local', passwordHash: 'Doctor@123',
      departmentId: deptByName.Orthopedics, specialization: 'Orthopedic Surgeon',
      qualifications: 'MS Ortho', experienceYears: 10, consultationFee: 400,
      availability: availabilityForAllDays(),
    },
  ];

  for (const doctor of doctors) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await Doctor.findOne({ email: doctor.email });
    // eslint-disable-next-line no-await-in-loop
    if (!exists) await Doctor.create(doctor);
  }
  console.log(`Seeded ${doctors.length} doctors`);

  const nurses = [
    {
      name: 'Nurse Asha Verma', email: 'nurse1@has.local', passwordHash: 'Nurse@123',
      staffId: 'NR00001', ward: 'General Ward', shift: 'morning',
    },
    {
      name: 'Nurse Rohit Singh', email: 'nurse2@has.local', passwordHash: 'Nurse@123',
      staffId: 'NR00002', ward: 'ICU', shift: 'evening',
    },
  ];

  for (const nurse of nurses) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await Nurse.findOne({ email: nurse.email });
    // eslint-disable-next-line no-await-in-loop
    if (!exists) await Nurse.create(nurse);
  }
  console.log(`Seeded ${nurses.length} nurses`);

  const receptionists = [
    {
      name: 'Meera Nair', email: 'reception1@has.local', passwordHash: 'Recep@123',
      staffId: 'RC00001',
    },
  ];

  for (const receptionist of receptionists) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await Receptionist.findOne({ email: receptionist.email });
    // eslint-disable-next-line no-await-in-loop
    if (!exists) await Receptionist.create(receptionist);
  }
  console.log(`Seeded ${receptionists.length} receptionists`);

  await mongoose.disconnect();
  console.log('Seed complete');
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
