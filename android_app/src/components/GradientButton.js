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
        className="items-center justify-center rounded-full border-2 border-brand-teal"
        style={[{ height: 56, opacity: isDisabled ? 0.6 : 1 }, style]}
      >
        <Text className="text-base font-semibold text-brand-teal">{title}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[{ height: 56, opacity: isDisabled ? 0.6 : 1 }, style]}
    >
      <LinearGradient
        colors={gradients.cta}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          flex: 1,
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
