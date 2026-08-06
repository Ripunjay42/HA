import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PatientHomeScreen from '../screens/patient/PatientHomeScreen';
import AppointmentsScreen from '../screens/patient/AppointmentsScreen';
import PatientProfileScreen from '../screens/patient/PatientProfileScreen';
import { useThemeColors } from '../hooks/useThemeColors';

const Tab = createBottomTabNavigator();

const ICONS = { Home: 'home', Appointments: 'calendar', Profile: 'person' };

export default function PatientTabs() {
  const { colors } = useThemeColors();
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarLabelStyle: { fontFamily: 'Ubuntu_500Medium', fontSize: 11 },
        tabBarStyle: {
          // Fixed height + padding used to sit under gesture-nav/button-nav
          // system bars on devices without hardware nav buttons -- pad by
          // the actual bottom inset instead of a guessed constant.
          height: 56 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 8,
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} color={color} size={size - 2} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={PatientHomeScreen} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="Profile" component={PatientProfileScreen} />
    </Tab.Navigator>
  );
}
