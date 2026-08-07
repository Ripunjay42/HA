import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import GradientButton from '../../components/GradientButton';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function VitalsPendingScreen({ navigation, route }) {
  const { colors } = useThemeColors();
  const expired = !!route?.params?.expired;
  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader title="One Step Left" onBack={() => navigation.goBack()} />
      <View className="flex-1 items-center justify-center px-8">
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-status-warning/10">
          <Ionicons name="pulse" size={44} color={colors.warning} />
        </View>
        <Text className="text-center text-xl font-bold text-ink">
          {expired ? 'Your Token Has Expired' : 'Vitals Not Recorded Yet'}
        </Text>
        <Text className="mt-2 text-center text-sm text-ink-soft">
          {expired
            ? 'Your last token was used for a completed consultation. Please visit the front desk so a nurse can record fresh vitals and generate a new token before you book again.'
            : 'Please visit the front desk so a nurse can record your vitals and generate your UHID and token number. Appointment booking unlocks right after.'}
        </Text>
        <GradientButton title="Got It" onPress={() => navigation.goBack()} style={{ width: '100%', marginTop: 32 }} />
      </View>
    </SafeAreaView>
  );
}
