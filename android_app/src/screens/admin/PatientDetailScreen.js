import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import PrescriptionImageViewer from '../../components/PrescriptionImageViewer';
import api from '../../utils/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';
import { API_BASE_URL } from '../../constants/config';

const Row = ({ icon, label, value, colors }) => {
  if (!value) return null;
  return (
    <View className="mb-3 flex-row items-start">
      <Ionicons name={icon} size={16} color={colors.inkFaint} style={{ marginTop: 2 }} />
      <View className="ml-3 flex-1">
        <Text style={{ fontSize: 11, color: colors.inkSoft }}>{label}</Text>
        <Text style={{ fontSize: 14, color: colors.ink, fontWeight: '600' }}>{value}</Text>
      </View>
    </View>
  );
};

export default function PatientDetailScreen({ navigation, route }) {
  const { mrNo } = route.params;
  const { colors, patientStatusColor, appointmentStatusColor } = useThemeColors();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewingPrescriptionId, setViewingPrescriptionId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    api.get(`/patients/mr/${mrNo}`)
      .then((res) => {
        setPatient(res.patient);
        if (res.patient.uhid) {
          return api.get(`/appointments/patient/${res.patient.uhid}`).then((r) => setAppointments(r.appointments));
        }
        setAppointments([]);
      })
      .catch((err) => setError(err.message || 'Unable to load patient'))
      .finally(() => setLoading(false));
  }, [mrNo]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface-app">
        <ActivityIndicator color={colors.teal} />
      </SafeAreaView>
    );
  }

  if (error || !patient) {
    return (
      <SafeAreaView className="flex-1 bg-surface-app">
        <ScreenHeader title="Patient" onBack={() => navigation.goBack()} />
        <Text className="mt-8 text-center text-sm text-status-danger">{error || 'Patient not found'}</Text>
      </SafeAreaView>
    );
  }

  const vitals = patient.vitals || {};

  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader title="Patient Details" onBack={() => navigation.goBack()} />
      <ScrollView className="px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <Card className="mb-4 items-center">
          <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-surface-muted">
            <Ionicons name="person" size={30} color={colors.ink} />
          </View>
          <Text className="text-lg font-bold text-ink">{patient.name}</Text>
          <Text className="text-xs text-ink-soft">{patient.mrNo}</Text>
          <View
            className="mt-2 rounded-full px-3 py-1"
            style={{ backgroundColor: `${patientStatusColor[patient.status]}1A` }}
          >
            <Text className="text-xs font-semibold" style={{ color: patientStatusColor[patient.status] }}>
              {patient.status.replace('_', ' ')}
            </Text>
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="mb-2 text-sm font-bold text-ink">Basic Info</Text>
          <Row icon="calendar-outline" label="Age / Gender" value={patient.age ? `${patient.age} yrs • ${patient.gender || '—'}` : patient.gender} colors={colors} />
          <Row icon="call-outline" label="Phone" value={patient.phone} colors={colors} />
          <Row icon="home-outline" label="Address" value={patient.address} colors={colors} />
          <Row icon="people-outline" label="Guardian / Emergency Contact" value={patient.guardianName} colors={colors} />
        </Card>

        <Card className="mb-4">
          <Text className="mb-2 text-sm font-bold text-ink">Identifiers</Text>
          <Row icon="pricetag-outline" label="MR No" value={patient.mrNo} colors={colors} />
          <Row icon="finger-print-outline" label="UHID" value={patient.uhid} colors={colors} />
          <Row
            icon="key-outline"
            label="Token No"
            value={patient.status === 'token_expired' ? `${patient.tokenNo} (expired)` : patient.tokenNo}
            colors={colors}
          />
        </Card>

        {patient.tokenHistory?.length > 0 && (
          <Card className="mb-4">
            <Text className="mb-2 text-sm font-bold text-ink">Token History</Text>
            {[...patient.tokenHistory].reverse().map((entry, index) => (
              <View
                key={`${entry.tokenNo}-${entry.expiredAt}`}
                className={index > 0 ? 'mt-2 pt-2' : ''}
                style={index > 0 ? { borderTopWidth: 1, borderTopColor: colors.line } : undefined}
              >
                <View className="flex-row items-center justify-between">
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.ink }}>{entry.tokenNo}</Text>
                  <Text style={{ fontSize: 11, color: colors.inkFaint }}>
                    {entry.expiredAt ? new Date(entry.expiredAt).toLocaleString() : '—'}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        <Card className="mb-4">
          <Text className="mb-2 text-sm font-bold text-ink">Registration & Payment</Text>
          <Row
            icon="clipboard-outline"
            label="Registration Source"
            value={patient.registrationSource === 'receptionist' ? 'Receptionist' : 'Self'}
            colors={colors}
          />
          <Row
            icon="cash-outline"
            label="Payment Category"
            value={patient.paymentCategory === 'non_payment' ? 'Non-Payment (Company Covered)' : 'Payment'}
            colors={colors}
          />
          <Row icon="business-outline" label="Employer / Company" value={patient.companyId?.name} colors={colors} />
        </Card>

        <Card className="mb-4">
          <Text className="mb-2 text-sm font-bold text-ink">Nurse Assignment</Text>
          <Row
            icon="medkit-outline"
            label="Assigned Nurse"
            value={patient.assignedNurse ? `${patient.assignedNurse.name} • ${patient.assignedNurse.staffId}` : 'Not assigned'}
            colors={colors}
          />
        </Card>

        {vitals.recordedAt && (
          <Card className="mb-4">
            <Text className="mb-2 text-sm font-bold text-ink">Vitals</Text>
            <Row icon="scale-outline" label="Weight" value={vitals.weight ? `${vitals.weight} kg` : null} colors={colors} />
            <Row icon="pulse-outline" label="Blood Pressure" value={vitals.bp} colors={colors} />
            <Row icon="thermometer-outline" label="Temperature" value={vitals.temperature ? `${vitals.temperature} °F` : null} colors={colors} />
            <Row icon="resize-outline" label="Height" value={vitals.height ? `${vitals.height} cm` : null} colors={colors} />
            <Row icon="heart-outline" label="Pulse" value={vitals.pulse ? `${vitals.pulse} bpm` : null} colors={colors} />
            <Row icon="water-outline" label="Blood Group" value={vitals.bloodGroup} colors={colors} />
          </Card>
        )}

        {appointments.length > 0 && (
          <Card className="mb-4">
            <Text className="mb-2 text-sm font-bold text-ink">Consultations</Text>
            {appointments.map((appt, index) => {
              const isCompleted = appt.status === 'completed';
              return (
                <View
                  key={appt._id}
                  className={index > 0 ? 'mt-4 pt-4' : ''}
                  style={index > 0 ? { borderTopWidth: 1, borderTopColor: colors.line } : undefined}
                >
                  <View className="mb-2 flex-row items-center justify-between">
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.ink }}>
                      Dr. {appt.selectedDoctor?.name || 'Not selected'}
                    </Text>
                    <View
                      className="rounded-full px-2.5 py-1"
                      style={{ backgroundColor: `${appointmentStatusColor[appt.status]}1A` }}
                    >
                      <Text className="text-xs font-semibold" style={{ color: appointmentStatusColor[appt.status] }}>
                        {appt.status.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>
                  <Row icon="git-branch-outline" label="Department" value={appt.matchedDepartment?.name} colors={colors} />
                  <Row icon="clipboard-outline" label="Purpose" value={appt.purpose} colors={colors} />
                  {isCompleted ? (
                    <>
                      <View className="mt-1 flex-row items-center">
                        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                        <Text className="ml-1.5 text-xs font-semibold" style={{ color: colors.success }}>
                          Consultation completed
                        </Text>
                      </View>
                      <Row
                        icon="document-text-outline"
                        label="Consultation Notes"
                        value={appt.consultationNotes?.rawImageUrl}
                        colors={colors}
                      />
                      {appt.prescriptionDetails?.recordedAt && (
                        <View className="mt-2">
                          <Row
                            icon="medkit-outline"
                            label="Prescription Details"
                            value={appt.prescriptionDetails.recognizedText}
                            colors={colors}
                          />
                          <Pressable
                            onPress={() => setViewingPrescriptionId(appt._id)}
                            className="mt-1 flex-row items-center self-start rounded-full bg-brand-teal/10 px-3 py-1.5"
                          >
                            <Ionicons name="image-outline" size={14} color={colors.teal} />
                            <Text className="ml-1.5 text-xs font-semibold text-brand-teal">
                              View Prescription Image
                            </Text>
                          </Pressable>
                        </View>
                      )}
                    </>
                  ) : (
                    <View className="mt-1 flex-row items-center">
                      <Ionicons name="time-outline" size={16} color={colors.inkFaint} />
                      <Text className="ml-1.5 text-xs text-ink-soft">Consultation not yet completed</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>

      {viewingPrescriptionId && (
        <PrescriptionImageViewer
          url={`${API_BASE_URL}/appointments/${viewingPrescriptionId}/prescription/image`}
          onClose={() => setViewingPrescriptionId(null)}
        />
      )}
    </SafeAreaView>
  );
}
