import Department from '../models/department.model.js';
import Doctor from '../models/doctor.model.js';
import { chatComplete } from './nimChatClient.js';

// Keyword scan against symptomKeywords -- used only when the AI matcher is
// unavailable/unconfigured or returns an unusable answer, so booking never
// hard-fails on an API hiccup. Falls back to a single department's active
// doctors, since there's no ranking signal available without the AI.
const matchByKeywords = async (departments, searchText) => {
  const scored = departments
    .map((dept) => {
      const score = (dept.symptomKeywords || []).filter((keyword) =>
        searchText.includes(keyword)).length;
      return { dept, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  const bestDepartment = scored[0]?.dept;
  if (!bestDepartment) return null;

  const doctors = await Doctor.find({ departmentId: bestDepartment._id, status: 'active' })
    .populate('departmentId', 'name');
  return doctors;
};

// Asks the NIM-hosted LLM to rank the doctors (across every department, not
// just one) who are relevant to the patient's purpose/symptoms -- this lets
// a patient with overlapping symptoms (e.g. joint pain that could be
// Orthopedics or General Medicine) see relevant doctors from every
// applicable department at once, rather than being funneled into a single
// department guess.
const matchDoctorsByAi = async (doctors, purpose, symptoms) => {
  const catalog = doctors.map((d) => ({
    id: String(d._id),
    name: d.name,
    department: d.departmentId?.name || '',
    specialization: d.specialization || '',
    experienceYears: d.experienceYears || 0,
  }));

  const reply = await chatComplete([
    {
      role: 'system',
      content: 'You are an experienced hospital triage assistant. Given a patient\'s purpose of visit and '
        + 'symptoms, and a list of available doctors (with their department and specialization), use your '
        + 'medical knowledge to decide which doctors would genuinely be relevant for this patient -- the same '
        + 'way a real triage nurse would. A symptom can be relevant to doctors in more than one department '
        + '(e.g. joint pain could reasonably go to Orthopedics or General Medicine), so include every doctor '
        + 'who is a real, medically sound fit, but do NOT include a doctor just because their department is '
        + 'loosely related or their symptoms overlap only superficially. Reply with ONLY a JSON array of doctor '
        + '"id" values, ordered from most to least relevant. Reply with an empty array [] if none are a '
        + 'reasonable match. Reply with ONLY the JSON array, nothing else.',
    },
    {
      role: 'user',
      content: `Doctors:\n${JSON.stringify(catalog)}\n\nPurpose of visit: ${purpose || '(none given)'}\nSymptoms: ${symptoms.join(', ') || '(none given)'}`,
    },
  ], { maxTokens: 200 });

  if (!reply) return null;

  let ids;
  try {
    ids = JSON.parse(reply.trim().match(/\[[\s\S]*\]/)?.[0] || '[]');
  } catch {
    return null;
  }
  if (!Array.isArray(ids) || ids.length === 0) return null;

  const byId = new Map(doctors.map((d) => [String(d._id), d]));
  const ranked = ids.map((id) => byId.get(String(id))).filter(Boolean);
  return ranked.length > 0 ? ranked : null;
};

// Matches the submitted symptoms/purpose text to a ranked list of relevant
// doctors spanning any number of departments -- preferring an AI-driven
// match and falling back to keyword-based department scoring when the AI is
// unavailable/unconfigured or returns an unusable answer. Returns null if
// nothing matches so the caller can fall back to showing all departments,
// per the spec's fallback rule.
export const matchDoctorsBySymptoms = async (symptoms = [], purpose = '') => {
  const [departments, allDoctors] = await Promise.all([
    Department.find(),
    Doctor.find({ status: 'active' }).populate('departmentId', 'name'),
  ]);
  if (allDoctors.length === 0) return null;

  const searchText = [...symptoms, purpose].join(' ').toLowerCase();

  const aiRanked = await matchDoctorsByAi(allDoctors, purpose, symptoms).catch(() => null);
  const doctors = aiRanked || await matchByKeywords(departments, searchText);
  if (!doctors || doctors.length === 0) return null;

  const departmentsById = new Map();
  doctors.forEach((d) => {
    if (d.departmentId) departmentsById.set(String(d.departmentId._id), d.departmentId);
  });

  return {
    doctors,
    recommendedDoctor: doctors[0],
    departments: [...departmentsById.values()],
  };
};
