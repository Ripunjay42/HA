import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Input from '../../components/Input';
import Chip from '../../components/Chip';
import Card from '../../components/Card';
import GradientButton from '../../components/GradientButton';
import api from '../../utils/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';

const ROLES = ['doctor', 'nurse', 'receptionist'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SHIFTS = ['morning', 'evening', 'night'];

export default function AddStaffScreen({ navigation }) {
  const { colors } = useThemeColors();
  const [role, setRole] = useState('doctor');
  const [departments, setDepartments] = useState([]);
  const [common, setCommon] = useState({ name: '', email: '', password: '', phone: '' });

  const [departmentId, setDepartmentId] = useState(null);
  const [specialization, setSpecialization] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [slotDay, setSlotDay] = useState('Mon');
  const [slotStart, setSlotStart] = useState('');
  const [slotEnd, setSlotEnd] = useState('');
  const [slots, setSlots] = useState([]);

  const [ward, setWard] = useState('');
  const [shift, setShift] = useState('morning');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    api.get('/departments').then((res) => {
      setDepartments(res.departments);
      setDepartmentId(res.departments[0]?._id || null);
    });
  }, []);

  const setC = (key) => (value) => setCommon((f) => ({ ...f, [key]: value }));

  const addSlot = () => {
    if (!slotStart || !slotEnd) return;
    setSlots((s) => [...s, { day: slotDay, startTime: slotStart, endTime: slotEnd }]);
    setSlotStart('');
    setSlotEnd('');
  };

  const removeSlot = (index) => setSlots((s) => s.filter((_, i) => i !== index));

  const buildAvailability = () => {
    const byDay = {};
    slots.forEach(({ day, startTime, endTime }) => {
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push({ startTime, endTime });
    });
    return Object.entries(byDay).map(([day, daySlots]) => ({ day, slots: daySlots }));
  };

  const handleSubmit = async () => {
    setError('');
    if (!common.name || !common.email || !common.password) {
      setError('Name, email, and password are required');
      return;
    }
    setLoading(true);
    try {
      const payload = { role, ...common };
      if (role === 'doctor') {
        Object.assign(payload, {
          departmentId,
          specialization,
          consultationFee: Number(consultationFee),
          availability: buildAvailability(),
        });
      } else if (role === 'nurse') {
        Object.assign(payload, { ward, shift });
      }
      const { staff } = await api.post('/admin/staff', payload);
      setSuccess(staff);
    } catch (err) {
      setError(err.message || 'Unable to add staff');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSuccess(null);
    setCommon({ name: '', email: '', password: '', phone: '' });
    setSpecialization('');
    setConsultationFee('');
    setSlots([]);
    setWard('');
  };

  if (success) {
    return (
      <SafeAreaView className="flex-1 bg-surface-app">
        <ScreenHeader title="Staff Added" onBack={() => navigation.goBack()} />
        <View className="flex-1 px-6 pt-4">
          <Card className="items-center">
            <Ionicons name="checkmark-circle" size={40} color={colors.success} />
            <Text className="mt-2 text-lg font-bold text-ink">{success.name}</Text>
            <Text className="text-xs text-ink-soft">{success.email}</Text>
            {success.staffId ? (
              <Text className="mt-2 text-base font-extrabold text-brand-navy">{success.staffId}</Text>
            ) : null}
          </Card>
          <GradientButton title="Add Another" onPress={resetForm} style={{ marginTop: 24 }} />
          <GradientButton title="Done" variant="outline" onPress={() => navigation.goBack()} style={{ marginTop: 12 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader title="Add Staff" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView className="px-6 pt-2" keyboardShouldPersistTaps="handled">
          <Text className="mb-2 text-sm font-medium text-ink-soft">Role</Text>
          <View className="mb-5 flex-row">
            {ROLES.map((r) => (
              <Chip key={r} label={r[0].toUpperCase() + r.slice(1)} selected={role === r} onPress={() => setRole(r)} />
            ))}
          </View>

          <Input label="Full Name" value={common.name} onChangeText={setC('name')} />
          <Input label="Email" value={common.email} onChangeText={setC('email')} autoCapitalize="none" keyboardType="email-address" />
          <Input label="Password" value={common.password} onChangeText={setC('password')} secureTextEntry />
          <Input label="Phone" value={common.phone} onChangeText={setC('phone')} keyboardType="phone-pad" />

          {role === 'doctor' && (
            <>
              <Text className="mb-2 text-sm font-medium text-ink-soft">Department</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                {departments.map((d) => (
                  <Chip key={d._id} label={d.name} selected={departmentId === d._id} onPress={() => setDepartmentId(d._id)} />
                ))}
              </ScrollView>
              <Input label="Specialization" value={specialization} onChangeText={setSpecialization} />
              <Input label="Consultation Fee" value={consultationFee} onChangeText={setConsultationFee} keyboardType="numeric" />

              <Text className="mb-2 text-sm font-medium text-ink-soft">Availability</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                {DAYS.map((d) => (
                  <Chip key={d} label={d} selected={slotDay === d} onPress={() => setSlotDay(d)} />
                ))}
              </ScrollView>
              <View className="mb-3 flex-row items-center">
                <Input
                  containerClassName="flex-1 mr-2 mb-0"
                  label="Start"
                  value={slotStart}
                  onChangeText={setSlotStart}
                  placeholder="09:00"
                />
                <Input
                  containerClassName="flex-1 ml-2 mb-0"
                  label="End"
                  value={slotEnd}
                  onChangeText={setSlotEnd}
                  placeholder="09:30"
                />
              </View>
              <GradientButton title="Add Slot" variant="outline" onPress={addSlot} style={{ marginBottom: 16, height: 44 }} />
              <View className="mb-4 flex-row flex-wrap">
                {slots.map((slot, index) => (
                  <View key={`${slot.day}-${slot.startTime}-${index}`} className="mb-2 mr-2 flex-row items-center rounded-full bg-surface-muted px-3 py-2">
                    <Text className="mr-2 text-xs text-ink">{slot.day} {slot.startTime}-{slot.endTime}</Text>
                    <Ionicons name="close-circle" size={16} color={colors.inkFaint} onPress={() => removeSlot(index)} />
                  </View>
                ))}
              </View>
            </>
          )}

          {role === 'nurse' && (
            <>
              <Input label="Ward" value={ward} onChangeText={setWard} />
              <Text className="mb-2 text-sm font-medium text-ink-soft">Shift</Text>
              <View className="mb-4 flex-row">
                {SHIFTS.map((s) => (
                  <Chip key={s} label={s[0].toUpperCase() + s.slice(1)} selected={shift === s} onPress={() => setShift(s)} />
                ))}
              </View>
            </>
          )}

          {error ? <Text className="mb-4 text-sm text-status-danger">{error}</Text> : null}

          <GradientButton title="Add Staff Member" onPress={handleSubmit} loading={loading} style={{ marginBottom: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
