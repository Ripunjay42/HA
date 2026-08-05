import {
  lightColors, darkColors, buildGradients, buildCardShadow,
  buildPatientStatusColor, buildAppointmentStatusColor,
} from '../constants/theme';
import { useTheme } from './ThemeContext';

export const useThemeColors = () => {
  const { resolvedScheme } = useTheme();
  const isDark = resolvedScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return {
    scheme: isDark ? 'dark' : 'light',
    isDark,
    colors,
    gradients: buildGradients(colors),
    cardShadow: buildCardShadow(colors),
    patientStatusColor: buildPatientStatusColor(colors),
    appointmentStatusColor: buildAppointmentStatusColor(colors),
  };
};
