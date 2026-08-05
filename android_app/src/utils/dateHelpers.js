const DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

// Doctor availability only stores a day-of-week label (e.g. "Wed"), not a
// concrete date, so slot booking needs to resolve that to the next real
// calendar date within the coming week.
export const nextDateForDay = (dayAbbrev) => {
  const today = new Date();
  const todayIndex = today.getDay();
  const targetIndex = DAY_INDEX[dayAbbrev];
  let diff = targetIndex - todayIndex;
  if (diff < 0) diff += 7;
  const result = new Date(today);
  result.setDate(today.getDate() + diff);
  return result;
};

export const formatShortDate = (date) =>
  date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });

export const formatIsoDate = (date) => date.toISOString().split('T')[0];
