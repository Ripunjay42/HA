import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from '../../components/GradientButton';
import ThemeToggle from '../../components/ThemeToggle';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function WelcomeScreen({ navigation }) {
  const { gradients } = useThemeColors();
  return (
    <LinearGradient colors={gradients.hero} style={{ flex: 1 }}>
      <StatusBar style="light" />
      <SafeAreaView className="flex-1 px-8">
        <View className="flex-row justify-end pt-2">
          <ThemeToggle className="h-10 w-10 items-center justify-center rounded-full bg-white/10" iconColor="#5FD8E8" />
        </View>
        <View className="flex-1 items-center justify-center">
          <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-white/10">
            <Ionicons name="medkit" size={48} color="#5FD8E8" />
          </View>
          <Text className="text-4xl font-extrabold text-white">
            HAS<Text className="text-brand-tealLight">Care</Text>
          </Text>
          <Text className="mt-2 text-base text-white/70">Complete Hospital Care, Simplified</Text>
          <View className="mt-3 h-px w-16 bg-white/20" />
          <Text className="mt-6 text-center text-base text-white/60">
            Register, get vitals checked, and book doctor{'\n'}appointments — all in one place.
          </Text>
        </View>

        <View className="mb-10">
          <GradientButton title="Get Started" onPress={() => navigation.navigate('RoleSelect')} />
          <Text className="mt-5 text-center text-sm text-white/60">
            Already have an account?{' '}
            <Text
              className="font-semibold text-brand-tealLight"
              onPress={() => navigation.navigate('RoleSelect')}
            >
              Sign In
            </Text>
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
