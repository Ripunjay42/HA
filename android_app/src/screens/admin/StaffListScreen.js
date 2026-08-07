import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import Input from '../../components/Input';
import StaffDetailModal from '../../components/StaffDetailModal';
import api from '../../utils/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';

const ROLES = ['doctor', 'nurse', 'receptionist'];

const ROLE_ICON = { doctor: 'medkit', nurse: 'heart', receptionist: 'people' };
const ROLE_LABEL = { doctor: 'Doctor', nurse: 'Nurse', receptionist: 'Receptionist' };

const subtitleFor = (role, item) => {
  if (role === 'doctor') return item.specialization || 'General';
  if (role === 'nurse') return item.ward ? `${item.ward} Ward` : 'Nurse';
  return 'Receptionist';
};

export default function StaffListScreen({ navigation, route }) {
  const { colors } = useThemeColors();
  const [role, setRole] = useState(route?.params?.role || 'doctor');
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/admin/staff?role=${role}`).then((res) => setStaff(res.staff)).finally(() => setLoading(false));
  }, [role]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const q = query.trim().toLowerCase();
  const filtered = q
    ? staff.filter(
        (item) =>
          item.name?.toLowerCase().includes(q) ||
          item.staffId?.toLowerCase().includes(q) ||
          item.email?.toLowerCase().includes(q) ||
          item.phone?.includes(q),
      )
    : staff;

  const toggleStatus = async (member) => {
    const nextStatus = member.status === 'active' ? 'inactive' : 'active';
    await api.patch(`/admin/staff/${role}/${member._id}/status`, { status: nextStatus });
    load();
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader
        title={`${ROLE_LABEL[role]}s`}
        onBack={() => navigation.goBack()}
        right={
          <Pressable
            onPress={() => navigation.navigate('AddStaff', { defaultRole: role })}
            style={{
              height: 40, width: 40, borderRadius: 20,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: colors.teal,
            }}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </Pressable>
        }
      />
      <View className="flex-row px-5">
        {ROLES.map((r) => (
          <Chip key={r} label={r[0].toUpperCase() + r.slice(1)} selected={role === r} onPress={() => setRole(r)} />
        ))}
      </View>
      <View className="px-5 pb-2 pt-3">
        <Input
          placeholder="Search by name, staff ID, email, or phone"
          value={query}
          onChangeText={setQuery}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={
          <Text className="mt-8 text-center text-sm text-ink-soft">
            {q ? 'No staff match your search.' : `No ${role}s yet. Tap + to add one.`}
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => setSelected(item)}>
            <Card className="mb-3 flex-row items-center">
              <View className="mr-4 h-14 w-14 items-center justify-center rounded-full bg-surface-muted">
                <Ionicons name={ROLE_ICON[role]} size={28} color={colors.ink} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-ink">{item.name}</Text>
                <Text className="text-xs text-ink-soft">{subtitleFor(role, item)}</Text>
                {item.staffId ? (
                  <Text className="mt-0.5 text-[11px] font-semibold text-brand-teal">{item.staffId}</Text>
                ) : null}
              </View>
              <Pressable
                onPress={() => toggleStatus(item)}
                className={`mr-2 rounded-full px-3 py-1 ${item.status === 'active' ? 'bg-status-success/10' : 'bg-status-danger/10'}`}
              >
                <Text
                  className={`text-xs font-semibold ${item.status === 'active' ? 'text-status-success' : 'text-status-danger'}`}
                >
                  {item.status}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate('AddStaff', { staff: { ...item, role } })}
                hitSlop={8}
                className="h-10 w-10 items-center justify-center rounded-full bg-brand-teal/10"
              >
                <Ionicons name="create-outline" size={18} color={colors.teal} />
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
