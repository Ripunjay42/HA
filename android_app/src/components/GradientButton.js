import { ActivityIndicator, Pressable, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../hooks/useThemeColors';

export default function GradientButton({
  title, onPress, loading, disabled, variant = 'solid', style,
}) {
  const { gradients } = useThemeColors();
  const isDisabled = disabled || loading;

  if (variant === 'outline') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        className="h-14 items-center justify-center rounded-full border-2 border-brand-teal"
        style={[{ opacity: isDisabled ? 0.6 : 1 }, style]}
      >
        <Text className="text-base font-semibold text-brand-teal">{title}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} disabled={isDisabled} style={[{ opacity: isDisabled ? 0.6 : 1 }, style]}>
      <LinearGradient
        colors={gradients.cta}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          height: 56,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 9999,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="text-base font-semibold text-white">{title}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}
