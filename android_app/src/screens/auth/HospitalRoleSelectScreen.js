import { Dimensions, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import { lightColors } from '../../constants/theme';

const CARD_SIZE = Math.min((Dimensions.get('window').width - 72) / 2, 160);

const ROLES = [
  { role: 'nurse', label: 'Nurse', desc: 'Patient lookup & vitals', icon: 'pulse' },
  { role: 'doctor', label: 'Doctor', desc: 'Appointments & consultations', icon: 'medkit' },
  { role: 'receptionist', label: 'Receptionist', desc: 'Register & assign patients', icon: 'desktop' },
  { role: 'admin', label: 'Admin', desc: 'Staff, departments & reports', icon: 'shield-checkmark' },
];

// These cards are deliberately fixed to the light palette regardless of the
// app's theme (mirrors WelcomeScreen's always-dark hero) so the label text
// is always dark-on-white and never blends into a dark background.
export default function HospitalRoleSelectScreen({ navigation }) {
  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader title="Hospital Sign In" onBack={() => navigation.goBack()} />
      <View className="flex-1 items-center justify-center px-6">
        <View className="flex-row flex-wrap justify-center" style={{ gap: 16, width: CARD_SIZE * 2 + 16 }}>
          {ROLES.map(({ role, label, desc, icon }) => (
            <Pressable
              key={role}
              onPress={() => navigation.navigate('Login', { role })}
              style={{
                width: CARD_SIZE,
                height: CARD_SIZE,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: lightColors.line,
                backgroundColor: lightColors.surface,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 12,
              }}
            >
              <View
                style={{
                  marginBottom: 12,
                  height: 56,
                  width: 56,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 28,
                  backgroundColor: lightColors.surfaceMuted,
                }}
              >
                <Ionicons name={icon} size={26} color={lightColors.teal} />
              </View>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: lightColors.ink }}>{label}</Text>
              <Text style={{ marginTop: 4, fontSize: 11, textAlign: 'center', color: lightColors.inkSoft }}>
                {desc}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
