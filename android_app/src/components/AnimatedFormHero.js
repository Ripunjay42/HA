import { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';

// Decorative animated header for staff forms that capture patient data
// (vitals, registration, consultation notes, nurse assignment) -- a soft
// pulsing glow ring behind the icon badge, plus two small sparkles drifting
// around it. Pure React Native Animated (no reanimated/lottie) to avoid the
// native-module fragility we hit earlier with third-party animation libs.
const Sparkle = ({ delay, offsetX, offsetY, color }) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(progress, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [delay, progress]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  const opacity = progress.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 1, 0] });
  const scale = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 1, 0.6] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: offsetX,
        top: offsetY,
        opacity,
        transform: [{ translateY }, { scale }],
      }}
    >
      <Ionicons name="sparkles" size={14} color={color} />
    </Animated.View>
  );
};

export default function AnimatedFormHero({ icon, title, subtitle }) {
  const { gradients, colors } = useThemeColors();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] });

  return (
    <View className="mb-6 items-center">
      <View style={{ width: 96, height: 96, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={{
            position: 'absolute',
            width: 88,
            height: 88,
            borderRadius: 44,
            backgroundColor: colors.teal,
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          }}
        />
        <Sparkle delay={0} offsetX={4} offsetY={10} color={colors.tealLight} />
        <Sparkle delay={900} offsetX={74} offsetY={18} color={colors.teal} />
        <LinearGradient
          colors={gradients.hero}
          style={{ width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name={icon} size={34} color="#ffffff" />
        </LinearGradient>
      </View>
      {title ? <Text className="mt-3 text-lg font-bold text-ink">{title}</Text> : null}
      {subtitle ? (
        <Text className="mt-1 max-w-[280px] text-center text-xs text-ink-soft">{subtitle}</Text>
      ) : null}
    </View>
  );
}
