import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ReceptionistHomeScreen from '../screens/receptionist/ReceptionistHomeScreen';
import RegisterPatientScreen from '../screens/receptionist/RegisterPatientScreen';
import AssignNurseScreen from '../screens/receptionist/AssignNurseScreen';
import AssignedNursesScreen from '../screens/receptionist/AssignedNursesScreen';

const Stack = createNativeStackNavigator();

export default function ReceptionistNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ReceptionistHome" component={ReceptionistHomeScreen} />
      <Stack.Screen name="RegisterPatient" component={RegisterPatientScreen} />
      <Stack.Screen name="AssignNurse" component={AssignNurseScreen} />
      <Stack.Screen name="AssignedNurses" component={AssignedNursesScreen} />
    </Stack.Navigator>
  );
}
