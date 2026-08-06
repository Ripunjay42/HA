import { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import api from '../../utils/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function CompaniesAdminScreen({ navigation }) {
  const { colors } = useThemeColors();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/companies').then((res) => setCompanies(res.companies)).finally(() => setLoading(false));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

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
      <FlatList
        data={companies}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        refreshing={loading}
        onRefresh={load}
        ListEmptyComponent={
          <Text className="mt-8 text-center text-sm text-ink-soft">No companies yet. Tap + to add one.</Text>
        }
        renderItem={({ item }) => (
          <Card className="mb-3 flex-row items-center">
            <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
              <Ionicons name="business-outline" size={22} color={colors.teal} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-ink">{item.name}</Text>
              {item.code ? <Text className="text-xs text-ink-soft">Code: {item.code}</Text> : null}
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}
