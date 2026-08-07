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
  surfaceMuted: '#F5F6F8',
  surfaceApp: '#FFFFFF',
  ink: '#0B2540',
  inkSoft: '#5C7A94',
  inkFaint: '#93AFC4',
  line: '#E6E8EC',
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

// Shadows should always look like a dark drop-shadow, in both themes --
// tying shadowColor to the theme's text color would turn it into a pale
// glow in dark mode, since ink is near-white there.
export const buildCardShadow = () => ({
  shadowColor: '#000000',
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
  token_expired: colors.danger,
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
