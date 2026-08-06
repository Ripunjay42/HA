import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';

const toDate = (hhmm) => {
  const date = new Date();
  const [hours, minutes] = (hhmm || '09:00').split(':').map(Number);
  date.setHours(Number.isFinite(hours) ? hours : 9, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  return date;
};

const toHHMM = (date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

// A tappable field that opens the native Android time picker dialog and
// reports the chosen time back as an "HH:mm" string.
export default function TimeFieldInput({ label, value, onChange, containerClassName = '' }) {
  const { colors } = useThemeColors();
  const [open, setOpen] = useState(false);

  const handleChange = (event, selectedDate) => {
    setOpen(false);
    if (event.type === 'set' && selectedDate) {
      onChange(toHHMM(selectedDate));
    }
  };

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label ? <Text style={{ marginBottom: 8, fontSize: 14, fontWeight: '500', color: colors.inkSoft }}>{label}</Text> : null}
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          height: 56,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.line,
          backgroundColor: colors.surface,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: 16, fontFamily: 'Ubuntu_400Regular', color: value ? colors.ink : colors.inkFaint }}>
          {value || 'Select time'}
        </Text>
        <Ionicons name="time-outline" size={18} color={colors.inkFaint} />
      </Pressable>
      {open && (
        <DateTimePicker
          value={toDate(value)}
          mode="time"
          is24Hour
          display="clock"
          onChange={handleChange}
        />
      )}
    </View>
  );
}
