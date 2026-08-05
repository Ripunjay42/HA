import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/AuthContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import ThemeToggle from '../../components/ThemeToggle';

const ACTIONS = [
  { key: 'register', label: 'Register Patient', desc: 'Register a walk-in patient', icon: 'person-add', screen: 'RegisterPatient' },
  { key: 'assign', label: 'Assign Nurse', desc: 'Link a patient to a nurse by MR No', icon: 'people', screen: 'AssignNurse' },
];

export default function ReceptionistHomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { colors } = useThemeColors();

  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 pt-2">
        <View>
          <Text className="text-xs text-ink-soft">Receptionist</Text>
          <Text className="text-xl font-extrabold text-ink">{user?.name}</Text>
        </View>
        <View className="flex-row items-center" style={{ gap: 12 }}>
          <ThemeToggle />
          <Text className="text-xs font-semibold text-brand-teal" onPress={logout}>
            Log Out
          </Text>
        </View>
      </View>

      <View className="px-5 pt-6">
        {ACTIONS.map((action) => (
          <Pressable
            key={action.key}
            onPress={() => navigation.navigate(action.screen)}
            className="mb-4 flex-row items-center rounded-xl2 border border-line bg-surface p-4"
          >
            <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
              <Ionicons name={action.icon} size={22} color={colors.teal} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-ink">{action.label}</Text>
              <Text className="text-xs text-ink-soft">{action.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}
