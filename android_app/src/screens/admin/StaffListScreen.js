import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import api from '../../utils/apiClient';

const ROLES = ['doctor', 'nurse', 'receptionist'];

export default function StaffListScreen({ navigation }) {
  const [role, setRole] = useState('doctor');
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <View className="mb-2 flex-row px-5">
        {ROLES.map((r) => (
          <Chip key={r} label={r[0].toUpperCase() + r.slice(1)} selected={role === r} onPress={() => setRole(r)} />
        ))}
      </View>
      <FlatList
        data={staff}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={<Text className="mt-8 text-center text-sm text-ink-soft">No {role}s yet.</Text>}
        renderItem={({ item }) => (
          <Card className="mb-3 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-sm font-bold text-ink">{item.name}</Text>
              <Text className="text-xs text-ink-soft">
                {item.email}
                {item.staffId ? ` • ${item.staffId}` : ''}
              </Text>
            </View>
            <Pressable
              onPress={() => toggleStatus(item)}
              className={`rounded-full px-3 py-1.5 ${item.status === 'active' ? 'bg-status-success/10' : 'bg-status-danger/10'}`}
            >
              <Text
                className={`text-xs font-semibold ${item.status === 'active' ? 'text-status-success' : 'text-status-danger'}`}
              >
                {item.status}
              </Text>
            </Pressable>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}
