import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from '../../components/GradientButton';
import ThemeToggle from '../../components/ThemeToggle';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function WelcomeScreen({ navigation }) {
  const { colors, isDark } = useThemeColors();
  return (
    <View className="flex-1 bg-surface-app">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView className="flex-1 px-8">
        <View className="flex-row justify-end pt-2">
          <ThemeToggle />
        </View>
        <View className="flex-1 items-center justify-center">
          <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-surface-muted">
            <Ionicons name="medkit" size={48} color={colors.teal} />
          </View>
          <Text className="text-4xl font-extrabold text-ink">
            HAS<Text className="text-brand-teal">Care</Text>
          </Text>
          <Text className="mt-2 text-base text-ink-soft">Complete Hospital Care, Simplified</Text>
          <View className="mt-3 h-px w-16 bg-line" />
          <Text className="mt-6 text-center text-base text-ink-soft">
            Register, get vitals checked, and book doctor{'\n'}appointments — all in one place.
          </Text>
        </View>

        <View className="mb-10">
          <GradientButton title="Get Started" onPress={() => navigation.navigate('RoleSelect')} />
          <Text className="mt-5 text-center text-sm text-ink-soft">
            Already have an account?{' '}
            <Text
              className="font-semibold text-brand-teal"
              onPress={() => navigation.navigate('RoleSelect')}
            >
              Sign In
            </Text>
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
