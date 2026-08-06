import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Input from '../../components/Input';
import PickerInput from '../../components/PickerInput';
import Chip from '../../components/Chip';
import GradientButton from '../../components/GradientButton';
import Card from '../../components/Card';
import { useAuth } from '../../hooks/AuthContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import api from '../../utils/apiClient';
import { companyOptions } from '../../utils/pickerOptions';

const GENDERS = ['male', 'female', 'other'];

export default function PatientRegisterScreen({ navigation }) {
  const { registerPatient, patientLogin } = useAuth();
  const { colors } = useThemeColors();

  const [form, setForm] = useState({
    name: '', age: '', gender: 'male', phone: '', password: '', address: '', guardianName: '', employerName: '',
  });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(null);
  const [continuing, setContinuing] = useState(false);

  useEffect(() => {
    api.get('/companies').then((res) => setCompanies(res.companies)).catch(() => {});
  }, []);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const handleRegister = async () => {
    setError('');
    if (!form.name || !form.age || !form.phone || !form.password) {
      setError('Name, age, phone, and password are required');
      return;
    }
    setLoading(true);
    try {
      const patient = await registerPatient({ ...form, age: Number(form.age) });
      setRegistered(patient);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    setContinuing(true);
    try {
      await patientLogin({ phone: registered.phone, password: form.password });
    } catch (err) {
      setError(err.message || 'Unable to sign in');
      setContinuing(false);
    }
  };

  if (registered) {
    return (
      <SafeAreaView className="flex-1 bg-surface-app">
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-status-success/10">
            <Ionicons name="checkmark-circle" size={56} color={colors.success} />
          </View>
          <Text className="text-center text-2xl font-bold text-ink">Registration Successful</Text>
          <Text className="mt-2 text-center text-sm text-ink-soft">
            Please note your MR No — you'll need it for your visit. Sign in anytime with your
            phone number and password.
          </Text>

          <Card className="mt-8 w-full items-center">
            <Text className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Your MR No</Text>
            <Text className="mt-2 text-3xl font-extrabold text-brand-teal">{registered.mrNo}</Text>
            <View className="mt-4 flex-row items-center rounded-full bg-surface-muted px-3 py-1">
              <Ionicons name="phone-portrait-outline" size={14} color={colors.inkSoft} />
              <Text className="ml-2 text-xs text-ink-soft">{registered.phone}</Text>
            </View>
          </Card>

          <GradientButton
            title="Continue"
            onPress={handleContinue}
            loading={continuing}
            style={{ width: '100%', marginTop: 32 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader title="Patient Registration" onBack={() => navigation.goBack()} />
      <KeyboardAwareScrollView
        className="px-6 pt-2"
        keyboardShouldPersistTaps="handled"
        bottomOffset={40}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Input label="Full Name" value={form.name} onChangeText={set('name')} placeholder="Jane Doe" />
        <Input
          label="Age"
          value={form.age}
          onChangeText={set('age')}
          keyboardType="number-pad"
          placeholder="30"
        />

        <Text className="mb-2 text-sm font-medium text-ink-soft">Gender</Text>
        <View className="mb-4 flex-row">
          {GENDERS.map((g) => (
            <Chip key={g} label={g[0].toUpperCase() + g.slice(1)} selected={form.gender === g} onPress={() => set('gender')(g)} />
          ))}
        </View>

        <Input
          label="Phone Number"
          value={form.phone}
          onChangeText={set('phone')}
          keyboardType="phone-pad"
          placeholder="10-digit phone number"
        />
        <Input
          label="Password"
          value={form.password}
          onChangeText={set('password')}
          secureTextEntry
          placeholder="Create a password"
        />
        <Input label="Address" value={form.address} onChangeText={set('address')} placeholder="Street, City" />
        <Input
          label="Guardian / Emergency Contact"
          value={form.guardianName}
          onChangeText={set('guardianName')}
          placeholder="Name of guardian"
        />
        <PickerInput
          label="Employer Name (optional)"
          value={form.employerName}
          onChangeText={set('employerName')}
          placeholder="Leave blank if not applicable"
          icon="business-outline"
          options={companyOptions(companies)}
          onSelect={(option) => set('employerName')(option.id)}
          clearable
        />
        <Text className="-mt-2 mb-4 text-xs text-ink-soft">
          If your employer is a registered company, your consultation may be covered.
        </Text>

        {error ? <Text className="mb-4 text-sm text-status-danger">{error}</Text> : null}

        <GradientButton title="Register" onPress={handleRegister} loading={loading} style={{ marginBottom: 32 }} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
