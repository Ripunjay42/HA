import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PatientTabs from './PatientTabs';
import DepartmentsScreen from '../screens/patient/DepartmentsScreen';
import SymptomCheckScreen from '../screens/patient/SymptomCheckScreen';
import DoctorListScreen from '../screens/patient/DoctorListScreen';
import BookSlotScreen from '../screens/patient/BookSlotScreen';
import PaymentScreen from '../screens/patient/PaymentScreen';
import ConfirmationScreen from '../screens/patient/ConfirmationScreen';
import VitalsPendingScreen from '../screens/patient/VitalsPendingScreen';

const Stack = createNativeStackNavigator();

export default function PatientNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={PatientTabs} />
      <Stack.Screen name="Departments" component={DepartmentsScreen} />
      <Stack.Screen name="SymptomCheck" component={SymptomCheckScreen} />
      <Stack.Screen name="DoctorList" component={DoctorListScreen} />
      <Stack.Screen name="BookSlot" component={BookSlotScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
      <Stack.Screen name="VitalsPending" component={VitalsPendingScreen} />
    </Stack.Navigator>
  );
}
