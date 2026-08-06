import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/ThemeContext';
import { useThemeColors } from '../hooks/useThemeColors';

// A plain light/dark flip: every tap switches to the opposite of whatever
// is currently showing. Starts from the system setting on first launch, but
// once tapped it's a predictable binary switch -- no three-way "system"
// step in between, which was confusing (a tap from an already-dark system
// state used to jump to explicitly-pinned light, looking like a bug).
export default function ThemeToggle({ style, className, iconColor }) {
  const { resolvedScheme, setThemePreference } = useTheme();
  const { colors } = useThemeColors();

  const isDark = resolvedScheme === 'dark';

  return (
    <Pressable
      onPress={() => setThemePreference(isDark ? 'light' : 'dark')}
      className={className || 'h-10 w-10 items-center justify-center rounded-full bg-surface-muted'}
      style={style}
    >
      <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={iconColor || colors.teal} />
    </Pressable>
  );
}
