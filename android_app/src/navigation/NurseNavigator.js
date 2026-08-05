import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NurseHomeScreen from '../screens/nurse/NurseHomeScreen';
import PatientVitalsScreen from '../screens/nurse/PatientVitalsScreen';

const Stack = createNativeStackNavigator();

export default function NurseNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NurseHome" component={NurseHomeScreen} />
      <Stack.Screen name="PatientVitals" component={PatientVitalsScreen} />
    </Stack.Navigator>
  );
}
