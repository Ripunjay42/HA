import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import AnimatedFormHero from '../../components/AnimatedFormHero';
import Input from '../../components/Input';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import GradientButton from '../../components/GradientButton';
import api from '../../utils/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';
import { filterDigits, filterDecimal, filterBloodPressure } from '../../utils/validation';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const VITALS_FIELDS = [
  { key: 'weight', label: 'Weight (kg)' },
  { key: 'bp', label: 'Blood Pressure' },
  { key: 'temperature', label: 'Temperature (°F)' },
  { key: 'height', label: 'Height (cm)' },
  { key: 'pulse', label: 'Pulse (bpm)' },
  { key: 'bloodGroup', label: 'Blood Group' },
];

export default function PatientVitalsScreen({ navigation, route }) {
  const { mrNo } = route.params;
  const { colors } = useThemeColors();
  const [form, setForm] = useState({ weight: '', bp: '', temperature: '', height: '', pulse: '', bloodGroup: 'O+' });
  const [fetching, setFetching] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get(`/patients/mr/${mrNo}`).then((res) => {
      const { vitals, status } = res.patient;
      // nurse_assigned means re-assigned after token expiry — must go through
      // recordVitals (not updateVitals) to regenerate the token.
      const isReassigned = status === 'nurse_assigned';
      if (vitals?.recordedAt && !isReassigned) {
        setIsEditMode(true);
        setForm({
          weight: vitals.weight != null ? String(vitals.weight) : '',
          bp: vitals.bp || '',
          temperature: vitals.temperature != null ? String(vitals.temperature) : '',
          height: vitals.height != null ? String(vitals.height) : '',
          pulse: vitals.pulse != null ? String(vitals.pulse) : '',
          bloodGroup: vitals.bloodGroup || 'O+',
        });
      } else if (vitals?.recordedAt && isReassigned) {
        // Pre-fill from previous visit for convenience but treat as fresh recording
        setForm({
          weight: vitals.weight != null ? String(vitals.weight) : '',
          bp: vitals.bp || '',
          temperature: vitals.temperature != null ? String(vitals.temperature) : '',
          height: vitals.height != null ? String(vitals.height) : '',
          pulse: vitals.pulse != null ? String(vitals.pulse) : '',
          bloodGroup: vitals.bloodGroup || 'O+',
        });
      }
    }).finally(() => setFetching(false));
  }, [mrNo]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const handleReview = () => {
    setError('');
    setReviewing(true);
  };

  const handleConfirm = async () => {
    setError('');
    setLoading(true);
    try {
      const payload = {
        weight: Number(form.weight),
        bp: form.bp,
        temperature: Number(form.temperature),
        height: Number(form.height),
        pulse: Number(form.pulse),
        bloodGroup: form.bloodGroup,
      };
      const { patient } = isEditMode
        ? await api.patch(`/patients/mr/${mrNo}/vitals/edit`, payload)
        : await api.patch(`/patients/mr/${mrNo}/vitals`, payload);
      setResult(patient);
    } catch (err) {
      setError(err.message || 'Unable to save vitals');
      setReviewing(false);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface-app">
        <ActivityIndicator color={colors.teal} />
      </SafeAreaView>
    );
  }

  if (result) {
    return (
      <SafeAreaView className="flex-1 bg-surface-app">
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-status-success/10">
            <Ionicons name="checkmark-circle" size={56} color={colors.success} />
          </View>
          <Text className="text-center text-2xl font-bold text-ink">
            {isEditMode ? 'Vitals Updated' : 'Vitals Recorded'}
          </Text>
          <Card className="mt-8 w-full items-center">
            <Text className="text-xs font-semibold uppercase tracking-wide text-ink-soft">UHID</Text>
            <Text className="mt-2 text-2xl font-extrabold text-brand-teal">{result.uhid}</Text>
            <Text className="mt-3 text-xs text-ink-soft">
              {isEditMode ? `Token No: ${result.tokenNo}` : `New Token No: ${result.tokenNo}`}
            </Text>
          </Card>
          <GradientButton title="Done" onPress={() => navigation.popToTop()} style={{ width: '100%', marginTop: 32 }} />
        </View>
      </SafeAreaView>
    );
  }

  if (reviewing) {
    return (
      <SafeAreaView className="flex-1 bg-surface-app">
        <ScreenHeader title="Review Vitals" onBack={() => setReviewing(false)} />
        <View className="flex-1 px-6 pt-2">
          <Text className="mb-4 text-sm text-ink-soft">
            {isEditMode
              ? 'Confirm the corrected readings below. The existing token will not change.'
              : 'Confirm the readings below before generating the token.'}
          </Text>
          <Card>
            {VITALS_FIELDS.map(({ key, label }) => (
              <View key={key} className="mb-3 flex-row items-center justify-between">
                <Text className="text-xs text-ink-soft">{label}</Text>
                <Text className="text-sm font-semibold text-ink">{form[key] || '—'}</Text>
              </View>
            ))}
          </Card>

          {error ? <Text className="mb-4 mt-4 text-sm text-status-danger">{error}</Text> : null}

          <GradientButton
            title={isEditMode ? 'Confirm & Update' : 'Confirm & Generate Token'}
            onPress={handleConfirm}
            loading={loading}
            style={{ marginTop: 24 }}
          />
          <GradientButton
            title="Back to Edit"
            variant="outline"
            onPress={() => setReviewing(false)}
            style={{ marginTop: 12 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader title={isEditMode ? 'Edit Vitals' : 'Record Vitals'} onBack={() => navigation.goBack()} />
      <KeyboardAwareScrollView
        className="px-6 pt-2"
        keyboardShouldPersistTaps="handled"
        bottomOffset={40}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <AnimatedFormHero
          icon="pulse"
          title={isEditMode ? 'Editing Vitals' : 'Recording Vitals'}
          subtitle={
            isEditMode
              ? 'Update the patient\'s readings below. Their existing token stays valid.'
              : 'Enter the patient\'s readings below to generate their UHID and token.'
          }
        />
        <Input
          label="Weight (kg)"
          value={form.weight}
          onChangeText={(v) => set('weight')(filterDecimal(v))}
          keyboardType="numeric"
        />
        <Input
          label="Blood Pressure"
          value={form.bp}
          onChangeText={(v) => set('bp')(filterBloodPressure(v))}
          placeholder="120/80"
        />
        <Input
          label="Temperature (°F)"
          value={form.temperature}
          onChangeText={(v) => set('temperature')(filterDecimal(v))}
          keyboardType="numeric"
        />
        <Input
          label="Height (cm)"
          value={form.height}
          onChangeText={(v) => set('height')(filterDecimal(v))}
          keyboardType="numeric"
        />
        <Input
          label="Pulse (bpm)"
          value={form.pulse}
          onChangeText={(v) => set('pulse')(filterDigits(v))}
          keyboardType="numeric"
        />

        <Text className="mb-2 text-sm font-medium text-ink-soft">Blood Group</Text>
        <View className="mb-6 flex-row flex-wrap">
          {BLOOD_GROUPS.map((bg) => (
            <Chip key={bg} label={bg} selected={form.bloodGroup === bg} onPress={() => set('bloodGroup')(bg)} className="mb-3" />
          ))}
        </View>

        {error ? <Text className="mb-4 text-sm text-status-danger">{error}</Text> : null}

        <GradientButton title="Review" onPress={handleReview} style={{ marginBottom: 32 }} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
