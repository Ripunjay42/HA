import Department from '../models/department.model.js';
import Doctor from '../models/doctor.model.js';

// Scores each department by how many of its symptomKeywords appear in the
// submitted symptoms/purpose text. Returns null if nothing scores > 0 so the
// caller can fall back to showing all departments, per the spec's fallback rule.
export const matchDepartmentBySymptoms = async (symptoms = [], purpose = '') => {
  const searchText = [...symptoms, purpose].join(' ').toLowerCase();
  const departments = await Department.find();

  const scored = departments
    .map((dept) => {
      const score = (dept.symptomKeywords || []).filter((keyword) =>
        searchText.includes(keyword)).length;
      return { dept, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return null;

  const bestDepartment = scored[0].dept;
  const matchedDoctors = await Doctor.find({
    departmentId: bestDepartment._id,
    status: 'active',
  });

  return { department: bestDepartment, doctors: matchedDoctors };
};
