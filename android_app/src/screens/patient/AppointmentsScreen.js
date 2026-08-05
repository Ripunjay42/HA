import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import api from '../../utils/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function AppointmentsScreen() {
  const { colors, appointmentStatusColor } = useThemeColors();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    api.get('/appointments/mine').then((res) => setAppointments(res.appointments)).finally(() => setLoading(false));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

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
        renderItem={({ item }) => (
          <Card className="mb-3">
            <View className="flex-row items-center">
              <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-surface-muted">
                <Ionicons name="person" size={20} color={colors.navy} />
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
          </Card>
        )}
      />
    </SafeAreaView>
  );
}
