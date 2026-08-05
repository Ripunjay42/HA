import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import PickerInput from '../../components/PickerInput';
import GradientButton from '../../components/GradientButton';
import StatusBadge from '../../components/StatusBadge';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuth } from '../../hooks/AuthContext';
import api from '../../utils/apiClient';
import { patientOptions } from '../../utils/pickerOptions';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function NurseHomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { colors, patientStatusColor } = useThemeColors();
  const [mrNo, setMrNo] = useState('');
  const [patients, setPatients] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/patients').then((res) => setPatients(res.patients)).catch(() => {});
  }, []);

  const handleSearch = async (mrNoToUse = mrNo) => {
    setError('');
    setPatient(null);
    if (!mrNoToUse) return;
    setLoading(true);
    try {
      const { patient: found } = await api.get(`/patients/mr/${mrNoToUse.trim()}`);
      setPatient(found);
    } catch (err) {
      setError(err.message || 'Patient not found');
    } finally {
      setLoading(false);
    }
  };

  const canRecordVitals = patient && String(patient.assignedNurse) === String(user?._id || '');

  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 pt-2">
        <View>
          <Text className="text-xs text-ink-soft">Nurse</Text>
          <Text className="text-xl font-extrabold text-ink">{user?.name}</Text>
        </View>
        <View className="flex-row items-center" style={{ gap: 12 }}>
          <ThemeToggle />
          <Text className="text-xs font-semibold text-brand-teal" onPress={logout}>
            Log Out
          </Text>
        </View>
      </View>

      <ScrollView className="px-5 pt-5">
        <PickerInput
          label="Look up patient by MR No"
          value={mrNo}
          onChangeText={setMrNo}
          placeholder="e.g. MR2608054202"
          options={patientOptions(patients)}
          onSelect={(option) => {
            setMrNo(option.id);
            handleSearch(option.id);
          }}
        />
        <GradientButton title="Search" onPress={() => handleSearch()} loading={loading} style={{ marginTop: 4, marginBottom: 20 }} />

        {error ? <Text className="mb-4 text-sm text-status-danger">{error}</Text> : null}

        {patient && (
          <Card>
            <Text className="text-lg font-bold text-ink">{patient.name}</Text>
            <Text className="text-xs text-ink-soft">
              {patient.age} yrs • {patient.gender} • {patient.phone}
            </Text>
            <View className="mt-3 self-start">
              <StatusBadge status={patient.status} color={patientStatusColor[patient.status]} />
            </View>

            {patient.vitals?.recordedAt && (
              <View className="mt-4 rounded-2xl bg-surface-muted p-3">
                <Text className="text-xs font-semibold text-ink-soft">Vitals already recorded</Text>
                <Text className="mt-1 text-xs text-ink-soft">
                  BP {patient.vitals.bp} • Temp {patient.vitals.temperature} • Pulse {patient.vitals.pulse}
                </Text>
              </View>
            )}

            <View className="mt-4">
              {canRecordVitals && !patient.vitals?.recordedAt ? (
                <GradientButton
                  title="Record Vitals"
                  onPress={() => navigation.navigate('PatientVitals', { mrNo: patient.mrNo })}
                />
              ) : !canRecordVitals ? (
                <View className="flex-row items-center rounded-2xl bg-status-warning/10 p-3">
                  <Ionicons name="alert-circle" size={16} color={colors.warning} />
                  <Text className="ml-2 flex-1 text-xs text-ink-soft">
                    This patient is not assigned to you.
                  </Text>
                </View>
              ) : null}
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
