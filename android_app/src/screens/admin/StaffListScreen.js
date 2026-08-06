import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import StaffDetailModal from '../../components/StaffDetailModal';
import api from '../../utils/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';

const ROLES = ['doctor', 'nurse', 'receptionist'];

const ROLE_ICON = { doctor: 'medkit', nurse: 'heart', receptionist: 'people' };

const subtitleFor = (role, item) => {
  if (role === 'doctor') return item.specialization || 'General';
  if (role === 'nurse') return item.ward ? `${item.ward} Ward` : 'Nurse';
  return item.staffId || 'Receptionist';
};

export default function StaffListScreen({ navigation }) {
  const { colors } = useThemeColors();
  const [role, setRole] = useState('doctor');
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/admin/staff?role=${role}`).then((res) => setStaff(res.staff)).finally(() => setLoading(false));
  }, [role]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggleStatus = async (member) => {
    const nextStatus = member.status === 'active' ? 'inactive' : 'active';
    await api.patch(`/admin/staff/${role}/${member._id}/status`, { status: nextStatus });
    load();
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader title="Staff" onBack={() => navigation.goBack()} />
      <View className="flex-row px-5">
        {ROLES.map((r) => (
          <Chip key={r} label={r[0].toUpperCase() + r.slice(1)} selected={role === r} onPress={() => setRole(r)} />
        ))}
      </View>
      <FlatList
        data={staff}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={<Text className="mt-8 text-center text-sm text-ink-soft">No {role}s yet.</Text>}
        renderItem={({ item }) => (
          <Pressable onPress={() => setSelected(item)}>
            <Card className="mb-3 flex-row items-center">
              <View className="mr-4 h-14 w-14 items-center justify-center rounded-full bg-surface-muted">
                <Ionicons name={ROLE_ICON[role]} size={24} color={colors.ink} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-ink">{item.name}</Text>
                <Text className="text-xs text-ink-soft">{subtitleFor(role, item)}</Text>
                <Pressable
                  onPress={() => toggleStatus(item)}
                  className={`mt-2 self-start rounded-full px-3 py-1 ${item.status === 'active' ? 'bg-status-success/10' : 'bg-status-danger/10'}`}
                >
                  <Text
                    className={`text-xs font-semibold ${item.status === 'active' ? 'text-status-success' : 'text-status-danger'}`}
                  >
                    {item.status}
                  </Text>
                </Pressable>
              </View>
              <Pressable
                onPress={() => navigation.navigate('AddStaff', { staff: { ...item, role } })}
                hitSlop={8}
                className="ml-2 h-10 w-10 items-center justify-center rounded-full bg-brand-teal/10"
              >
                <Ionicons name="create-outline" size={20} color={colors.teal} />
              </Pressable>
            </Card>
          </Pressable>
        )}
      />

      <StaffDetailModal
        visible={!!selected}
        staff={selected}
        role={role}
        onClose={() => setSelected(null)}
        onEdit={() => {
          const staff = selected;
          setSelected(null);
          navigation.navigate('AddStaff', { staff: { ...staff, role } });
        }}
      />
    </SafeAreaView>
  );
}
