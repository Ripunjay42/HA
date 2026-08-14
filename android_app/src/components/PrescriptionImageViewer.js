import { ActivityIndicator, Image, Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthedImage } from '../utils/useAuthedImage';

// Full-screen viewer for a saved prescription image, fetched from the
// authenticated /prescription/image endpoint the same way staff identity
// documents are viewed (manual fetch + data URI, since <Image> unreliably
// attaches auth headers on Android).
export default function PrescriptionImageViewer({ url, onClose }) {
  const { dataUri, error } = useAuthedImage(url);
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center' }}
        onPress={onClose}
      >
        {dataUri ? (
          <Image source={{ uri: dataUri }} style={{ width: '92%', height: '75%' }} resizeMode="contain" />
        ) : error ? (
          <View style={{ alignItems: 'center', paddingHorizontal: 32 }}>
            <Ionicons name="alert-circle-outline" size={48} color="#fff" />
            <Text style={{ color: '#fff', marginTop: 12 }}>Unable to load image</Text>
          </View>
        ) : (
          <ActivityIndicator size="large" color="#fff" />
        )}
        <Pressable onPress={onClose} hitSlop={12} style={{ position: 'absolute', top: 48, right: 20 }}>
          <Ionicons name="close-circle" size={32} color="#fff" />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
