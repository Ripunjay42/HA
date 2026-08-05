import { Text, View } from 'react-native';

const LABELS = {
  registered: 'Registered',
  nurse_assigned: 'Nurse Assigned',
  vitals_recorded: 'Vitals Recorded',
  token_generated: 'Token Generated',
  pending_doctor: 'Choose Doctor',
  pending_slot: 'Choose Slot',
  pending_payment: 'Payment Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

export default function StatusBadge({ status, color }) {
  return (
    <View className="flex-row items-center rounded-full px-3 py-1" style={{ backgroundColor: `${color}1A` }}>
      <View className="mr-2 h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <Text className="text-xs font-semibold" style={{ color }}>
        {LABELS[status] || status}
      </Text>
    </View>
  );
}
