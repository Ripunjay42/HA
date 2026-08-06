import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';

export default function Input({ label, containerClassName = '', style, secureTextEntry, onFocus, onBlur, ...props }) {
  const { colors } = useThemeColors();
  const [reveal, setReveal] = useState(false);
  const isPasswordField = !!secureTextEntry;

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label ? <Text style={{ marginBottom: 8, fontSize: 14, fontWeight: '500', color: colors.inkSoft }}>{label}</Text> : null}
      <View style={{ justifyContent: 'center' }}>
        <TextInput
          placeholderTextColor={colors.inkFaint}
          secureTextEntry={isPasswordField && !reveal}
          onFocus={onFocus}
          onBlur={onBlur}
          style={[
            {
              height: 56,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.line,
              backgroundColor: colors.surface,
              paddingHorizontal: 16,
              paddingRight: isPasswordField ? 48 : 16,
              fontSize: 16,
              color: colors.ink,
              fontFamily: 'Ubuntu_400Regular',
            },
            style,
          ]}
          {...props}
        />
        {isPasswordField && (
          <Pressable
            onPress={() => setReveal((v) => !v)}
            style={{ position: 'absolute', right: 14, height: 56, justifyContent: 'center' }}
            hitSlop={8}
          >
            <Ionicons name={reveal ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.inkSoft} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
