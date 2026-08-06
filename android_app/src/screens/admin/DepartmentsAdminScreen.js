import { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import api from '../../utils/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function DepartmentsAdminScreen({ navigation }) {
  const { colors } = useThemeColors();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/departments').then((res) => setDepartments(res.departments)).finally(() => setLoading(false));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader
        title="Departments"
        onBack={() => navigation.goBack()}
        right={
          <Pressable
            onPress={() => navigation.navigate('AddDepartment')}
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
      <FlatList
        data={departments}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24 }}
        refreshing={loading}
        onRefresh={load}
        ListEmptyComponent={
          <Text className="mt-8 text-center text-sm text-ink-soft">No departments yet. Tap + to add one.</Text>
        }
        renderItem={({ item }) => (
          <Card className="mb-3 flex-row items-center">
            <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
              <Ionicons name="body-outline" size={22} color={colors.teal} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-ink">{item.name}</Text>
              {item.description ? (
                <Text className="text-xs text-ink-soft" numberOfLines={1}>{item.description}</Text>
              ) : null}
              {item.symptomKeywords?.length ? (
                <Text className="mt-1 text-xs text-ink-soft" numberOfLines={1}>
                  Keywords: {item.symptomKeywords.join(', ')}
                </Text>
              ) : null}
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}
