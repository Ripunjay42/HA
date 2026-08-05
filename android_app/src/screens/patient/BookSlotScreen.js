import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import GradientButton from '../../components/GradientButton';
import api from '../../utils/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';
import { formatShortDate, nextDateForDay } from '../../utils/dateHelpers';

export default function BookSlotScreen({ navigation, route }) {
  const { appointmentId, doctor } = route.params;
  const { colors } = useThemeColors();

  const daysWithSlots = (doctor.availability || [])
    .map((entry) => ({ ...entry, date: nextDateForDay(entry.day), openSlots: entry.slots.filter((s) => !s.isBooked) }))
    .filter((entry) => entry.openSlots.length > 0)
    .sort((a, b) => a.date - b.date);

  const [selectedDay, setSelectedDay] = useState(daysWithSlots[0]?.day || null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activeDay = daysWithSlots.find((d) => d.day === selectedDay);

  const handleContinue = async () => {
    if (!activeDay || !selectedSlot) return;
    setError('');
    setLoading(true);
    try {
      const { appointment } = await api.patch(`/appointments/${appointmentId}/slot`, {
        day: activeDay.day,
        date: activeDay.date.toISOString(),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      });

      if (appointment.status === 'confirmed') {
        navigation.replace('Confirmation', { appointmentId });
      } else {
        navigation.navigate('Payment', { appointmentId, amount: doctor.consultationFee });
      }
    } catch (err) {
      setError(err.message || 'Unable to book this slot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader title="Book Appointment" onBack={() => navigation.goBack()} />
      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <Card className="mb-5 flex-row items-center">
          <View className="mr-4 h-14 w-14 items-center justify-center rounded-full bg-surface-muted">
            <Ionicons name="person" size={26} color={colors.navy} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-ink">{doctor.name}</Text>
            <Text className="text-xs text-ink-soft">{doctor.specialization || 'General'}</Text>
          </View>
        </Card>

        <Text className="mb-3 text-base font-bold text-ink">Select Date</Text>
        {daysWithSlots.length === 0 ? (
          <Text className="text-sm text-ink-soft">This doctor has no open slots right now.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
            {daysWithSlots.map((entry) => (
              <Chip
                key={entry.day}
                label={`${entry.day} ${formatShortDate(entry.date)}`}
                selected={selectedDay === entry.day}
                onPress={() => {
                  setSelectedDay(entry.day);
                  setSelectedSlot(null);
                }}
              />
            ))}
          </ScrollView>
        )}

        {activeDay && (
          <>
            <Text className="mb-3 text-base font-bold text-ink">Select Time</Text>
            <View className="mb-6 flex-row flex-wrap">
              {activeDay.openSlots.map((slot) => (
                <Chip
                  key={`${slot.startTime}-${slot.endTime}`}
                  label={slot.startTime}
                  selected={selectedSlot?.startTime === slot.startTime}
                  onPress={() => setSelectedSlot(slot)}
                  className="mb-3"
                />
              ))}
            </View>
          </>
        )}

        {error ? <Text className="mb-4 text-sm text-status-danger">{error}</Text> : null}
      </ScrollView>

      <View className="border-t border-line bg-surface px-5 pb-6 pt-4">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-sm text-ink-soft">Consultation Fee</Text>
          <Text className="text-lg font-extrabold text-ink">₹{doctor.consultationFee}.00</Text>
        </View>
        <GradientButton
          title="Continue"
          onPress={handleContinue}
          loading={loading}
          disabled={!selectedSlot}
        />
      </View>
    </SafeAreaView>
  );
}
