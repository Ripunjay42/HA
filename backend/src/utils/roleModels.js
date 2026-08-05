import Admin from '../models/admin.model.js';
import Receptionist from '../models/receptionist.model.js';
import Nurse from '../models/nurse.model.js';
import Doctor from '../models/doctor.model.js';

// Central place mapping a role string to its collection, so admin staff
// onboarding stays extensible to new staff types without touching callers.
const roleModels = {
  admin: Admin,
  receptionist: Receptionist,
  nurse: Nurse,
  doctor: Doctor,
};

export default roleModels;
