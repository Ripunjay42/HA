import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Input from './Input';
import { useThemeColors } from '../hooks/useThemeColors';

// A plain text Input that also shows a filtered dropdown of known options
// (e.g. existing patients or staff) so the user can tap to fill the field
// instead of having to remember/retype an exact MR No or Staff ID.
export default function PickerInput({
  label, placeholder, value, onChangeText, options = [], onSelect, autoCapitalize = 'characters',
}) {
  const { colors } = useThemeColors();
  const matches = useMemo(() => {
    if (!value) return [];
    const query = value.toLowerCase();
    const exactMatch = options.some((o) => o.id.toLowerCase() === query);
    if (exactMatch) return [];
    return options
      .filter((o) => o.id.toLowerCase().includes(query) || o.label.toLowerCase().includes(query))
      .slice(0, 5);
  }, [value, options]);

  return (
    <View className="mb-4">
      <Input
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        autoCapitalize={autoCapitalize}
        containerClassName="mb-0"
      />
      {matches.length > 0 && (
        <View className="mt-1 overflow-hidden rounded-2xl border border-line bg-surface">
          {matches.map((option, index) => (
            <Pressable
              key={option.id}
              onPress={() => onSelect(option)}
              className={`px-4 py-3 ${index > 0 ? 'border-t border-line' : ''}`}
            >
              <Text className="text-sm font-semibold text-ink">{option.id}</Text>
              <Text className="text-xs text-ink-soft">{option.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {options.length === 0 && value.length === 0 && (
        <Text className="mt-1 text-xs text-ink-faint" style={{ color: colors.inkFaint }}>
          Start typing to see suggestions
        </Text>
      )}
    </View>
  );
}
