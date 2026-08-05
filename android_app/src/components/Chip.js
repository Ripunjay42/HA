import { Pressable, Text } from 'react-native';

export default function Chip({ label, selected, onPress, className = '' }) {
  return (
    <Pressable
      onPress={onPress}
      className={`mr-3 rounded-2xl border px-4 py-3 ${
        selected ? 'border-brand-teal bg-brand-teal' : 'border-line bg-surface'
      } ${className}`}
    >
      <Text className={`text-sm font-semibold ${selected ? 'text-white' : 'text-ink'}`}>{label}</Text>
    </Pressable>
  );
}
