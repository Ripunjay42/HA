import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import GradientButton from '../../components/GradientButton';
import { useAuth } from '../../hooks/AuthContext';
import { useThemeColors } from '../../hooks/useThemeColors';

const Row = ({ icon, label, value, colors }) => (
  <View className="mb-3 flex-row items-center justify-between border-b border-line pb-3">
    <View className="flex-row items-center">
      <Ionicons name={icon} size={16} color={colors.inkSoft} />
      <Text className="ml-2 text-xs text-ink-soft">{label}</Text>
    </View>
    <Text className="text-sm font-semibold text-ink">{value || '—'}</Text>
  </View>
);

export default function PatientProfileScreen() {
  const { user, logout } = useAuth();
  const { colors } = useThemeColors();

  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
      <View className="items-center px-5 pb-4 pt-6">
        <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-brand-navy">
          <Ionicons name="person" size={36} color="#fff" />
        </View>
        <Text className="text-xl font-extrabold text-ink">{user?.name}</Text>
        <Text className="text-xs text-ink-soft">{user?.phone}</Text>
      </View>

      <View className="px-5">
        <Card>
          <Row icon="finger-print-outline" label="MR No" value={user?.mrNo} colors={colors} />
          <Row icon="card-outline" label="UHID" value={user?.uhid || 'Pending vitals'} colors={colors} />
          <Row icon="ticket-outline" label="Token No" value={user?.tokenNo || '—'} colors={colors} />
          <Row icon="male-female-outline" label="Gender" value={user?.gender} colors={colors} />
          <Row icon="calendar-outline" label="Age" value={user?.age?.toString()} colors={colors} />
          <Row icon="home-outline" label="Address" value={user?.address} colors={colors} />
          <Row
            icon="card"
            label="Billing"
            value={user?.paymentCategory === 'non_payment' ? 'Company Covered' : 'Self-Pay'}
            colors={colors}
          />
        </Card>

        <GradientButton title="Log Out" variant="outline" onPress={logout} style={{ marginTop: 24 }} />
      </View>
    </SafeAreaView>
  );
}
