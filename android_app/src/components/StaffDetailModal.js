import { useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { API_BASE_URL } from '../constants/config';
import { useAuthedImage } from '../utils/useAuthedImage';

// Small thumbnail that fetches an authenticated document as a data URI
// (see useAuthedImage) instead of relying on <Image>'s unreliable headers
// support, which can silently render blank on Android.
function DocumentThumb({ doc, url, onPress, colors }) {
  const isImage = doc.contentType?.startsWith('image/');
  const { dataUri, error } = useAuthedImage(isImage ? url : null);

  return (
    <Pressable onPress={onPress} style={{ width: 92 }}>
      {isImage ? (
        <View
          style={{
            width: 92, height: 92, borderRadius: 12,
            backgroundColor: colors.surfaceMuted,
            alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          }}
        >
          {dataUri ? (
            <Image source={{ uri: dataUri }} style={{ width: 92, height: 92 }} resizeMode="cover" />
          ) : error ? (
            <Ionicons name="alert-circle-outline" size={24} color={colors.inkFaint} />
          ) : (
            <ActivityIndicator size="small" color={colors.teal} />
          )}
        </View>
      ) : (
        <View
          style={{
            width: 92, height: 92, borderRadius: 12,
            backgroundColor: colors.surfaceMuted,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Ionicons name="document-text-outline" size={28} color={colors.teal} />
        </View>
      )}
      <Text numberOfLines={1} style={{ fontSize: 10, color: colors.inkSoft, marginTop: 4, textAlign: 'center' }}>
        {DOC_LABEL[doc.type] || doc.fileName}
      </Text>
    </Pressable>
  );
}

// Full-screen in-app viewer for a single document. The document endpoint is
// authenticated, so it must always be fetched with the Authorization header
// attached manually -- never Linking.openURL, which opens the system browser
// with no way to attach auth and just shows a blank/black page.
function DocumentViewer({ doc, url, onClose }) {
  const isImage = doc.contentType?.startsWith('image/');
  const { dataUri, error } = useAuthedImage(isImage ? url : null);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center' }}
        onPress={onClose}
      >
        {isImage ? (
          dataUri ? (
            <Image
              source={{ uri: dataUri }}
              style={{ width: '92%', height: '75%' }}
              resizeMode="contain"
            />
          ) : error ? (
            <View style={{ alignItems: 'center', paddingHorizontal: 32 }}>
              <Ionicons name="alert-circle-outline" size={48} color="#fff" />
              <Text style={{ color: '#fff', marginTop: 12 }}>Unable to load image</Text>
            </View>
          ) : (
            <ActivityIndicator size="large" color="#fff" />
          )
        ) : (
          <View style={{ alignItems: 'center', paddingHorizontal: 32 }}>
            <Ionicons name="document-text-outline" size={64} color="#fff" />
            <Text style={{ color: '#fff', marginTop: 12, textAlign: 'center' }}>{doc.fileName}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', marginTop: 4, fontSize: 12 }}>
              Preview not available for this file type
            </Text>
          </View>
        )}
        <Pressable
          onPress={onClose}
          hitSlop={12}
          style={{ position: 'absolute', top: 48, right: 20 }}
        >
          <Ionicons name="close-circle" size={32} color="#fff" />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const ROLE_ICON = { doctor: 'medkit', nurse: 'heart', receptionist: 'people' };
const DOC_LABEL = { aadhaar: 'Aadhaar', pan: 'PAN', employment_other: 'Other Document' };

const Row = ({ icon, label, value, colors }) => {
  if (!value) return null;
  return (
    <View className="mb-3 flex-row items-start">
      <Ionicons name={icon} size={16} color={colors.inkFaint} style={{ marginTop: 2 }} />
      <View className="ml-3 flex-1">
        <Text style={{ fontSize: 11, color: colors.inkSoft }}>{label}</Text>
        <Text style={{ fontSize: 14, color: colors.ink, fontWeight: '600' }}>{value}</Text>
      </View>
    </View>
  );
};

export default function StaffDetailModal({ visible, staff, role, onClose, onEdit }) {
  const { colors, isDark } = useThemeColors();
  const [viewingDoc, setViewingDoc] = useState(null);
  if (!staff) return null;

  const documentUrl = (doc) => `${API_BASE_URL}/admin/staff/${role}/${staff._id}/documents/${doc._id}`;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }} onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            maxHeight: '85%',
            borderRadius: 24,
            backgroundColor: colors.surface,
            padding: 20,
            shadowColor: '#000000',
            shadowOpacity: isDark ? 0.4 : 0.2,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 10 },
            elevation: 10,
          }}
        >
          <View className="mb-4 flex-row items-start justify-between">
            <View className="flex-1 flex-row items-center">
              <View className="mr-3 h-14 w-14 items-center justify-center rounded-full bg-surface-muted">
                <Ionicons name={ROLE_ICON[role]} size={24} color={colors.ink} />
              </View>
              <View className="flex-1">
                <Text style={{ fontSize: 18, fontWeight: '800', color: colors.ink }}>{staff.name}</Text>
                <View
                  className={`mt-1 self-start rounded-full px-2 py-0.5 ${staff.status === 'active' ? 'bg-status-success/10' : 'bg-status-danger/10'}`}
                >
                  <Text
                    className={`text-xs font-semibold ${staff.status === 'active' ? 'text-status-success' : 'text-status-danger'}`}
                  >
                    {staff.status}
                  </Text>
                </View>
              </View>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close-circle" size={26} color={colors.inkFaint} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Row icon="mail-outline" label="Email" value={staff.email} colors={colors} />
            <Row icon="call-outline" label="Phone" value={staff.phone} colors={colors} />
            <Row icon="pricetag-outline" label="Staff ID" value={staff.staffId} colors={colors} />

            {role === 'doctor' && (
              <>
                <Row icon="git-branch-outline" label="Department" value={staff.departmentId?.name} colors={colors} />
                <Row icon="ribbon-outline" label="Specialization" value={staff.specialization} colors={colors} />
                <Row icon="school-outline" label="Qualifications" value={staff.qualifications} colors={colors} />
                <Row icon="time-outline" label="Experience" value={staff.experienceYears ? `${staff.experienceYears} years` : null} colors={colors} />
                <Row icon="cash-outline" label="Consultation Fee" value={staff.consultationFee ? `₹${staff.consultationFee}` : null} colors={colors} />
              </>
            )}
            {role === 'nurse' && (
              <>
                <Row icon="bed-outline" label="Ward" value={staff.ward} colors={colors} />
                <Row icon="moon-outline" label="Shift" value={staff.shift} colors={colors} />
              </>
            )}

            {staff.availability?.length > 0 && (
              <View className="mb-3">
                <View className="mb-2 flex-row items-center">
                  <Ionicons name="calendar-outline" size={16} color={colors.inkFaint} />
                  <Text style={{ fontSize: 11, color: colors.inkSoft, marginLeft: 12 }}>Availability</Text>
                </View>
                {staff.availability.map((a) => (
                  <View key={a.day} className="mb-2 flex-row items-start">
                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.ink, width: 40, marginTop: 6 }}>
                      {a.day}
                    </Text>
                    <View className="flex-1 flex-row flex-wrap" style={{ gap: 6 }}>
                      {a.slots.map((s, i) => (
                        <View
                          key={`${a.day}-${i}`}
                          className="rounded-full bg-brand-teal/10 px-3 py-1"
                        >
                          <Text style={{ fontSize: 11, fontWeight: '600', color: colors.teal }}>
                            {s.startTime} - {s.endTime}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {staff.documents?.length > 0 && (
              <View className="mt-2">
                <Text style={{ fontSize: 11, color: colors.inkSoft, marginBottom: 8 }}>Identity Documents</Text>
                <View className="flex-row flex-wrap" style={{ gap: 10 }}>
                  {staff.documents.map((doc) => (
                    <DocumentThumb
                      key={doc._id}
                      doc={doc}
                      url={documentUrl(doc)}
                      onPress={() => setViewingDoc(doc)}
                      colors={colors}
                    />
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <Pressable
            onPress={onEdit}
            style={{
              marginTop: 16,
              height: 48,
              borderRadius: 14,
              backgroundColor: colors.teal,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
            }}
          >
            <Ionicons name="create-outline" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '700', marginLeft: 8 }}>Edit Staff Member</Text>
          </Pressable>
        </Pressable>
      </Pressable>

      {viewingDoc && (
        <DocumentViewer doc={viewingDoc} url={documentUrl(viewingDoc)} onClose={() => setViewingDoc(null)} />
      )}
    </Modal>
  );
}
