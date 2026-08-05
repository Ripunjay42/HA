import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/ThemeContext';
import { useThemeColors } from '../hooks/useThemeColors';

// Cycles system -> light -> dark -> system. Icon reflects the resolved
// (actually applied) scheme; system mode is indicated by the outline icon.
export default function ThemeToggle({ style, className, iconColor }) {
  const { preference, resolvedScheme, setThemePreference } = useTheme();
  const { colors } = useThemeColors();

  const next = { system: 'light', light: 'dark', dark: 'system' }[preference];
  const icon = preference === 'system'
    ? 'contrast-outline'
    : resolvedScheme === 'dark' ? 'moon' : 'sunny';

  return (
    <Pressable
      onPress={() => setThemePreference(next)}
      className={className || 'h-10 w-10 items-center justify-center rounded-full bg-surface-muted'}
      style={style}
    >
      <Ionicons name={icon} size={18} color={iconColor || colors.teal} />
    </Pressable>
  );
}
