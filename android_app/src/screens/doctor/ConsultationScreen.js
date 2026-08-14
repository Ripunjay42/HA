import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import AnimatedFormHero from '../../components/AnimatedFormHero';
import Card from '../../components/Card';
import GradientButton from '../../components/GradientButton';
import StatusBadge from '../../components/StatusBadge';
import PrescriptionImageViewer from '../../components/PrescriptionImageViewer';
import api from '../../utils/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';
import { API_BASE_URL } from '../../constants/config';

export default function ConsultationScreen({ navigation, route }) {
  const { appointmentId } = route.params;
  const { colors, appointmentStatusColor } = useThemeColors();
  const [appointment, setAppointment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [prescriptionImage, setPrescriptionImage] = useState(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [recognizing, setRecognizing] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState('');
  const [prescriptionVerified, setPrescriptionVerified] = useState(false);
  const [viewingSavedImage, setViewingSavedImage] = useState(false);

  useEffect(() => {
    api.get(`/appointments/${appointmentId}`).then((res) => setAppointment(res.appointment));
  }, [appointmentId]);

  const pickPrescriptionImage = async (fromCamera) => {
    setPrescriptionError('');
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setPrescriptionError('Permission is required to attach a prescription image');
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ base64: true, mediaTypes: ['images'], quality: 0.7 });
    if (result.canceled) return;

    const asset = result.assets[0];
    setPrescriptionImage(asset);
    setRecognizedText('');
    setPrescriptionVerified(false);

    setRecognizing(true);
    try {
      const { recognizedText: text } = await api.post(`/appointments/${appointmentId}/prescription/recognize`, {
        imageBase64: asset.base64,
      });
      setRecognizedText(text);
    } catch (err) {
      setPrescriptionError(err.message || 'Unable to recognize handwriting');
    } finally {
      setRecognizing(false);
    }
  };

  const handleRecognizedTextChange = (value) => {
    setRecognizedText(value);
    setPrescriptionVerified(false);
  };

  const requiresVerification = !!prescriptionImage;
  const canComplete = !requiresVerification || prescriptionVerified;

  const handleComplete = async () => {
    setError('');
    if (requiresVerification && !prescriptionVerified) {
      setError('Please verify the prescription details before submitting');
      return;
    }
    setSaving(true);
    try {
      const { appointment: updated } = await api.patch(`/appointments/${appointmentId}/consultation-notes`, {
        rawImageUrl: recognizedText,
        ...(prescriptionImage ? { prescriptionImageBase64: prescriptionImage.base64, prescriptionText: recognizedText } : {}),
      });
      setAppointment(updated);
    } catch (err) {
      setError(err.message || 'Unable to save notes');
    } finally {
      setSaving(false);
    }
  };

  if (!appointment) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface-app">
        <ActivityIndicator color={colors.teal} />
      </SafeAreaView>
    );
  }

  const patient = appointment.patientId;
  const vitals = patient?.vitals || {};

  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader title="Consultation" onBack={() => navigation.goBack()} />
      <KeyboardAwareScrollView
        className="px-5"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={40}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <AnimatedFormHero
          icon="medkit"
          title="Patient Consultation"
          subtitle="Review vitals and symptoms, then record your consultation notes."
        />
        <Card className="mb-4">
          <Text className="text-lg font-bold text-ink">{patient?.name}</Text>
          <Text className="text-xs text-ink-soft">
            {patient?.age} yrs • {patient?.gender} • UHID {patient?.uhid}
          </Text>
          <View className="mt-3 self-start">
            <StatusBadge status={appointment.status} color={appointmentStatusColor[appointment.status]} />
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="mb-3 text-sm font-bold text-ink">Vitals</Text>
          <View className="flex-row flex-wrap">
            {[
              ['Weight', vitals.weight != null ? `${vitals.weight} kg` : '—'],
              ['BP', vitals.bp ?? '—'],
              ['Temp', vitals.temperature != null ? `${vitals.temperature} °F` : '—'],
              ['Height', vitals.height != null ? `${vitals.height} cm` : '—'],
              ['Pulse', vitals.pulse != null ? `${vitals.pulse} bpm` : '—'],
              ['Blood Grp', vitals.bloodGroup ?? '—'],
            ].map(([label, value]) => (
              <View key={label} className="mb-3" style={{ width: '33.33%' }}>
                <Text className="text-xs text-ink-soft">{label}</Text>
                <Text className="mt-0.5 text-base font-semibold text-ink">{value}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="mb-3 text-sm font-bold text-ink">Purpose & Symptoms</Text>
          <View className="flex-row">
            <View className="flex-1 pr-2">
              <Text className="text-xs text-ink-soft">Purpose</Text>
              <Text className="mt-0.5 text-base text-ink">{appointment.purpose || '—'}</Text>
            </View>
            <View className="flex-1 pl-2">
              <Text className="text-xs text-ink-soft">Symptoms</Text>
              <Text className="mt-0.5 text-base text-ink">
                {appointment.symptoms?.length ? appointment.symptoms.join(', ') : '—'}
              </Text>
            </View>
          </View>
        </Card>

        {appointment.prescriptionDetails?.recordedAt ? (
          <Card className="mb-6">
            <Text className="mb-2 text-sm font-bold text-ink">Prescription Details</Text>
            <Pressable onPress={() => setViewingSavedImage(true)} className="mb-3">
              <View
                className="items-center justify-center rounded-2xl bg-surface-muted"
                style={{ height: 160 }}
              >
                <Ionicons name="image-outline" size={28} color={colors.inkSoft} />
                <Text className="mt-2 text-xs font-semibold text-ink-soft">Tap to view prescription image</Text>
              </View>
            </Pressable>
            <Text className="text-xs text-ink-soft">
              {appointment.prescriptionDetails.recognizedText || 'No recognized text saved.'}
            </Text>
          </Card>
        ) : (
          <Card className="mb-6">
            <Text className="mb-2 text-sm font-bold text-ink">Prescription Details</Text>
            <Text className="mb-3 text-xs text-ink-soft">
              Photograph or attach your handwritten prescription — we'll recognize the text automatically.
            </Text>

            {prescriptionImage ? (
              <Image
                source={{ uri: prescriptionImage.uri }}
                style={{ width: '100%', height: 180, borderRadius: 16, marginBottom: 12 }}
                resizeMode="contain"
              />
            ) : null}

            <View className="mb-3 flex-row" style={{ gap: 8 }}>
              <Pressable
                onPress={() => pickPrescriptionImage(true)}
                className="flex-1 flex-row items-center justify-center rounded-2xl border border-line bg-surface py-3"
              >
                <Ionicons name="camera-outline" size={16} color={colors.ink} />
                <Text className="ml-2 text-xs font-semibold text-ink">Camera</Text>
              </Pressable>
              <Pressable
                onPress={() => pickPrescriptionImage(false)}
                className="flex-1 flex-row items-center justify-center rounded-2xl border border-line bg-surface py-3"
              >
                <Ionicons name="image-outline" size={16} color={colors.ink} />
                <Text className="ml-2 text-xs font-semibold text-ink">
                  {prescriptionImage ? 'Replace Image' : 'Choose from Gallery'}
                </Text>
              </Pressable>
            </View>

            {recognizing ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color={colors.teal} />
                <Text className="ml-2 text-xs text-ink-soft">Recognizing handwriting...</Text>
              </View>
            ) : null}

            {prescriptionError ? <Text className="mb-2 text-xs text-status-danger">{prescriptionError}</Text> : null}

            {prescriptionImage && !recognizing ? (
              <>
                <Text className="mb-2 mt-1 text-xs font-semibold text-ink-soft">
                  AI-Corrected Text (edit if needed)
                </Text>
                <TextInput
                  value={recognizedText}
                  onChangeText={handleRecognizedTextChange}
                  placeholder="Recognized prescription text will appear here"
                  placeholderTextColor={colors.inkFaint}
                  multiline
                  className="h-56 rounded-2xl border border-line bg-surface p-3 text-sm text-ink"
                  style={{ fontFamily: 'Ubuntu_400Regular' }}
                  textAlignVertical="top"
                />

                <Pressable
                  onPress={() => setPrescriptionVerified((v) => !v)}
                  className="mt-3 flex-row items-center rounded-2xl border border-line bg-surface p-3"
                >
                  <Ionicons
                    name={prescriptionVerified ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={prescriptionVerified ? colors.teal : colors.inkSoft}
                  />
                  <Text className="ml-3 flex-1 text-xs font-semibold text-ink">
                    I have verified this prescription is accurate
                  </Text>
                </Pressable>
              </>
            ) : null}

            {requiresVerification && !prescriptionVerified ? (
              <Text className="mt-3 text-xs text-status-warning">
                Check "I have verified this prescription is accurate" above to enable submission.
              </Text>
            ) : null}
            {error ? <Text className="mt-2 text-sm text-status-danger">{error}</Text> : null}
            <GradientButton
              title="Complete Consultation"
              onPress={handleComplete}
              loading={saving}
              disabled={!canComplete}
              style={{ marginTop: 16 }}
            />
          </Card>
        )}
      </KeyboardAwareScrollView>

      {viewingSavedImage && (
        <PrescriptionImageViewer
          url={`${API_BASE_URL}/appointments/${appointmentId}/prescription/image`}
          onClose={() => setViewingSavedImage(false)}
        />
      )}
    </SafeAreaView>
  );
}
