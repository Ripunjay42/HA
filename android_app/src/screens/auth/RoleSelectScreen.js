import { Dimensions, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import { useThemeColors } from '../../hooks/useThemeColors';

const CARD_SIZE = Math.min((Dimensions.get('window').width - 60) / 2, 170);

const CARDS = [
  { key: 'patient', label: 'Patient', desc: 'Book & manage your care', icon: 'person', onPress: (nav) => nav.navigate('Login', { role: 'patient' }) },
  { key: 'hospital', label: 'Hospital', desc: 'Staff & admin access', icon: 'business', onPress: (nav) => nav.navigate('HospitalRoleSelect') },
];

export default function RoleSelectScreen({ navigation }) {
  const { gradients } = useThemeColors();
  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader title="Continue As" onBack={() => navigation.goBack()} />
      <View className="flex-1 items-center justify-center px-6">
        <View className="flex-row" style={{ gap: 20 }}>
          {CARDS.map((card) => (
            <Pressable key={card.key} onPress={() => card.onPress(navigation)}>
              <LinearGradient
                colors={gradients.hero}
                style={{
                  width: CARD_SIZE,
                  height: CARD_SIZE,
                  borderRadius: 28,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 16,
                }}
              >
                <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-white/10">
                  <Ionicons name={card.icon} size={28} color="#5FD8E8" />
                </View>
                <Text className="text-lg font-bold text-white">{card.label}</Text>
                <Text className="mt-1 text-center text-xs text-white/70">{card.desc}</Text>
              </LinearGradient>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
