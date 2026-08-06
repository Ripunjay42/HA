import { Dimensions, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import { useThemeColors } from '../../hooks/useThemeColors';

const CARD_SIZE = Math.min((Dimensions.get('window').width - 60) / 2, 170);

const CARDS = [
  { key: 'patient', label: 'Patient', desc: 'Book & manage your care', icon: 'person', onPress: (nav) => nav.navigate('Login', { role: 'patient' }) },
  { key: 'hospital', label: 'Hospital', desc: 'Staff & admin access', icon: 'business', onPress: (nav) => nav.navigate('HospitalRoleSelect') },
];

export default function RoleSelectScreen({ navigation }) {
  const { colors } = useThemeColors();
  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader title="Continue As" onBack={() => navigation.goBack()} />
      <View className="flex-1 items-center justify-center px-6">
        <View className="flex-row" style={{ gap: 20 }}>
          {CARDS.map((card) => (
            <Pressable
              key={card.key}
              onPress={() => card.onPress(navigation)}
              style={{
                width: CARD_SIZE,
                height: CARD_SIZE,
                borderRadius: 28,
                borderWidth: 1,
                borderColor: colors.line,
                backgroundColor: colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
              }}
            >
              <View
                style={{
                  marginBottom: 16, height: 56, width: 56, borderRadius: 28,
                  alignItems: 'center', justifyContent: 'center',
                  backgroundColor: colors.surfaceMuted,
                }}
              >
                <Ionicons name={card.icon} size={28} color={colors.teal} />
              </View>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.ink }}>{card.label}</Text>
              <Text style={{ marginTop: 4, fontSize: 12, textAlign: 'center', color: colors.inkSoft }}>
                {card.desc}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
