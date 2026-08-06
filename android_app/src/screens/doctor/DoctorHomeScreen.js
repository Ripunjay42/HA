import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuth } from '../../hooks/AuthContext';
import api from '../../utils/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function DoctorHomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { colors, appointmentStatusColor } = useThemeColors();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    api.get('/appointments/doctor/mine').then((res) => setAppointments(res.appointments)).finally(() => setLoading(false));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 pt-2">
        <View>
          <Text className="text-xs text-ink-soft">Doctor</Text>
          <Text className="text-xl font-extrabold text-ink">{user?.name}</Text>
        </View>
        <View className="flex-row items-center" style={{ gap: 12 }}>
          <ThemeToggle />
          <Text className="text-xs font-semibold text-brand-teal" onPress={logout}>
            Log Out
          </Text>
        </View>
      </View>

      <Text className="px-5 pb-2 pt-5 text-base font-bold text-ink">Assigned Appointments</Text>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={<Text className="mt-8 text-center text-sm text-ink-soft">No appointments yet.</Text>}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('Consultation', { appointmentId: item._id })}>
            <Card className="mb-3">
              <View className="flex-row items-center">
                <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-surface-muted">
                  <Ionicons name="person" size={20} color={colors.ink} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-ink">{item.patientId?.name}</Text>
                  <Text className="text-xs text-ink-soft">
                    UHID {item.patientId?.uhid}
                    {item.slot?.date ? ` • ${new Date(item.slot.date).toDateString()}` : ''}
                    {item.slot?.startTime ? ` • ${item.slot.startTime}` : ''}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
              </View>
              <View className="mt-3 self-start">
                <StatusBadge status={item.status} color={appointmentStatusColor[item.status]} />
              </View>
            </Card>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
