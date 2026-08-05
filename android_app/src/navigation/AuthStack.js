import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import RoleSelectScreen from '../screens/auth/RoleSelectScreen';
import HospitalRoleSelectScreen from '../screens/auth/HospitalRoleSelectScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import PatientRegisterScreen from '../screens/auth/PatientRegisterScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="HospitalRoleSelect" component={HospitalRoleSelectScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="PatientRegister" component={PatientRegisterScreen} />
    </Stack.Navigator>
  );
}
