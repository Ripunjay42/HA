import { useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import GradientButton from '../../components/GradientButton';
import { useAuth } from '../../hooks/AuthContext';
import api from '../../utils/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';

function DoctorDetailModal({ doctor, canBook, selecting, onClose, onBook, colors, isDark, isRecommended }) {
  if (!doctor) return null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }} onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            borderRadius: 24,
            backgroundColor: colors.surface,
            padding: 20,
            shadowColor: '#000000',
            shadowOpacity: isDark ? 0.4 : 0.2,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 10 },
            elevation: 10,
          }}
        >
          <View className="mb-4 flex-row items-start justify-between">
            <View className="flex-1 flex-row items-center">
              <View className="mr-3 h-14 w-14 items-center justify-center rounded-full bg-surface-muted">
                <Ionicons name="person" size={26} color={colors.ink} />
              </View>
              <View className="flex-1">
                {isRecommended ? (
                  <View className="mb-1 flex-row items-center self-start rounded-full bg-brand-teal/10 px-2 py-0.5">
                    <Ionicons name="sparkles" size={10} color={colors.teal} />
                    <Text className="ml-1 text-[10px] font-bold text-brand-teal">AI RECOMMENDED</Text>
                  </View>
                ) : null}
                <Text style={{ fontSize: 18, fontWeight: '800', color: colors.ink }}>{doctor.name}</Text>
                <Text style={{ fontSize: 12, color: colors.inkSoft }}>
                  {doctor.specialization || 'General'} • {doctor.departmentId?.name || 'General'}
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close-circle" size={26} color={colors.inkFaint} />
            </Pressable>
          </View>

          {doctor.qualifications ? (
            <Text className="mb-2 text-xs text-ink-soft">{doctor.qualifications}</Text>
          ) : null}
          {doctor.experienceYears ? (
            <Text className="mb-2 text-xs text-ink-soft">{doctor.experienceYears} years experience</Text>
          ) : null}
          <Text className="mb-4 text-sm font-semibold text-brand-teal">
            ₹{doctor.consultationFee} consultation fee
          </Text>

          {onBook ? (
            canBook ? (
              <GradientButton
                title="Book Appointment"
                onPress={() => onBook(doctor)}
                loading={selecting}
                style={{ height: 48 }}
              />
            ) : (
              <View className="flex-row items-center rounded-2xl bg-status-warning/10 px-3 py-3">
                <Ionicons name="alert-circle-outline" size={16} color={colors.warning} />
                <Text className="ml-2 flex-1 text-xs text-ink-soft">
                  You need an active token to book. Please visit the reception.
                </Text>
              </View>
            )
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Shows the AI-ranked list of relevant doctors from Symptom Check, which can
// span multiple departments (e.g. joint pain surfacing both Orthopedics and
// General Medicine) instead of funneling into a single department guess.
export default function MatchedDoctorsScreen({ navigation, route }) {
  const { appointmentId, doctors: initialDoctors, recommendedDoctorId } = route.params;
  const { user } = useAuth();
  const { colors, isDark } = useThemeColors();

  const [doctors] = useState(initialDoctors || []);
  const [selectingId, setSelectingId] = useState(null);
  const [error, setError] = useState('');
  const [viewingDoctor, setViewingDoctor] = useState(null);

  const isBooking = !!appointmentId;
  const canBook = user?.status === 'token_generated';

  const handleSelect = async (doctor) => {
    setError('');
    setSelectingId(doctor._id);
    try {
      await api.patch(`/appointments/${appointmentId}/doctor`, { doctorId: doctor._id });
      setViewingDoctor(null);
      navigation.navigate('BookSlot', { appointmentId, doctor });
    } catch (err) {
      setError(err.message || 'Unable to select doctor');
    } finally {
      setSelectingId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader title="Matched Doctors" onBack={() => navigation.goBack()} />
      <View className="mx-5 mb-3 flex-row items-center rounded-2xl bg-status-success/10 px-4 py-3">
        <Ionicons name="sparkles" size={16} color={colors.success} />
        <Text className="ml-2 flex-1 text-xs text-ink-soft">
          Ranked by our AI based on your symptoms, across all relevant departments.
        </Text>
      </View>
      {isBooking && !canBook && (
        <View className="mx-5 mb-3 flex-row items-center rounded-2xl bg-status-warning/10 px-4 py-3">
          <Ionicons name="information-circle-outline" size={16} color={colors.warning} />
          <Text className="ml-2 flex-1 text-xs text-ink-soft">
            You need an active token to book. Tap a doctor to view details.
          </Text>
        </View>
      )}
      {error ? <Text className="mx-5 mb-2 text-sm text-status-danger">{error}</Text> : null}
      <FlatList
        data={doctors}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        ListEmptyComponent={
          <Text className="mt-8 text-center text-sm text-ink-soft">No matching doctors found. Try browsing departments instead.</Text>
        }
        renderItem={({ item }) => {
          const isRecommended = item._id === recommendedDoctorId;
          return (
            <Pressable onPress={() => setViewingDoctor(item)}>
              <Card
                className="mb-3 flex-row items-center"
                style={isRecommended ? { borderColor: colors.teal, borderWidth: 1.5 } : undefined}
              >
                <View className="mr-4 h-14 w-14 items-center justify-center rounded-full bg-surface-muted">
                  <Ionicons name="person" size={26} color={colors.ink} />
                </View>
                <View className="flex-1">
                  {isRecommended ? (
                    <View className="mb-1 flex-row items-center self-start rounded-full bg-brand-teal/10 px-2 py-0.5">
                      <Ionicons name="sparkles" size={10} color={colors.teal} />
                      <Text className="ml-1 text-[10px] font-bold text-brand-teal">AI RECOMMENDED</Text>
                    </View>
                  ) : null}
                  <Text className="text-base font-bold text-ink">{item.name}</Text>
                  <Text className="text-xs text-ink-soft">
                    {item.specialization || 'General'} • {item.departmentId?.name || 'General'}
                  </Text>
                  <Text className="mt-1 text-xs font-semibold text-brand-teal">₹{item.consultationFee} consultation</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
              </Card>
            </Pressable>
          );
        }}
      />

      <DoctorDetailModal
        doctor={viewingDoctor}
        canBook={canBook}
        selecting={selectingId === viewingDoctor?._id}
        onClose={() => setViewingDoctor(null)}
        onBook={isBooking ? handleSelect : null}
        colors={colors}
        isDark={isDark}
        isRecommended={viewingDoctor?._id === recommendedDoctorId}
      />
    </SafeAreaView>
  );
}
