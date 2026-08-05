import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import AnimatedFormHero from '../../components/AnimatedFormHero';
import Card from '../../components/Card';
import GradientButton from '../../components/GradientButton';
import StatusBadge from '../../components/StatusBadge';
import api from '../../utils/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function ConsultationScreen({ navigation, route }) {
  const { appointmentId } = route.params;
  const { colors, appointmentStatusColor } = useThemeColors();
  const [appointment, setAppointment] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/appointments/${appointmentId}`).then((res) => setAppointment(res.appointment));
  }, [appointmentId]);

  const handleComplete = async () => {
    setError('');
    setSaving(true);
    try {
      const { appointment: updated } = await api.patch(`/appointments/${appointmentId}/consultation-notes`, {
        rawImageUrl: notes,
      });
      setAppointment(updated);
    } catch (err) {
      setError(err.message || 'Unable to save notes');
    } finally {
      setSaving(false);
    }
  };

  if (!appointment) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface-app">
        <ActivityIndicator color={colors.teal} />
      </SafeAreaView>
    );
  }

  const patient = appointment.patientId;
  const vitals = patient?.vitals || {};

  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader title="Consultation" onBack={() => navigation.goBack()} />
      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <AnimatedFormHero
          icon="medkit"
          title="Patient Consultation"
          subtitle="Review vitals and symptoms, then record your consultation notes."
        />
        <Card className="mb-4">
          <Text className="text-lg font-bold text-ink">{patient?.name}</Text>
          <Text className="text-xs text-ink-soft">
            {patient?.age} yrs • {patient?.gender} • UHID {patient?.uhid}
          </Text>
          <View className="mt-3 self-start">
            <StatusBadge status={appointment.status} color={appointmentStatusColor[appointment.status]} />
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="mb-2 text-sm font-bold text-ink">Vitals</Text>
          <Text className="text-xs text-ink-soft">Weight: {vitals.weight ?? '—'} kg</Text>
          <Text className="text-xs text-ink-soft">BP: {vitals.bp ?? '—'}</Text>
          <Text className="text-xs text-ink-soft">Temperature: {vitals.temperature ?? '—'} °F</Text>
          <Text className="text-xs text-ink-soft">Height: {vitals.height ?? '—'} cm</Text>
          <Text className="text-xs text-ink-soft">Pulse: {vitals.pulse ?? '—'} bpm</Text>
          <Text className="text-xs text-ink-soft">Blood Group: {vitals.bloodGroup ?? '—'}</Text>
        </Card>

        <Card className="mb-4">
          <Text className="mb-2 text-sm font-bold text-ink">Purpose & Symptoms</Text>
          <Text className="text-xs text-ink-soft">{appointment.purpose || '—'}</Text>
          <Text className="mt-1 text-xs text-ink-soft">
            {appointment.symptoms?.length ? appointment.symptoms.join(', ') : 'No symptoms recorded'}
          </Text>
        </Card>

        <Card className="mb-6">
          <Text className="mb-2 text-sm font-bold text-ink">Consultation Notes</Text>
          {appointment.consultationNotes?.recordedAt ? (
            <Text className="text-xs text-ink-soft">{appointment.consultationNotes.rawImageUrl}</Text>
          ) : (
            <>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Enter consultation notes"
                placeholderTextColor={colors.inkFaint}
                multiline
                className="h-28 rounded-2xl border border-line bg-surface p-3 text-sm text-ink"
                style={{ fontFamily: 'Ubuntu_400Regular' }}
                textAlignVertical="top"
              />
              {error ? <Text className="mt-2 text-sm text-status-danger">{error}</Text> : null}
              <GradientButton title="Complete Consultation" onPress={handleComplete} loading={saving} style={{ marginTop: 16 }} />
            </>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
