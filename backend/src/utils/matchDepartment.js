import Department from '../models/department.model.js';
import Doctor from '../models/doctor.model.js';
import { chatComplete } from './nimChatClient.js';

// Keyword scan against symptomKeywords -- used only when the AI matcher is
// unavailable/unconfigured or returns an unusable answer, so booking never
// hard-fails on an API hiccup.
const matchDepartmentByKeywords = (departments, searchText) => {
  const scored = departments
    .map((dept) => {
      const score = (dept.symptomKeywords || []).filter((keyword) =>
        searchText.includes(keyword)).length;
      return { dept, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.dept || null;
};

// Asks the NIM-hosted LLM to pick the single best-matching department for
// the patient's purpose/symptoms, given the real department list -- this
// lets non-keyword phrasing (e.g. "my knee hurts when I climb stairs") match
// Orthopedics even without a literal "knee pain" keyword on file.
const matchDepartmentByAi = async (departments, purpose, symptoms) => {
  const catalog = departments.map((d) => ({ id: String(d._id), name: d.name, description: d.description || '' }));

  const reply = await chatComplete([
    {
      role: 'system',
      content: 'You are a hospital triage assistant. Given a patient\'s purpose of visit and symptoms, '
        + 'pick the single most appropriate department from the provided list. '
        + 'Reply with ONLY the department "id" value from the list, and nothing else. '
        + 'If none of the departments are a reasonable match, reply with exactly: none',
    },
    {
      role: 'user',
      content: `Departments:\n${JSON.stringify(catalog)}\n\nPurpose of visit: ${purpose || '(none given)'}\nSymptoms: ${symptoms.join(', ') || '(none given)'}`,
    },
  ], { maxTokens: 40 });

  if (!reply) return null;
  const id = reply.trim().split(/\s+/)[0].replace(/["'.]/g, '');
  if (id === 'none') return null;
  return departments.find((d) => String(d._id) === id) || null;
};

// Asks the LLM to pick which of the department's active doctors best fits
// the patient's symptoms, based on specialization -- e.g. preferring a
// sports-medicine-leaning orthopedist for a running injury. Returns null
// (no recommendation, just an unordered list) if nothing stands out.
const recommendDoctorByAi = async (doctors, purpose, symptoms) => {
  if (doctors.length <= 1) return doctors[0] || null;

  const catalog = doctors.map((d) => ({
    id: String(d._id),
    name: d.name,
    specialization: d.specialization || '',
    experienceYears: d.experienceYears || 0,
  }));

  const reply = await chatComplete([
    {
      role: 'system',
      content: 'You are a hospital triage assistant. Given a patient\'s purpose of visit and symptoms, and a list '
        + 'of doctors (with their specialization) already in the correct department, pick the single doctor whose '
        + 'specialization best fits this patient. Reply with ONLY the doctor "id" value, and nothing else. '
        + 'If no doctor stands out as a better fit than the others, reply with exactly: none',
    },
    {
      role: 'user',
      content: `Doctors:\n${JSON.stringify(catalog)}\n\nPurpose of visit: ${purpose || '(none given)'}\nSymptoms: ${symptoms.join(', ') || '(none given)'}`,
    },
  ], { maxTokens: 40 });

  if (!reply) return null;
  const id = reply.trim().split(/\s+/)[0].replace(/["'.]/g, '');
  if (id === 'none') return null;
  return doctors.find((d) => String(d._id) === id) || null;
};

// Matches the submitted symptoms/purpose text to a department and, within
// it, an optionally-recommended doctor -- preferring an AI-driven match and
// falling back to keyword scoring for the department when the AI is
// unavailable/unconfigured or returns an unusable answer. Returns null if
// nothing matches so the caller can fall back to showing all departments,
// per the spec's fallback rule.
export const matchDepartmentBySymptoms = async (symptoms = [], purpose = '') => {
  const departments = await Department.find();
  if (departments.length === 0) return null;

  const searchText = [...symptoms, purpose].join(' ').toLowerCase();

  let bestDepartment = await matchDepartmentByAi(departments, purpose, symptoms).catch(() => null);
  if (!bestDepartment) {
    bestDepartment = matchDepartmentByKeywords(departments, searchText);
  }
  if (!bestDepartment) return null;

  const matchedDoctors = await Doctor.find({
    departmentId: bestDepartment._id,
    status: 'active',
  });

  const recommendedDoctor = await recommendDoctorByAi(matchedDoctors, purpose, symptoms).catch(() => null);

  // Surface the recommendation first in the list so any "matched doctors"
  // UI naturally leads with it, in addition to the explicit field.
  const orderedDoctors = recommendedDoctor
    ? [recommendedDoctor, ...matchedDoctors.filter((d) => String(d._id) !== String(recommendedDoctor._id))]
    : matchedDoctors;

  return { department: bestDepartment, doctors: orderedDoctors, recommendedDoctor };
};
