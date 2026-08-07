import { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Input from '../../components/Input';
import api from '../../utils/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function CompaniesAdminScreen({ navigation }) {
  const { colors } = useThemeColors();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.get('/companies').then((res) => setCompanies(res.companies)).finally(() => setLoading(false));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const q = query.trim().toLowerCase();
  const filtered = q
    ? companies.filter((c) => c.name?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q))
    : companies;

  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader
        title="Companies"
        onBack={() => navigation.goBack()}
        right={
          <Pressable
            onPress={() => navigation.navigate('AddCompany')}
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
      <Text className="mb-3 px-5 text-xs text-ink-soft">
        A patient whose employer matches a company here is automatically classified Non-Payment.
      </Text>
      <View className="px-5 pb-2">
        <Input placeholder="Search companies" value={query} onChangeText={setQuery} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        refreshing={loading}
        onRefresh={load}
        ListEmptyComponent={
          <Text className="mt-8 text-center text-sm text-ink-soft">
            {q ? 'No companies match your search.' : 'No companies yet. Tap + to add one.'}
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('AddCompany', { company: item })}>
            <Card className="mb-3 flex-row items-center">
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
                <Ionicons name="business-outline" size={22} color={colors.teal} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-ink">{item.name}</Text>
                {item.code ? <Text className="text-xs text-ink-soft">Code: {item.code}</Text> : null}
              </View>
              <Pressable
                onPress={() => navigation.navigate('AddCompany', { company: item })}
                hitSlop={8}
                className="ml-2 h-10 w-10 items-center justify-center rounded-full bg-brand-teal/10"
              >
                <Ionicons name="create-outline" size={20} color={colors.teal} />
              </Pressable>
            </Card>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
