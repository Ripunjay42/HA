import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DoctorHomeScreen from '../screens/doctor/DoctorHomeScreen';
import ConsultationScreen from '../screens/doctor/ConsultationScreen';

const Stack = createNativeStackNavigator();

export default function DoctorNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DoctorHome" component={DoctorHomeScreen} />
      <Stack.Screen name="Consultation" component={ConsultationScreen} />
    </Stack.Navigator>
  );
}
