import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import GradientButton from '../../components/GradientButton';
import api from '../../utils/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';

const METHODS = [
  { key: 'upi', label: 'UPI', icon: 'phone-portrait-outline' },
  { key: 'card', label: 'Card', icon: 'card-outline' },
  { key: 'netbanking', label: 'Net Banking', icon: 'business-outline' },
  { key: 'wallet', label: 'Wallet', icon: 'wallet-outline' },
];

export default function PaymentScreen({ navigation, route }) {
  const { appointmentId, amount } = route.params;
  const { colors } = useThemeColors();
  const [method, setMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post(`/appointments/${appointmentId}/pay`, {
        paymentMethod: method,
        transactionId: `TXN${Date.now()}`,
      });
      navigation.replace('Confirmation', { appointmentId });
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader title="Payment" onBack={() => navigation.goBack()} />
      <View className="flex-1 px-5">
        <Text className="mb-3 text-base font-bold text-ink">Select Payment Method</Text>
        {METHODS.map((m) => (
          <Pressable
            key={m.key}
            onPress={() => setMethod(m.key)}
            className={`mb-3 flex-row items-center rounded-2xl border p-4 ${
              method === m.key ? 'border-brand-teal bg-surface' : 'border-line bg-surface'
            }`}
          >
            <Ionicons name={m.icon} size={20} color={method === m.key ? colors.teal : colors.inkSoft} />
            <Text className="ml-3 flex-1 text-sm font-semibold text-ink">{m.label}</Text>
            <View
              className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                method === m.key ? 'border-brand-teal' : 'border-line'
              }`}
            >
              {method === m.key && <View className="h-2.5 w-2.5 rounded-full bg-brand-teal" />}
            </View>
          </Pressable>
        ))}

        {error ? <Text className="mt-2 text-sm text-status-danger">{error}</Text> : null}
      </View>

      <View className="border-t border-line bg-surface px-5 pb-6 pt-4">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-sm text-ink-soft">Total Amount</Text>
          <Text className="text-lg font-extrabold text-ink">₹{amount}.00</Text>
        </View>
        <GradientButton title="Confirm & Pay" onPress={handlePay} loading={loading} />
      </View>
    </SafeAreaView>
  );
}
