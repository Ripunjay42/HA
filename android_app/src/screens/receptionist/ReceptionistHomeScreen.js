import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/AuthContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import ThemeToggle from '../../components/ThemeToggle';
import Card from '../../components/Card';

const ACTIONS = [
  { key: 'register', label: 'Register Patient', desc: 'Register a walk-in patient', icon: 'person-add', screen: 'RegisterPatient' },
  { key: 'assign', label: 'Assign Nurse', desc: 'Link a patient to a nurse by MR No', icon: 'people', screen: 'AssignNurse' },
  { key: 'assigned', label: 'Assigned Nurses', desc: 'View, reassign, or unassign linked nurses', icon: 'list', screen: 'AssignedNurses' },
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

      <View className="flex-1 px-8 pt-10">
        <View className="flex-row flex-wrap items-center" style={{ gap: 20 }}>
          {ACTIONS.map((action) => (
            <Pressable
              key={action.key}
              onPress={() => navigation.navigate(action.screen)}
              style={{ width: '45%', aspectRatio: 1, marginBottom: 1 }}
            >
              <Card className="h-full w-full items-center justify-center" style={{ padding: 10 }}>
                <View className="mb-2 h-16 w-16 items-center justify-center rounded-full bg-surface-muted">
                  <Ionicons name={action.icon} size={30} color={colors.teal} />
                </View>
                <Text className="text-center text-lg font-bold text-ink">{action.label}</Text>
                <Text className="mt-1 text-center text-[11px] text-ink-soft">{action.desc}</Text>
              </Card>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
