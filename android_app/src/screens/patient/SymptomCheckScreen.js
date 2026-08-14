import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import AiMatchingOverlay from '../../components/AiMatchingOverlay';
import { useAuth } from '../../hooks/AuthContext';
import api from '../../utils/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function SymptomCheckScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useThemeColors();
  const [purpose, setPurpose] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    setError('');
    setLoading(true);
    try {
      const symptomList = symptoms.split(',').map((s) => s.trim()).filter(Boolean);
      const { appointment } = await api.post('/appointments', {
        uhid: user.uhid,
        purpose,
        symptoms: symptomList,
      });

      if (appointment.matchedDoctors?.length > 0) {
        navigation.navigate('MatchedDoctors', {
          appointmentId: appointment._id,
          doctors: appointment.matchedDoctors,
          recommendedDoctorId: appointment.recommendedDoctor?._id || null,
        });
      } else {
        navigation.navigate('Departments', { appointmentId: appointment._id });
      }
    } catch (err) {
      setError(err.message || 'Unable to continue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader title="Book a Visit" onBack={() => navigation.goBack()} />
      <KeyboardAwareScrollView
        className="px-6 pt-2"
        keyboardShouldPersistTaps="handled"
        bottomOffset={40}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="mb-5 flex-row items-start rounded-2xl bg-surface-muted p-4">
          <Ionicons name="information-circle" size={18} color={colors.teal} />
          <Text className="ml-2 flex-1 text-xs text-ink-soft">
            Tell us what's bothering you and we'll match you with the right department. If
            nothing matches, you can still browse all departments yourself.
          </Text>
        </View>

        <Input
          label="Purpose of Visit"
          value={purpose}
          onChangeText={setPurpose}
          placeholder="e.g. Routine checkup"
        />
        <Input
          label="Symptoms (comma separated)"
          value={symptoms}
          onChangeText={setSymptoms}
          placeholder="e.g. chest pain, breathlessness"
          multiline
        />

        {error ? <Text className="mb-4 text-sm text-status-danger">{error}</Text> : null}

        <GradientButton title="Find a Doctor" onPress={handleContinue} loading={loading} style={{ marginBottom: 32 }} />
      </KeyboardAwareScrollView>
      <AiMatchingOverlay visible={loading} />
    </SafeAreaView>
  );
}
