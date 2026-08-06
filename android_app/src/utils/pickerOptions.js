export const patientOptions = (patients = []) =>
  patients.map((p) => ({ id: p.mrNo, label: `${p.name} • ${p.phone}` }));

export const staffOptions = (staff = []) =>
  staff.map((s) => ({ id: s.staffId, label: s.name }));

export const companyOptions = (companies = []) =>
  companies.map((c) => ({ id: c.name, label: c.code ? `Code: ${c.code}` : 'Registered company' }));
