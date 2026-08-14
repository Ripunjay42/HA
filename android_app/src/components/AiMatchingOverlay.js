import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';

const STEPS = [
  'Analyzing symptoms...',
  'Matching the right department...',
  'Finding the best-fit doctor...',
];

// Full-screen "AI is thinking" overlay shown while the backend resolves a
// symptom-based department/doctor match via the NIM LLM (a few seconds,
// noticeably slower than the old instant keyword scan) -- built from the
// same plain-Animated + expo-linear-gradient primitives as
// AnimatedFormHero to keep the app's no-reanimated/no-lottie constraint.
export default function AiMatchingOverlay({ visible }) {
  const { gradients } = useThemeColors();
  const pulse = useRef(new Animated.Value(0)).current;
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!visible) {
      setStepIndex(0);
      return undefined;
    }

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1100, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ]),
    );
    pulseLoop.start();

    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % STEPS.length);
    }, 1600);

    return () => {
      pulseLoop.stop();
      clearInterval(interval);
    };
  }, [visible, pulse]);

  if (!visible) return null;

  const coreScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(10,14,20,0.85)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Animated.View style={{ transform: [{ scale: coreScale }] }}>
          <LinearGradient
            colors={gradients.cta}
            style={{ width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="sparkles" size={32} color="#ffffff" />
          </LinearGradient>
        </Animated.View>

        <Text style={{ marginTop: 28, fontSize: 17, fontWeight: '700', color: '#ffffff' }}>
          AI Matching in Progress
        </Text>
        <Text style={{ marginTop: 8, fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
          {STEPS[stepIndex]}
        </Text>
      </View>
    </Modal>
  );
}
