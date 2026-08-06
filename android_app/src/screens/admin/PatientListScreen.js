import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Input from '../../components/Input';
import api from '../../utils/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function PatientListScreen({ navigation }) {
  const { colors, patientStatusColor } = useThemeColors();
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/patients').then((res) => setPatients(res.patients)).finally(() => setLoading(false));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const q = query.trim().toLowerCase();
  const filtered = q
    ? patients.filter(
        (p) => p.name.toLowerCase().includes(q) || p.mrNo.toLowerCase().includes(q) || p.phone.includes(q),
      )
    : patients;

  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader title="Patients" onBack={() => navigation.goBack()} />
      <View className="px-5 pb-2">
        <Input
          placeholder="Search by name, MR No, or phone"
          value={query}
          onChangeText={setQuery}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={
          !loading ? (
            <Text className="mt-8 text-center text-sm text-ink-soft">No patients found.</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('PatientDetail', { mrNo: item.mrNo })}>
            <Card className="mb-3 flex-row items-center">
              <View className="mr-4 h-14 w-14 items-center justify-center rounded-full bg-surface-muted">
                <Ionicons name="person" size={24} color={colors.ink} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-ink">{item.name}</Text>
                <Text className="text-xs text-ink-soft">{item.mrNo} • {item.phone}</Text>
                <View
                  className="mt-2 self-start rounded-full px-3 py-1"
                  style={{ backgroundColor: `${patientStatusColor[item.status]}1A` }}
                >
                  <Text className="text-xs font-semibold" style={{ color: patientStatusColor[item.status] }}>
                    {item.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
            </Card>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
