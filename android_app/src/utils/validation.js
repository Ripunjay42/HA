// Input filters: strip characters as the user types.
export const filterDigits = (value = '') => value.replace(/[^0-9]/g, '');

export const filterDecimal = (value = '') => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const firstDot = cleaned.indexOf('.');
  if (firstDot === -1) return cleaned;
  return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
};

export const filterAlpha = (value = '') => value.replace(/[^a-zA-Z\s'-]/g, '');

export const filterBloodPressure = (value = '') => value.replace(/[^0-9/]/g, '');

// Submit-time checks.
export const isValidPhone = (value = '') => /^[0-9]{10}$/.test(value);

export const isValidName = (value = '') => /^[a-zA-Z\s'-]+$/.test(value.trim());
