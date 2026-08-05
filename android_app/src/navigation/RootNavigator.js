import { ActivityIndicator, View } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../hooks/AuthContext';
import AuthStack from './AuthStack';
import PatientNavigator from './PatientNavigator';
import NurseNavigator from './NurseNavigator';
import DoctorNavigator from './DoctorNavigator';
import ReceptionistNavigator from './ReceptionistNavigator';
import AdminNavigator from './AdminNavigator';
import { useThemeColors } from '../hooks/useThemeColors';

const ROLE_NAVIGATORS = {
  patient: PatientNavigator,
  nurse: NurseNavigator,
  doctor: DoctorNavigator,
  receptionist: ReceptionistNavigator,
  admin: AdminNavigator,
};

export default function RootNavigator() {
  const { isLoading, isAuthenticated, role } = useAuth();
  const { colors, isDark } = useThemeColors();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-app">
        <ActivityIndicator color={colors.teal} size="large" />
      </View>
    );
  }

  const RoleNavigator = isAuthenticated ? ROLE_NAVIGATORS[role] : null;

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.surfaceApp,
      card: colors.surface,
      text: colors.ink,
      border: colors.line,
      primary: colors.teal,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      {RoleNavigator ? <RoleNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}
