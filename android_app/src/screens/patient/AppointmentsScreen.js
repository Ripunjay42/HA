import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import api from '../../utils/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';

const RESUMABLE = ['pending_doctor', 'pending_slot', 'pending_payment'];

export default function AppointmentsScreen({ navigation }) {
  const { colors, appointmentStatusColor } = useThemeColors();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    api.get('/appointments/mine').then((res) => setAppointments(res.appointments)).finally(() => setLoading(false));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Lets a patient tap back into an in-progress appointment and pick up
  // exactly where they left off, instead of only being able to view it.
  const resumeAppointment = (appointment) => {
    if (appointment.status === 'pending_doctor') {
      if (appointment.matchedDoctors?.length > 0) {
        navigation.navigate('MatchedDoctors', {
          appointmentId: appointment._id,
          doctors: appointment.matchedDoctors,
          recommendedDoctorId: appointment.recommendedDoctor?._id || null,
        });
      } else {
        navigation.navigate('Departments', { appointmentId: appointment._id });
      }
      return;
    }
    if (appointment.status === 'pending_slot' && appointment.selectedDoctor) {
      navigation.navigate('BookSlot', { appointmentId: appointment._id, doctor: appointment.selectedDoctor });
      return;
    }
    if (appointment.status === 'pending_payment' && appointment.selectedDoctor) {
      navigation.navigate('Payment', {
        appointmentId: appointment._id,
        amount: appointment.selectedDoctor.consultationFee,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
      <View className="px-5 pb-2 pt-4">
        <Text className="text-xl font-extrabold text-ink">My Appointments</Text>
      </View>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={
          <Text className="mt-8 text-center text-sm text-ink-soft">No appointments yet.</Text>
        }
        renderItem={({ item }) => {
          const resumable = RESUMABLE.includes(item.status);
          const Wrapper = resumable ? Pressable : View;
          return (
            <Wrapper onPress={resumable ? () => resumeAppointment(item) : undefined}>
              <Card className="mb-3">
                <View className="flex-row items-center">
                  <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-surface-muted">
                    <Ionicons name="person" size={20} color={colors.ink} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-ink">
                      {item.selectedDoctor?.name || 'Doctor not selected'}
                    </Text>
                    <Text className="text-xs text-ink-soft">
                      {item.matchedDepartment?.name || 'General'}
                      {item.slot?.date ? ` • ${new Date(item.slot.date).toDateString()}` : ''}
                      {item.slot?.startTime ? ` • ${item.slot.startTime}` : ''}
                    </Text>
                  </View>
                  {resumable && <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />}
                </View>
                <View className="mt-3 flex-row items-center justify-between">
                  <StatusBadge status={item.status} color={appointmentStatusColor[item.status]} />
                  {item.purpose ? <Text className="text-xs text-ink-soft">{item.purpose}</Text> : null}
                </View>
                {resumable && (
                  <Text className="mt-2 text-xs font-semibold text-brand-teal">Tap to continue booking</Text>
                )}
              </Card>
            </Wrapper>
          );
        }}
      />
    </SafeAreaView>
  );
}
