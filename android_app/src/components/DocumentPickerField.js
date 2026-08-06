import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { fileToBase64 } from '../utils/fileToBase64';

const DOC_TYPES = [
  { id: 'aadhaar', label: 'Aadhaar' },
  { id: 'pan', label: 'PAN' },
  { id: 'employment_other', label: 'Other' },
];

// Lets the admin attach one identity document per type (Aadhaar/PAN/Other)
// during staff onboarding. Picked files are held in `value` as
// { type, fileName, contentType, base64 } until the parent uploads them.
export default function DocumentPickerField({ value = [], onChange }) {
  const { colors } = useThemeColors();
  const [pickingType, setPickingType] = useState(null);

  const pick = async (docType) => {
    setPickingType(docType);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      const base64 = await fileToBase64(asset.uri);
      const next = value.filter((d) => d.type !== docType);
      next.push({
        type: docType,
        fileName: asset.name,
        contentType: asset.mimeType || 'application/octet-stream',
        base64,
      });
      onChange(next);
    } finally {
      setPickingType(null);
    }
  };

  const remove = (docType) => onChange(value.filter((d) => d.type !== docType));

  return (
    <View className="mb-4">
      <Text style={{ marginBottom: 8, fontSize: 14, fontWeight: '500', color: colors.inkSoft }}>
        Identity Documents (optional)
      </Text>
      {DOC_TYPES.map((docType) => {
        const picked = value.find((d) => d.type === docType.id);
        return (
          <Pressable
            key={docType.id}
            onPress={() => pick(docType.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              height: 52,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.line,
              backgroundColor: colors.surface,
              paddingHorizontal: 14,
              marginBottom: 8,
            }}
          >
            <Ionicons
              name={picked ? 'checkmark-circle' : 'document-attach-outline'}
              size={18}
              color={picked ? colors.success : colors.inkFaint}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.ink }}>{docType.label}</Text>
              <Text numberOfLines={1} style={{ fontSize: 11, color: colors.inkSoft }}>
                {pickingType === docType.id
                  ? 'Reading file...'
                  : picked
                    ? picked.fileName
                    : 'Tap to upload PDF, JPG, or PNG'}
              </Text>
            </View>
            {picked && (
              <Pressable onPress={() => remove(docType.id)} hitSlop={8}>
                <Ionicons name="close-circle" size={20} color={colors.inkFaint} />
              </Pressable>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
