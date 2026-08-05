import { Text, TextInput, View } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';

export default function Input({ label, containerClassName = '', style, ...props }) {
  const { colors } = useThemeColors();
  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label ? <Text className="mb-2 text-sm font-medium text-ink-soft">{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.inkFaint}
        className="h-14 rounded-2xl border border-line bg-surface px-4 text-base text-ink"
        style={[{ fontFamily: 'Ubuntu_400Regular' }, style]}
        {...props}
      />
    </View>
  );
}
