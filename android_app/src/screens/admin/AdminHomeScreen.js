import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../../components/Card';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuth } from '../../hooks/AuthContext';
import api from '../../utils/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';

const STAFF_ROLES = [
  { key: 'doctor', label: 'Doctors', icon: 'medkit' },
  { key: 'nurse', label: 'Nurses', icon: 'heart' },
  { key: 'receptionist', label: 'Receptionists', icon: 'people' },
];

const OTHER_LINKS = [
  { key: 'departments', label: 'Departments', icon: 'body', screen: 'AdminDepartments' },
  { key: 'companies', label: 'Companies', icon: 'business', screen: 'AdminCompanies' },
];

const StatTile = ({ label, value, icon, tint, onPress }) => {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper onPress={onPress} className="mb-3 w-[48%]">
      <Card className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center" style={{ gap: 10 }}>
          <View
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: `${tint}1F` }}
          >
            <Ionicons name={icon} size={20} color={tint} />
          </View>
          <Text className="flex-1 text-xs text-ink-soft" numberOfLines={2}>{label}</Text>
        </View>
        <Text className="text-xl font-extrabold text-ink">{value}</Text>
      </Card>
    </Wrapper>
  );
};

export default function AdminHomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { colors } = useThemeColors();
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    api.get('/admin/reports').then((res) => setReports(res.reports)).finally(() => setLoading(false));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const staffCount = (key) => reports?.staff?.[`${key}s`] ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 pt-2">
        <View>
          <Text className="text-xs text-ink-soft">Admin</Text>
          <Text className="text-xl font-extrabold text-ink">{user?.name}</Text>
        </View>
        <View className="flex-row items-center" style={{ gap: 12 }}>
          <ThemeToggle />
          <Text className="text-md font-extrabold text-brand-teal" onPress={logout}>
            Log Out
          </Text>
        </View>
      </View>

      <ScrollView
        className="px-5 pt-5"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      >
        {reports && (
          <View className="mb-2 flex-row flex-wrap justify-between">
            <StatTile
              label="Total Patients"
              value={reports.patients}
              icon="people-circle"
              tint={colors.teal}
              onPress={() => navigation.navigate('PatientList')}
            />
            <StatTile
              label="Total Revenue"
              value={`₹${reports.totalRevenue}`}
              icon="cash"
              tint={colors.success}
            />
            <StatTile
              label="Confirmed Appointments"
              value={reports.appointmentsByStatus.confirmed || 0}
              icon="calendar"
              tint={colors.warning}
            />
            <StatTile
              label="Completed Appointments"
              value={reports.appointmentsByStatus.completed || 0}
              icon="checkmark-done-circle"
              tint={colors.navy}
            />
          </View>
        )}

        <Text className="mb-3 mt-3 text-base font-bold text-ink">Manage Staff</Text>
        <View className="mb-2 flex-row flex-wrap items-center justify-start gap-1">
          {STAFF_ROLES.map((r) => (
            <Pressable
              key={r.key}
              onPress={() => navigation.navigate('StaffList', { role: r.key })}
              style={{ width: '31%' }}
            >
              <Card className="mb-4 items-center" style={{ aspectRatio: 1, justifyContent: 'center', padding: 10 }}>
                <Ionicons name={r.icon} size={24} color={colors.teal} />
                <Text className="mt-2 text-center text-md font-semibold text-ink">{r.label}</Text>
                {reports && (
                  <Text className="mt-0.5 text-center text-[11px] text-ink-soft">{staffCount(r.key)}</Text>
                )}
              </Card>
            </Pressable>
          ))}
        </View>

        <Text className="mb-3 mt-3 text-base font-bold text-ink">Manage Others</Text>
        <View className="mb-2 flex-row flex-wrap items-center justify-start  gap-1">
          {OTHER_LINKS.map((link) => (
            <Pressable
              key={link.key}
              onPress={() => navigation.navigate(link.screen)}
              style={{ width: '31%' }}
            >
              <Card className="mb-4 items-center" style={{ aspectRatio: 1, justifyContent: 'center', padding: 10 }}>
                <Ionicons name={link.icon} size={24} color={colors.teal} />
                <Text className="mt-2 text-center text-xs font-semibold text-ink">{link.label}</Text>
              </Card>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
