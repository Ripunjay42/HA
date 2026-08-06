import { useCallback, useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import StatusBadge from '../../components/StatusBadge';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuth } from '../../hooks/AuthContext';
import api from '../../utils/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function NurseHomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { colors, patientStatusColor } = useThemeColors();
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.get('/patients')
      .then((res) => setPatients(res.patients))
      .catch((err) => setError(err.message || 'Unable to load patients'))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) => p.name.toLowerCase().includes(q) || p.mrNo.toLowerCase().includes(q) || p.phone.includes(q),
    );
  }, [query, patients]);

  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 pt-2">
        <View>
          <Text className="text-xs text-ink-soft">Nurse</Text>
          <Text className="text-xl font-extrabold text-ink">{user?.name}</Text>
        </View>
        <View className="flex-row items-center" style={{ gap: 12 }}>
          <ThemeToggle />
          <Text className="text-xs font-semibold text-brand-teal" onPress={logout}>
            Log Out
          </Text>
        </View>
      </View>

      <View className="px-5 pt-5">
        <Input
          placeholder="Search your patients by name, MR No, or phone"
          value={query}
          onChangeText={setQuery}
        />
        <Text className="-mt-2 mb-2 text-xs text-ink-soft">
          {filtered.length} patient{filtered.length === 1 ? '' : 's'} assigned to you
        </Text>
        {error ? <Text className="mb-2 text-sm text-status-danger">{error}</Text> : null}
      </View>

      <FlatList
        className="flex-1 px-5"
        data={filtered}
        keyExtractor={(item) => item._id}
        refreshing={loading}
        onRefresh={load}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          !loading ? (
            <View className="mt-10 items-center">
              <Ionicons name="people-outline" size={32} color={colors.inkFaint} />
              <Text className="mt-2 text-sm text-ink-soft">
                {patients.length === 0 ? 'No patients assigned to you yet.' : 'No matches found.'}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Card className="mb-3">
            <Text className="text-lg font-bold text-ink">{item.name}</Text>
            <Text className="text-xs text-ink-soft">
              {item.age} yrs • {item.gender} • {item.phone}
            </Text>
            <Text className="mt-1 text-xs text-ink-soft">MR No: {item.mrNo}</Text>
            <View className="mt-3 self-start">
              <StatusBadge status={item.status} color={patientStatusColor[item.status]} />
            </View>

            {item.vitals?.recordedAt ? (
              <View className="mt-4 rounded-2xl bg-surface-muted p-3">
                <Text className="text-xs font-semibold text-ink-soft">Vitals already recorded</Text>
                <Text className="mt-1 text-xs text-ink-soft">
                  BP {item.vitals.bp} • Temp {item.vitals.temperature} • Pulse {item.vitals.pulse}
                </Text>
              </View>
            ) : (
              <GradientButton
                title="Record Vitals"
                onPress={() => navigation.navigate('PatientVitals', { mrNo: item.mrNo })}
                style={{ marginTop: 16, height: 44 }}
              />
            )}
          </Card>
        )}
      />
    </SafeAreaView>
  );
}
