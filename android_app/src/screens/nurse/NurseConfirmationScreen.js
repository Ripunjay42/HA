import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import GradientButton from '../../components/GradientButton';
import api from '../../utils/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function NurseConfirmationScreen({ navigation, route }) {
  const { appointmentId } = route.params;
  const { colors } = useThemeColors();
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    api.get(`/appointments/${appointmentId}`).then((res) => setAppointment(res.appointment));
  }, [appointmentId]);

  if (!appointment) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface-app">
        <ActivityIndicator color={colors.teal} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <View className="flex-1 items-center justify-center px-8">
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-status-success/10">
          <Ionicons name="checkmark-circle" size={56} color={colors.success} />
        </View>
        <Text className="text-center text-2xl font-bold text-ink">Booking Confirmed</Text>
        <Text className="mt-2 text-center text-sm text-ink-soft">
          The patient's appointment has been confirmed.
        </Text>

        <Card className="mt-8 w-full">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-xs text-ink-soft">Doctor</Text>
            <Text className="text-sm font-semibold text-ink">{appointment.selectedDoctor?.name}</Text>
          </View>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-xs text-ink-soft">Department</Text>
            <Text className="text-sm font-semibold text-ink">{appointment.matchedDepartment?.name || '—'}</Text>
          </View>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-xs text-ink-soft">Date</Text>
            <Text className="text-sm font-semibold text-ink">
              {appointment.slot?.date ? new Date(appointment.slot.date).toDateString() : '—'}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-ink-soft">Time</Text>
            <Text className="text-sm font-semibold text-ink">{appointment.slot?.startTime}</Text>
          </View>
        </Card>

        <GradientButton
          title="Back to Patients"
          onPress={() => navigation.popToTop()}
          style={{ width: '100%', marginTop: 32 }}
        />
      </View>
    </SafeAreaView>
  );
}
