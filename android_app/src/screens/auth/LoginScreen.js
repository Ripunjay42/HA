import { useState } from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import ScreenHeader from '../../components/ScreenHeader';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import { useAuth } from '../../hooks/AuthContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import { filterDigits } from '../../utils/validation';

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
  const { colors } = useThemeColors();

  const [phone, setPhone] = useState('');
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
        await patientLogin({ phone, password });
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
      <KeyboardAwareScrollView
        className="px-6 pt-4"
        keyboardShouldPersistTaps="handled"
        bottomOffset={40}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {isPatient ? (
          <>
            <Input
              label="Phone Number"
              value={phone}
              onChangeText={(v) => setPhone(filterDigits(v))}
              keyboardType="phone-pad"
              maxLength={10}
              placeholder="10-digit phone number"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
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

        {error ? <Text style={{ marginBottom: 16, fontSize: 14, color: colors.danger }}>{error}</Text> : null}

        <GradientButton title="Sign In" onPress={handleSubmit} loading={loading} />

        {isPatient && (
          <Text style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: colors.inkSoft }}>
            New patient?{' '}
            <Text
              style={{ fontWeight: '600', color: colors.teal }}
              onPress={() => navigation.navigate('PatientRegister')}
            >
              Register here
            </Text>
          </Text>
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
