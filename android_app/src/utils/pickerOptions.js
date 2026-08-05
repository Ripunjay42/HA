export const patientOptions = (patients = []) =>
  patients.map((p) => ({ id: p.mrNo, label: `${p.name} • ${p.phone}` }));

export const staffOptions = (staff = []) =>
  staff.map((s) => ({ id: s.staffId, label: s.name }));
