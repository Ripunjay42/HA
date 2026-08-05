// Accent colors stay identical across light/dark -- only surfaces, text, and
// borders need to flip. Keeping them here (rather than duplicated per-scheme)
// avoids drift between the two palettes.
const ACCENTS = {
  navy: '#0B2E4F',
  navyDark: '#061A30',
  teal: '#1FB6D4',
  tealLight: '#5FD8E8',
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',
};

export const lightColors = {
  ...ACCENTS,
  surface: '#FFFFFF',
  surfaceMuted: '#EAF4FC',
  surfaceApp: '#F3FAFE',
  ink: '#0B2540',
  inkSoft: '#5C7A94',
  inkFaint: '#93AFC4',
  line: '#DCEAF5',
};

export const darkColors = {
  ...ACCENTS,
  surface: '#161E29',
  surfaceMuted: '#1E2835',
  surfaceApp: '#0D121A',
  ink: '#ECF4FB',
  inkSoft: '#9AB0C4',
  inkFaint: '#64768F',
  line: '#2A3644',
};

export const buildGradients = (colors) => ({
  hero: [colors.navyDark, colors.navy],
  cta: [colors.teal, colors.tealLight],
  card: [colors.navy, '#164876'],
});

export const buildCardShadow = (colors) => ({
  shadowColor: colors.ink,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 16,
  elevation: 4,
});

// Status -> department-flow stage badge color, used across patient/nurse/receptionist screens.
export const buildPatientStatusColor = (colors) => ({
  registered: colors.inkFaint,
  nurse_assigned: colors.warning,
  vitals_recorded: colors.teal,
  token_generated: colors.success,
});

export const buildAppointmentStatusColor = (colors) => ({
  pending_doctor: colors.warning,
  pending_slot: colors.warning,
  pending_payment: colors.danger,
  confirmed: colors.success,
  cancelled: colors.danger,
  completed: colors.inkFaint,
});

// Static, theme-independent exports kept for the handful of call sites that
// run outside a component (no hook access). Prefer useThemeColors() inside
// components so colors respond to the device's light/dark setting.
export const colors = lightColors;
export const gradients = buildGradients(lightColors);
export const cardShadow = buildCardShadow(lightColors);
export const patientStatusColor = buildPatientStatusColor(lightColors);
export const appointmentStatusColor = buildAppointmentStatusColor(lightColors);
