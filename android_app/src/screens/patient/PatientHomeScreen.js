import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuth } from '../../hooks/AuthContext';
import api from '../../utils/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';

const QUICK_ACTIONS = [
  { key: 'doctor', label: 'Find Doctor', icon: 'people', screen: 'Departments' },
  { key: 'appointments', label: 'Appointments', icon: 'calendar', screen: 'AppointmentsTab' },
  { key: 'symptom', label: 'Book Visit', icon: 'medkit', screen: 'SymptomCheck' },
  { key: 'emergency', label: 'Emergency', icon: 'call', screen: null },
];

export default function PatientHomeScreen({ navigation }) {
  const { user, refreshUser } = useAuth();
  const { colors, gradients, appointmentStatusColor } = useThemeColors();
  const [departments, setDepartments] = useState([]);
  const [upcoming, setUpcoming] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [deptRes, apptRes] = await Promise.all([
      api.get('/departments'),
      api.get('/appointments/mine'),
    ]);
    setDepartments(deptRes.departments);
    const next = apptRes.appointments.find((a) => !['cancelled', 'completed'].includes(a.status));
    setUpcoming(next || null);
    await refreshUser();
  }, [refreshUser]);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => {});
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load().catch(() => {});
    setRefreshing(false);
  };

  const hasActiveToken = user?.status === 'token_generated';

  // Lets a patient tap back into an in-progress appointment and pick up
  // exactly where they left off, instead of only landing on the list.
  const resumeAppointment = (appointment) => {
    if (appointment.status === 'pending_doctor') {
      if (appointment.matchedDepartment) {
        navigation.navigate('DoctorList', {
          departmentId: appointment.matchedDepartment._id,
          departmentName: appointment.matchedDepartment.name,
          appointmentId: appointment._id,
          matched: true,
        });
      } else {
        navigation.navigate('Departments', { appointmentId: appointment._id });
      }
      return;
    }
    if (appointment.status === 'pending_slot' && appointment.selectedDoctor) {
      navigation.navigate('BookSlot', { appointmentId: appointment._id, doctor: appointment.selectedDoctor });
      return;
    }
    if (appointment.status === 'pending_payment' && appointment.selectedDoctor) {
      navigation.navigate('Payment', {
        appointmentId: appointment._id,
        amount: appointment.selectedDoctor.consultationFee,
      });
      return;
    }
    navigation.navigate('Appointments');
  };

  const handleQuickAction = (action) => {
    if (!action.screen) return;
    if (action.screen === 'AppointmentsTab') {
      navigation.navigate('Appointments');
      return;
    }
    if (action.key === 'symptom' && !hasActiveToken) {
      navigation.navigate('VitalsPending', { expired: user?.status === 'token_expired' });
      return;
    }
    navigation.navigate(action.screen);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="flex-row items-center justify-between px-5 pt-2">
          <View>
            <Text className="text-xs text-ink-soft">Welcome back</Text>
            <Text className="text-xl font-extrabold text-ink">{user?.name}</Text>
          </View>
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <ThemeToggle />
            <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-surface-muted">
              <Ionicons name="notifications-outline" size={20} color={colors.ink} />
            </Pressable>
          </View>
        </View>

        <View className="flex-row items-stretch rounded-2xl border border-line bg-surface mx-5 mt-4 px-4 py-3.5">
          <View className="flex-1 items-center">
            <Ionicons name="finger-print-outline" size={17} color={colors.inkSoft} />
            <Text className="mt-1.5 text-[10px] font-semibold uppercase text-ink-faint" style={{ letterSpacing: 0.5 }}>
              MR No
            </Text>
            <Text className="mt-0.5 text-xs font-bold text-ink" numberOfLines={1}>{user?.mrNo}</Text>
          </View>

          {!!user?.uhid && (
            <>
              <View className="mx-1 w-px bg-line" />
              <View className="flex-1 items-center">
                <Ionicons name="card-outline" size={17} color={colors.inkSoft} />
                <Text className="mt-1.5 text-[10px] font-semibold uppercase text-ink-faint" style={{ letterSpacing: 0.5 }}>
                  UHID
                </Text>
                <Text className="mt-0.5 text-xs font-bold text-ink" numberOfLines={1}>{user?.uhid}</Text>
              </View>

              <View className="mx-1 w-px bg-line" />
              <View className="flex-1 items-center">
                <Ionicons name="ticket-outline" size={17} color={hasActiveToken ? colors.inkSoft : colors.danger} />
                <Text className="mt-1.5 text-[10px] font-semibold uppercase text-ink-faint" style={{ letterSpacing: 0.5 }}>
                  Token
                </Text>
                <Text
                  className="mt-0.5 text-xs font-bold"
                  numberOfLines={1}
                  style={{ color: hasActiveToken ? colors.ink : colors.danger }}
                >
                  {user?.tokenNo}{!hasActiveToken ? ' (expired)' : ''}
                </Text>
              </View>
            </>
          )}
        </View>

        <Pressable onPress={() => handleQuickAction({ key: 'symptom', screen: 'SymptomCheck' })} className="mx-5 mt-4">
          <LinearGradient
            colors={gradients.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ overflow: 'hidden', borderRadius: 28, padding: 24 }}
          >
            <Text className="text-2xl font-extrabold text-white">Healthy You,{'\n'}Happy Life</Text>
            <Text className="mt-2 text-sm text-white/70">Expert care for you and your family.</Text>
            <View className="mt-4 self-start rounded-full bg-brand-teal px-5 py-2.5">
              <Text className="text-sm font-semibold text-white">Book Appointment</Text>
            </View>
          </LinearGradient>
        </Pressable>

        <View className="mx-5 mt-5 flex-row flex-wrap justify-between">
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.key}
              onPress={() => handleQuickAction(action)}
              className="mb-3 w-[23%] items-center rounded-xl2 border border-line bg-surface py-4"
            >
              <Ionicons name={action.icon} size={22} color={colors.teal} />
              <Text className="mt-2 text-center text-[11px] font-medium text-ink">{action.label}</Text>
            </Pressable>
          ))}
        </View>

        {upcoming && (
          <View className="mx-5 mt-2">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-base font-bold text-ink">Upcoming Appointment</Text>
              <Text
                className="text-xs font-semibold text-brand-teal"
                onPress={() => navigation.navigate('Appointments')}
              >
                View All
              </Text>
            </View>
            <Pressable onPress={() => resumeAppointment(upcoming)}>
              <Card className="flex-row items-center">
                <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
                  <Ionicons name="person" size={22} color={colors.ink} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-ink">
                    {upcoming.selectedDoctor ? upcoming.selectedDoctor.name : 'Doctor not selected yet'}
                  </Text>
                  <Text className="text-xs text-ink-soft">
                    {upcoming.matchedDepartment?.name || 'General'}
                    {upcoming.slot?.startTime ? ` • ${upcoming.slot.startTime}` : ''}
                  </Text>
                  <View className="mt-2 self-start">
                    <StatusBadge status={upcoming.status} color={appointmentStatusColor[upcoming.status]} />
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
              </Card>
            </Pressable>
          </View>
        )}

        <View className="mx-5 mb-8 mt-5">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-base font-bold text-ink">Departments</Text>
            <Text
              className="text-xs font-semibold text-brand-teal"
              onPress={() => navigation.navigate('Departments')}
            >
              View All
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {departments.map((dept) => (
              <Pressable
                key={dept._id}
                onPress={() => navigation.navigate('DoctorList', { departmentId: dept._id, departmentName: dept.name })}
                className="mr-3 w-32 items-center rounded-xl2 border border-line bg-surface p-4"
              >
                <View className="mb-2 h-11 w-11 items-center justify-center rounded-full bg-surface-muted">
                  <Ionicons name="body-outline" size={20} color={colors.teal} />
                </View>
                <Text className="text-center text-xs font-semibold text-ink" numberOfLines={2}>
                  {dept.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
