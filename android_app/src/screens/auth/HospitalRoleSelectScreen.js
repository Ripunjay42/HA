import { Dimensions, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import { useThemeColors } from '../../hooks/useThemeColors';

const CARD_SIZE = Math.min((Dimensions.get('window').width - 72) / 2, 160);

const ROLES = [
  { role: 'nurse', label: 'Nurse', desc: 'Patient lookup & vitals', icon: 'pulse' },
  { role: 'doctor', label: 'Doctor', desc: 'Appointments & consultations', icon: 'medkit' },
  { role: 'receptionist', label: 'Receptionist', desc: 'Register & assign patients', icon: 'desktop' },
  { role: 'admin', label: 'Admin', desc: 'Staff, departments & reports', icon: 'shield-checkmark' },
];

export default function HospitalRoleSelectScreen({ navigation }) {
  const { colors } = useThemeColors();
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
                borderColor: colors.line,
                backgroundColor: colors.surface,
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
                  backgroundColor: colors.surfaceMuted,
                }}
              >
                <Ionicons name={icon} size={26} color={colors.teal} />
              </View>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.ink }}>{label}</Text>
              <Text style={{ marginTop: 4, fontSize: 11, textAlign: 'center', color: colors.inkSoft }}>
                {desc}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
