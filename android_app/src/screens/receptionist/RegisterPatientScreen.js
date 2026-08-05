import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import AnimatedFormHero from '../../components/AnimatedFormHero';
import Input from '../../components/Input';
import PickerInput from '../../components/PickerInput';
import Chip from '../../components/Chip';
import Card from '../../components/Card';
import GradientButton from '../../components/GradientButton';
import api from '../../utils/apiClient';
import { staffOptions } from '../../utils/pickerOptions';
import { useThemeColors } from '../../hooks/useThemeColors';

const GENDERS = ['male', 'female', 'other'];

export default function RegisterPatientScreen({ navigation }) {
  const { colors } = useThemeColors();
  const [form, setForm] = useState({
    name: '', age: '', gender: 'male', phone: '', address: '', guardianName: '', employerName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(null);

  const [staffId, setStaffId] = useState('');
  const [nurses, setNurses] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assigned, setAssigned] = useState(false);

  useEffect(() => {
    api.get('/admin/staff?role=nurse&status=active').then((res) => setNurses(res.staff)).catch(() => {});
  }, []);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const handleRegister = async () => {
    setError('');
    if (!form.name || !form.age || !form.phone) {
      setError('Name, age, and phone are required');
      return;
    }
    setLoading(true);
    try {
      const { patient } = await api.post('/patients/register-by-receptionist', { ...form, age: Number(form.age) });
      setRegistered(patient);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    setAssignError('');
    setAssigning(true);
    try {
      await api.patch(`/patients/mr/${registered.mrNo}/assign-nurse`, { staffId });
      setAssigned(true);
    } catch (err) {
      setAssignError(err.message || 'Unable to assign nurse');
    } finally {
      setAssigning(false);
    }
  };

  if (registered) {
    return (
      <SafeAreaView className="flex-1 bg-surface-app">
        <ScreenHeader title="Patient Registered" onBack={() => navigation.goBack()} />
        <View className="flex-1 px-6 pt-4">
          <Card className="mb-6 items-center">
            <Ionicons name="checkmark-circle" size={40} color={colors.success} />
            <Text className="mt-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">MR No</Text>
            <Text className="mt-1 text-2xl font-extrabold text-brand-navy">{registered.mrNo}</Text>
            <Text className="mt-1 text-xs text-ink-soft">
              {registered.paymentCategory === 'non_payment' ? 'Company Covered' : 'Self-Pay'}
            </Text>
          </Card>

          {assigned ? (
            <View className="flex-row items-center rounded-2xl bg-status-success/10 p-4">
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text className="ml-2 text-sm text-ink">Nurse assigned successfully.</Text>
            </View>
          ) : (
            <>
              <PickerInput
                label="Assign a Nurse (Staff ID)"
                value={staffId}
                onChangeText={setStaffId}
                placeholder="e.g. NR00001"
                options={staffOptions(nurses)}
                onSelect={(option) => setStaffId(option.id)}
              />
              {assignError ? <Text className="mb-2 text-sm text-status-danger">{assignError}</Text> : null}
              <GradientButton title="Assign Nurse" onPress={handleAssign} loading={assigning} />
            </>
          )}

          <GradientButton
            title="Done"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 16 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader title="Register Patient" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView className="px-6 pt-2" keyboardShouldPersistTaps="handled">
          <AnimatedFormHero
            icon="person-add"
            title="New Patient Registration"
            subtitle="Enter the walk-in patient's details to generate their MR No."
          />
          <Input label="Full Name" value={form.name} onChangeText={set('name')} placeholder="Jane Doe" />
          <Input label="Age" value={form.age} onChangeText={set('age')} keyboardType="number-pad" placeholder="30" />

          <Text className="mb-2 text-sm font-medium text-ink-soft">Gender</Text>
          <View className="mb-4 flex-row">
            {GENDERS.map((g) => (
              <Chip key={g} label={g[0].toUpperCase() + g.slice(1)} selected={form.gender === g} onPress={() => set('gender')(g)} />
            ))}
          </View>

          <Input label="Phone Number" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
          <Input label="Address" value={form.address} onChangeText={set('address')} />
          <Input label="Guardian / Emergency Contact" value={form.guardianName} onChangeText={set('guardianName')} />
          <Input label="Employer Name (optional)" value={form.employerName} onChangeText={set('employerName')} />

          {error ? <Text className="mb-4 text-sm text-status-danger">{error}</Text> : null}

          <GradientButton title="Register" onPress={handleRegister} loading={loading} style={{ marginBottom: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
