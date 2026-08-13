import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import api from '../../utils/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function NurseAppointmentsScreen({ navigation, route }) {
  const { uhid, patientName } = route.params;
  const { colors, appointmentStatusColor } = useThemeColors();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/appointments/patient/${uhid}`)
      .then((res) => setAppointments(res.appointments))
      .catch((err) => setError(err.message || 'Unable to load appointments'))
      .finally(() => setLoading(false));
  }, [uhid]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
      <View className="flex-row items-center px-5 pt-4 pb-2" style={{ gap: 12 }}>
        <Ionicons name="arrow-back" size={22} color={colors.ink} onPress={() => navigation.goBack()} />
        <View>
          <Text className="text-xl font-extrabold text-ink">Appointments</Text>
          <Text className="text-xs text-ink-soft">{patientName}</Text>
        </View>
      </View>

      {error ? <Text className="px-5 mb-2 text-sm text-status-danger">{error}</Text> : null}

      <FlatList
        data={appointments}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={
          !loading ? (
            <View className="mt-10 items-center">
              <Ionicons name="calendar-outline" size={32} color={colors.inkFaint} />
              <Text className="mt-2 text-sm text-ink-soft">No appointments found.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
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
            </View>
            <View className="mt-3 flex-row items-center justify-between">
              <StatusBadge status={item.status} color={appointmentStatusColor[item.status]} />
              {item.purpose ? <Text className="text-xs text-ink-soft">{item.purpose}</Text> : null}
            </View>
            {item.bookedBy === 'nurse' && (
              <Text className="mt-2 text-xs text-ink-soft">Booked by nurse</Text>
            )}
          </Card>
        )}
      />
    </SafeAreaView>
  );
}
