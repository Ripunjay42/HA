import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import AnimatedFormHero from '../../components/AnimatedFormHero';
import Input from '../../components/Input';
import Chip from '../../components/Chip';
import Card from '../../components/Card';
import GradientButton from '../../components/GradientButton';
import api from '../../utils/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function PatientVitalsScreen({ navigation, route }) {
  const { mrNo } = route.params;
  const { colors } = useThemeColors();
  const [form, setForm] = useState({ weight: '', bp: '', temperature: '', height: '', pulse: '', bloodGroup: 'O+' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const { patient } = await api.patch(`/patients/mr/${mrNo}/vitals`, {
        weight: Number(form.weight),
        bp: form.bp,
        temperature: Number(form.temperature),
        height: Number(form.height),
        pulse: Number(form.pulse),
        bloodGroup: form.bloodGroup,
      });
      setResult(patient);
    } catch (err) {
      setError(err.message || 'Unable to save vitals');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <SafeAreaView className="flex-1 bg-surface-app">
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-status-success/10">
            <Ionicons name="checkmark-circle" size={56} color={colors.success} />
          </View>
          <Text className="text-center text-2xl font-bold text-ink">Vitals Recorded</Text>
          <Card className="mt-8 w-full items-center">
            <Text className="text-xs font-semibold uppercase tracking-wide text-ink-soft">UHID Generated</Text>
            <Text className="mt-2 text-2xl font-extrabold text-brand-teal">{result.uhid}</Text>
            <Text className="mt-3 text-xs text-ink-soft">Token No: {result.tokenNo}</Text>
          </Card>
          <GradientButton title="Done" onPress={() => navigation.popToTop()} style={{ width: '100%', marginTop: 32 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader title="Record Vitals" onBack={() => navigation.goBack()} />
      <KeyboardAwareScrollView
        className="px-6 pt-2"
        keyboardShouldPersistTaps="handled"
        bottomOffset={40}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <AnimatedFormHero
          icon="pulse"
          title="Recording Vitals"
          subtitle="Enter the patient's readings below to generate their UHID and token."
        />
        <Input label="Weight (kg)" value={form.weight} onChangeText={set('weight')} keyboardType="numeric" />
        <Input label="Blood Pressure" value={form.bp} onChangeText={set('bp')} placeholder="120/80" />
        <Input label="Temperature (°F)" value={form.temperature} onChangeText={set('temperature')} keyboardType="numeric" />
        <Input label="Height (cm)" value={form.height} onChangeText={set('height')} keyboardType="numeric" />
        <Input label="Pulse (bpm)" value={form.pulse} onChangeText={set('pulse')} keyboardType="numeric" />

        <Text className="mb-2 text-sm font-medium text-ink-soft">Blood Group</Text>
        <View className="mb-6 flex-row flex-wrap">
          {BLOOD_GROUPS.map((bg) => (
            <Chip key={bg} label={bg} selected={form.bloodGroup === bg} onPress={() => set('bloodGroup')(bg)} className="mb-3" />
          ))}
        </View>

        {error ? <Text className="mb-4 text-sm text-status-danger">{error}</Text> : null}

        <GradientButton title="Save Vitals & Generate UHID" onPress={handleSubmit} loading={loading} style={{ marginBottom: 32 }} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
