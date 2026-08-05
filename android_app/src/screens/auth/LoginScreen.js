import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import { useAuth } from '../../hooks/AuthContext';

const ROLE_TITLES = {
  patient: 'Patient Sign In',
  nurse: 'Nurse Sign In',
  doctor: 'Doctor Sign In',
  receptionist: 'Receptionist Sign In',
  admin: 'Admin Sign In',
};

export default function LoginScreen({ route, navigation }) {
  const { role } = route.params;
  const { staffLogin, patientLogin } = useAuth();

  const [phone, setPhone] = useState('');
  const [mrNo, setMrNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isPatient = role === 'patient';

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (isPatient) {
        await patientLogin({ phone, mrNo });
      } else {
        await staffLogin({ role, email, password });
      }
    } catch (err) {
      setError(err.message || 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader title={ROLE_TITLES[role] || 'Sign In'} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView className="px-6 pt-4" keyboardShouldPersistTaps="handled">
          {isPatient ? (
            <>
              <Input
                label="Phone Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="10-digit phone number"
              />
              <Input
                label="MR No"
                value={mrNo}
                onChangeText={setMrNo}
                autoCapitalize="characters"
                placeholder="e.g. MR2608054202"
              />
            </>
          ) : (
            <>
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@has.local"
              />
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
              />
            </>
          )}

          {error ? <Text className="mb-4 text-sm text-status-danger">{error}</Text> : null}

          <GradientButton title="Sign In" onPress={handleSubmit} loading={loading} />

          {isPatient && (
            <Text className="mt-6 text-center text-sm text-ink-soft">
              New patient?{' '}
              <Text
                className="font-semibold text-brand-teal"
                onPress={() => navigation.navigate('PatientRegister')}
              >
                Register here
              </Text>
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
