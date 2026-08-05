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

const LINKS = [
  { key: 'staff', label: 'Staff', icon: 'people', screen: 'StaffList' },
  { key: 'add-staff', label: 'Add Staff', icon: 'person-add', screen: 'AddStaff' },
  { key: 'departments', label: 'Departments', icon: 'body', screen: 'AdminDepartments' },
  { key: 'companies', label: 'Companies', icon: 'business', screen: 'AdminCompanies' },
];

const StatTile = ({ label, value }) => (
  <Card className="mb-3 mr-3 w-[47%]">
    <Text className="text-2xl font-extrabold text-ink">{value}</Text>
    <Text className="text-xs text-ink-soft">{label}</Text>
  </Card>
);

export default function AdminHomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { colors } = useThemeColors();
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    api.get('/admin/reports').then((res) => setReports(res.reports)).finally(() => setLoading(false));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 pt-2">
        <View>
          <Text className="text-xs text-ink-soft">Admin</Text>
          <Text className="text-xl font-extrabold text-ink">{user?.name}</Text>
        </View>
        <View className="flex-row items-center" style={{ gap: 12 }}>
          <ThemeToggle />
          <Text className="text-xs font-semibold text-brand-teal" onPress={logout}>
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
            <StatTile label="Total Patients" value={reports.patients} />
            <StatTile label="Total Revenue" value={`₹${reports.totalRevenue}`} />
            <StatTile label="Doctors" value={reports.staff.doctors} />
            <StatTile label="Nurses" value={reports.staff.nurses} />
            <StatTile label="Receptionists" value={reports.staff.receptionists} />
            <StatTile label="Confirmed Appts" value={reports.appointmentsByStatus.confirmed || 0} />
          </View>
        )}

        <Text className="mb-3 mt-3 text-base font-bold text-ink">Manage</Text>
        <View className="flex-row flex-wrap justify-between">
          {LINKS.map((link) => (
            <Pressable
              key={link.key}
              onPress={() => navigation.navigate(link.screen)}
              className="mb-4 w-[47%] items-center rounded-xl2 border border-line bg-surface py-5"
            >
              <Ionicons name={link.icon} size={24} color={colors.teal} />
              <Text className="mt-2 text-sm font-semibold text-ink">{link.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
