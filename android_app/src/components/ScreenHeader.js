import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';

export default function ScreenHeader({ title, onBack, right }) {
  const { colors } = useThemeColors();
  return (
    <View className="flex-row items-center justify-between px-5 pb-4 pt-2">
      {onBack ? (
        <Pressable
          onPress={onBack}
          style={{
            height: 40, width: 40, borderRadius: 20,
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: colors.surfaceMuted,
          }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
      ) : (
        <View className="h-10 w-10" />
      )}
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.ink }}>{title}</Text>
      {right || <View className="h-10 w-10" />}
    </View>
  );
}
