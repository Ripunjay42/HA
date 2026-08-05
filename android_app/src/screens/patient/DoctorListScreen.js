import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import { useAuth } from '../../hooks/AuthContext';
import api from '../../utils/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function DoctorListScreen({ navigation, route }) {
  const { departmentId, departmentName, appointmentId, matched } = route.params;
  const { user } = useAuth();
  const { colors } = useThemeColors();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectingId, setSelectingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/doctors?departmentId=${departmentId}`).then((res) => setDoctors(res.doctors)).finally(() => setLoading(false));
  }, [departmentId]);

  const handleSelect = async (doctor) => {
    setError('');
    setSelectingId(doctor._id);
    try {
      let apptId = appointmentId;
      if (!apptId) {
        const { appointment } = await api.post('/appointments', {
          uhid: user.uhid,
          purpose: 'General Consultation',
          symptoms: [],
        });
        apptId = appointment._id;
      }
      await api.patch(`/appointments/${apptId}/doctor`, { doctorId: doctor._id });
      navigation.navigate('BookSlot', { appointmentId: apptId, doctor });
    } catch (err) {
      setError(err.message || 'Unable to select doctor');
    } finally {
      setSelectingId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader title={departmentName} onBack={() => navigation.goBack()} />
      {matched && (
        <View className="mx-5 mb-3 flex-row items-center rounded-2xl bg-status-success/10 px-4 py-3">
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text className="ml-2 text-xs text-ink-soft">Matched to your symptoms</Text>
        </View>
      )}
      {error ? <Text className="mx-5 mb-2 text-sm text-status-danger">{error}</Text> : null}
      {loading ? (
        <ActivityIndicator className="mt-8" color={colors.teal} />
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          ListEmptyComponent={
            <Text className="mt-8 text-center text-sm text-ink-soft">No doctors available in this department yet.</Text>
          }
          renderItem={({ item }) => (
            <Card className="mb-3 flex-row items-center">
              <View className="mr-4 h-14 w-14 items-center justify-center rounded-full bg-surface-muted">
                <Ionicons name="person" size={26} color={colors.navy} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-ink">{item.name}</Text>
                <Text className="text-xs text-ink-soft">{item.specialization || 'General'}</Text>
                <Text className="mt-1 text-xs font-semibold text-brand-teal">₹{item.consultationFee} consultation</Text>
              </View>
              <Pressable
                onPress={() => handleSelect(item)}
                disabled={selectingId === item._id}
                className="rounded-full bg-brand-teal px-4 py-2"
              >
                {selectingId === item._id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-xs font-semibold text-white">Select</Text>
                )}
              </Pressable>
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
}
