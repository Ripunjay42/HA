import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';

// A tappable field that expands an inline searchable dropdown directly
// below it (e.g. existing patients, staff, or companies) so the user can
// search and tap to fill the field instead of having to remember/retype an
// exact value.
export default function PickerInput({
  label, placeholder, value, onChangeText, options = [], onSelect, icon = 'search-outline', clearable = false,
}) {
  const { colors } = useThemeColors();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.id.toLowerCase().includes(q) || o.label.toLowerCase().includes(q));
  }, [query, options]);

  const toggleOpen = () => {
    setQuery('');
    setOpen((v) => !v);
  };

  const handleSelect = (option) => {
    onSelect(option);
    setOpen(false);
  };

  return (
    <View className="mb-4">
      {label ? <Text style={{ marginBottom: 8, fontSize: 14, fontWeight: '500', color: colors.inkSoft }}>{label}</Text> : null}
      <Pressable
        onPress={toggleOpen}
        style={{
          height: 56,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: open ? colors.teal : colors.line,
          borderBottomLeftRadius: open ? 0 : 16,
          borderBottomRightRadius: open ? 0 : 16,
          backgroundColor: colors.surface,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Ionicons name={icon} size={18} color={colors.inkFaint} />
        <Text
          numberOfLines={1}
          style={{
            marginLeft: 12,
            flex: 1,
            fontSize: 16,
            fontFamily: 'Ubuntu_400Regular',
            color: value ? colors.ink : colors.inkFaint,
          }}
        >
          {value || placeholder || 'Tap to select'}
        </Text>
        {clearable && value ? (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onChangeText('');
            }}
            hitSlop={8}
            style={{ marginRight: 4 }}
          >
            <Ionicons name="close-circle" size={18} color={colors.inkFaint} />
          </Pressable>
        ) : null}
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.inkFaint} />
      </Pressable>

      {open && (
        <View
          style={{
            borderWidth: 1,
            borderTopWidth: 0,
            borderColor: colors.teal,
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
            backgroundColor: colors.surface,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              height: 44,
              backgroundColor: colors.surfaceMuted,
              marginHorizontal: 10,
              marginTop: 10,
              marginBottom: 4,
              borderRadius: 12,
              paddingHorizontal: 12,
            }}
          >
            <Ionicons name="search-outline" size={16} color={colors.inkFaint} />
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder="Search..."
              placeholderTextColor={colors.inkFaint}
              style={{ marginLeft: 8, flex: 1, fontSize: 14, color: colors.ink, fontFamily: 'Ubuntu_400Regular' }}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close" size={16} color={colors.inkFaint} />
              </Pressable>
            )}
          </View>

          <ScrollView
            style={{ maxHeight: 220 }}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {matches.length === 0 ? (
              <Text style={{ textAlign: 'center', paddingVertical: 20, fontSize: 13, color: colors.inkFaint }}>
                No matches found
              </Text>
            ) : (
              matches.map((option, index) => (
                <Pressable
                  key={option.id}
                  onPress={() => handleSelect(option)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderTopWidth: index > 0 ? 1 : 0,
                    borderTopColor: colors.line,
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: colors.surfaceMuted,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 10,
                    }}
                  >
                    <Ionicons name={icon} size={14} color={colors.teal} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.ink }}>{option.id}</Text>
                    <Text style={{ fontSize: 11, color: colors.inkSoft }}>{option.label}</Text>
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
