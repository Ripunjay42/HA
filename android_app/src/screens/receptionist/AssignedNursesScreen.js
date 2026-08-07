import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import PickerInput from '../../components/PickerInput';
import GradientButton from '../../components/GradientButton';
import api from '../../utils/apiClient';
import { staffOptions } from '../../utils/pickerOptions';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function AssignedNursesScreen({ navigation }) {
  const { colors, patientStatusColor } = useThemeColors();
  const [patients, setPatients] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingMrNo, setEditingMrNo] = useState(null);
  const [editStaffId, setEditStaffId] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/patients'),
      api.get('/admin/staff?role=nurse&status=active'),
    ])
      .then(([patientsRes, nursesRes]) => {
        setPatients(patientsRes.patients);
        setNurses(nursesRes.staff);
      })
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const assignedPatients = patients.filter((p) => p.assignedNurse);

  const startEdit = (p) => {
    setEditError('');
    setEditStaffId('');
    setEditingMrNo(p.mrNo);
  };

  const handleReassign = async (targetMrNo) => {
    setEditError('');
    if (!editStaffId) {
      setEditError('Select a nurse first');
      return;
    }
    setSavingEdit(true);
    try {
      await api.patch(`/patients/mr/${targetMrNo}/assign-nurse`, { staffId: editStaffId });
      setEditingMrNo(null);
      setEditStaffId('');
      load();
    } catch (err) {
      setEditError(err.message || 'Unable to reassign nurse');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleUnassign = async (targetMrNo) => {
    setEditError('');
    setSavingEdit(true);
    try {
      await api.patch(`/patients/mr/${targetMrNo}/unassign-nurse`);
      setEditingMrNo(null);
      setEditStaffId('');
      load();
    } catch (err) {
      setEditError(err.message || 'Unable to unassign nurse');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader title="Assigned Nurses" onBack={() => navigation.goBack()} />
      <FlatList
        data={assignedPatients}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={
          !loading ? (
            <Text className="mt-8 text-center text-sm text-ink-soft">No patients have a nurse assigned yet.</Text>
          ) : null
        }
        renderItem={({ item: p }) => {
          const isEditing = editingMrNo === p.mrNo;
          const isLocked = p.status === 'token_generated';
          return (
            <Card className="mb-10">
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-surface-muted">
                  <Ionicons name="person-outline" size={18} color={colors.ink} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-ink">{p.name}</Text>
                  <Text className="text-xs text-ink-soft">{p.mrNo} • {p.phone}</Text>
                </View>
                <View
                  className="rounded-full px-2.5 py-1"
                  style={{ backgroundColor: `${patientStatusColor[p.status]}1A` }}
                >
                  <Text className="text-xs font-semibold" style={{ color: patientStatusColor[p.status] }}>
                    {p.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>

              <View className="mt-3 flex-row items-center rounded-2xl bg-surface-muted px-3 py-2.5">
                <Ionicons name="medkit-outline" size={16} color={colors.teal} />
                <Text className="ml-2 flex-1 text-xs text-ink" numberOfLines={1}>
                  {p.assignedNurse.name} • {p.assignedNurse.staffId}
                </Text>
              </View>

              {isLocked ? (
                <View className="mt-3 flex-row items-center">
                  <Ionicons name="lock-closed-outline" size={14} color={colors.inkFaint} />
                  <Text className="ml-1.5 text-xs text-ink-soft">Token active — assignment locked</Text>
                </View>
              ) : isEditing ? (
                <View className="mt-3">
                  <PickerInput
                    label="Reassign to Nurse"
                    value={editStaffId}
                    onChangeText={setEditStaffId}
                    placeholder="e.g. NR00001"
                    icon="medkit-outline"
                    options={staffOptions(nurses)}
                    onSelect={(option) => setEditStaffId(option.id)}
                  />
                  {editError ? <Text className="mb-2 text-xs text-status-danger">{editError}</Text> : null}
                  <View className="flex-row" style={{ gap: 10 }}>
                    <GradientButton
                      title="Cancel"
                      variant="outline"
                      onPress={() => { setEditingMrNo(null); setEditError(''); }}
                      style={{ flex: 1, height: 44 }}
                    />
                    <GradientButton
                      title="Save"
                      variant="outline"
                      onPress={() => handleReassign(p.mrNo)}
                      loading={savingEdit}
                      style={{ flex: 1, height: 44 }}
                    />
                  </View>
                </View>
              ) : (
                <View className="mt-3 flex-row" style={{ gap: 10 }}>
                  <GradientButton
                    title="Reassign"
                    variant='outline'
                    onPress={() => startEdit(p)}
                    style={{ flex: 1, height: 40 }}
                  />
                  <GradientButton
                    title="Unassign"
                    variant="outline"
                    onPress={() => handleUnassign(p.mrNo)}
                    loading={savingEdit}
                    style={{ flex: 1, height: 40 }}
                  />
                </View>
              )}
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
}
