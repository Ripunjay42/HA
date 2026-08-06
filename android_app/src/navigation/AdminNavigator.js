import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import StaffListScreen from '../screens/admin/StaffListScreen';
import AddStaffScreen from '../screens/admin/AddStaffScreen';
import DepartmentsAdminScreen from '../screens/admin/DepartmentsAdminScreen';
import AddDepartmentScreen from '../screens/admin/AddDepartmentScreen';
import CompaniesAdminScreen from '../screens/admin/CompaniesAdminScreen';
import AddCompanyScreen from '../screens/admin/AddCompanyScreen';
import PatientListScreen from '../screens/admin/PatientListScreen';
import PatientDetailScreen from '../screens/admin/PatientDetailScreen';

const Stack = createNativeStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
      <Stack.Screen name="StaffList" component={StaffListScreen} />
      <Stack.Screen name="AddStaff" component={AddStaffScreen} />
      <Stack.Screen name="AdminDepartments" component={DepartmentsAdminScreen} />
      <Stack.Screen name="AddDepartment" component={AddDepartmentScreen} />
      <Stack.Screen name="AdminCompanies" component={CompaniesAdminScreen} />
      <Stack.Screen name="AddCompany" component={AddCompanyScreen} />
      <Stack.Screen name="PatientList" component={PatientListScreen} />
      <Stack.Screen name="PatientDetail" component={PatientDetailScreen} />
    </Stack.Navigator>
  );
}
