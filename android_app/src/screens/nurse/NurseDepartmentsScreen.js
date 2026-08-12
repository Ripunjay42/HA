import { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import api from '../../utils/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function NurseDepartmentsScreen({ navigation, route }) {
  const { colors } = useThemeColors();
  const { mrNo, appointmentId } = route.params;
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/departments').then((res) => setDepartments(res.departments)).finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader title="All Departments" onBack={() => navigation.goBack()} />
      <FlatList
        data={departments}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        refreshing={loading}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate('NurseDoctorList', { mrNo, departmentId: item._id, departmentName: item.name, appointmentId })
            }
          >
            <Card className="mb-3 flex-row items-center">
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
                <Ionicons name="body-outline" size={22} color={colors.teal} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-ink">{item.name}</Text>
                {item.description ? (
                  <Text className="text-xs text-ink-soft" numberOfLines={1}>{item.description}</Text>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
            </Card>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
