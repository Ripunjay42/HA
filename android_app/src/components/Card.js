import { View } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';

export default function Card({ children, className = '', style }) {
  const { colors } = useThemeColors();
  return (
    <View
      className={`rounded-xl2 bg-surface p-4 ${className}`}
      style={[{ borderWidth: 1, borderColor: colors.line }, style]}
    >
      {children}
    </View>
  );
}
