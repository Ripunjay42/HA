import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';

export default function ScreenHeader({ title, onBack, right }) {
  const { colors } = useThemeColors();
  return (
    <View className="flex-row items-center justify-between px-5 pb-4 pt-2">
      {onBack ? (
        <Pressable onPress={onBack} className="h-10 w-10 items-center justify-center rounded-full bg-surface-muted">
          <Ionicons name="chevron-back" size={22} color={colors.navy} />
        </Pressable>
      ) : (
        <View className="h-10 w-10" />
      )}
      <Text className="text-lg font-bold text-ink">{title}</Text>
      {right || <View className="h-10 w-10" />}
    </View>
  );
}
