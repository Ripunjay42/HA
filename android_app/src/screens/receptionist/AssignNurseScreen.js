import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import AnimatedFormHero from '../../components/AnimatedFormHero';
import Card from '../../components/Card';
import PickerInput from '../../components/PickerInput';
import GradientButton from '../../components/GradientButton';
import api from '../../utils/apiClient';
import { patientOptions, staffOptions } from '../../utils/pickerOptions';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function AssignNurseScreen({ navigation }) {
  const { colors } = useThemeColors();
  const [mrNo, setMrNo] = useState('');
  const [patients, setPatients] = useState([]);
  const [patient, setPatient] = useState(null);
  const [staffId, setStaffId] = useState('');
  const [nurses, setNurses] = useState([]);
  const [searching, setSearching] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [assigned, setAssigned] = useState(false);

  useEffect(() => {
    api.get('/patients').then((res) => setPatients(res.patients)).catch(() => {});
    api.get('/admin/staff?role=nurse&status=active').then((res) => setNurses(res.staff)).catch(() => {});
  }, []);

  const handleSearch = async (mrNoToUse = mrNo) => {
    setError('');
    setPatient(null);
    setAssigned(false);
    if (!mrNoToUse) return;
    setSearching(true);
    try {
      const { patient: found } = await api.get(`/patients/mr/${mrNoToUse.trim()}`);
      setPatient(found);
    } catch (err) {
      setError(err.message || 'Patient not found');
    } finally {
      setSearching(false);
    }
  };

  const handleAssign = async () => {
    setError('');
    setAssigning(true);
    try {
      const { patient: updated } = await api.patch(`/patients/mr/${patient.mrNo}/assign-nurse`, { staffId });
      setPatient(updated);
      setAssigned(true);
    } catch (err) {
      setError(err.message || 'Unable to assign nurse');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader title="Assign Nurse" onBack={() => navigation.goBack()} />
      <KeyboardAwareScrollView
        className="px-6 pt-2"
        keyboardShouldPersistTaps="handled"
        bottomOffset={40}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <AnimatedFormHero
          icon="people"
          title="Assign Nurse to Patient"
          subtitle="Find the patient, then link them to their assigned nurse."
        />
        <PickerInput
          label="Patient MR No"
          value={mrNo}
          onChangeText={setMrNo}
          icon="person-outline"
          options={patientOptions(patients)}
          onSelect={(option) => {
            setMrNo(option.id);
            handleSearch(option.id);
          }}
        />
        <GradientButton title="Search" onPress={() => handleSearch()} loading={searching} style={{ marginTop: 4, marginBottom: 20 }} />

        {error ? <Text className="mb-4 text-sm text-status-danger">{error}</Text> : null}

        {patient && (
          <Card>
            <Text className="text-base font-bold text-ink">{patient.name}</Text>
            <Text className="text-xs text-ink-soft">{patient.mrNo} • {patient.phone}</Text>

            {assigned ? (
              <View className="mt-4 flex-row items-center rounded-2xl bg-status-success/10 p-3">
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text className="ml-2 text-xs text-ink">Nurse assigned successfully.</Text>
              </View>
            ) : (
              <View className="mt-4">
                <PickerInput
                  label="Nurse Staff ID"
                  value={staffId}
                  onChangeText={setStaffId}
                  placeholder="e.g. NR00001"
                  icon="medkit-outline"
                  options={staffOptions(nurses)}
                  onSelect={(option) => setStaffId(option.id)}
                />
                <GradientButton title="Assign Nurse" onPress={handleAssign} loading={assigning} style={{ marginTop: 4 }} />
              </View>
            )}
          </Card>
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
