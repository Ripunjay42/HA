import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NurseHomeScreen from '../screens/nurse/NurseHomeScreen';
import PatientVitalsScreen from '../screens/nurse/PatientVitalsScreen';
import NurseSymptomCheckScreen from '../screens/nurse/NurseSymptomCheckScreen';
import NurseDepartmentsScreen from '../screens/nurse/NurseDepartmentsScreen';
import NurseDoctorListScreen from '../screens/nurse/NurseDoctorListScreen';
import NurseBookSlotScreen from '../screens/nurse/NurseBookSlotScreen';
import NursePaymentScreen from '../screens/nurse/NursePaymentScreen';
import NurseConfirmationScreen from '../screens/nurse/NurseConfirmationScreen';
import NurseAppointmentsScreen from '../screens/nurse/NurseAppointmentsScreen';

const Stack = createNativeStackNavigator();

export default function NurseNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NurseHome" component={NurseHomeScreen} />
      <Stack.Screen name="PatientVitals" component={PatientVitalsScreen} />
      <Stack.Screen name="NurseSymptomCheck" component={NurseSymptomCheckScreen} />
      <Stack.Screen name="NurseDepartments" component={NurseDepartmentsScreen} />
      <Stack.Screen name="NurseDoctorList" component={NurseDoctorListScreen} />
      <Stack.Screen name="NurseBookSlot" component={NurseBookSlotScreen} />
      <Stack.Screen name="NursePayment" component={NursePaymentScreen} />
      <Stack.Screen name="NurseConfirmation" component={NurseConfirmationScreen} />
      <Stack.Screen name="NurseAppointments" component={NurseAppointmentsScreen} />
    </Stack.Navigator>
  );
}
