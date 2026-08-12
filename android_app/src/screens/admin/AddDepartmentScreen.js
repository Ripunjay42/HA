import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Input from '../../components/Input';
import Card from '../../components/Card';
import GradientButton from '../../components/GradientButton';
import api from '../../utils/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';
import { filterAlpha } from '../../utils/validation';

export default function AddDepartmentScreen({ navigation, route }) {
  const { colors } = useThemeColors();
  const editing = route?.params?.department || null;
  const isEditMode = !!editing;

  const [name, setName] = useState(editing?.name || '');
  const [description, setDescription] = useState(editing?.description || '');
  const [keywords, setKeywords] = useState(editing?.symptomKeywords?.join(', ') || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleAdd = async () => {
    setError('');
    if (!name) {
      setError('Department name is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name,
        description,
        symptomKeywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
      };
      if (isEditMode) {
        const { department } = await api.patch(`/departments/${editing._id}`, payload);
        setSuccess(department);
      } else {
        const { department } = await api.post('/departments', payload);
        setSuccess(department);
      }
    } catch (err) {
      setError(err.message || `Unable to ${isEditMode ? 'update' : 'add'} department`);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSuccess(null);
    setName('');
    setDescription('');
    setKeywords('');
  };

  if (success) {
    return (
      <SafeAreaView className="flex-1 bg-surface-app">
        <ScreenHeader title={isEditMode ? 'Department Updated' : 'Department Added'} onBack={() => navigation.goBack()} />
        <View className="flex-1 px-6 pt-4">
          <Card className="items-center">
            <Ionicons name="checkmark-circle" size={40} color={colors.success} />
            <Text className="mt-2 text-lg font-bold text-ink">{success.name}</Text>
            {success.description ? <Text className="text-xs text-ink-soft">{success.description}</Text> : null}
          </Card>
          {!isEditMode && (
            <GradientButton title="Add Another" onPress={resetForm} style={{ marginTop: 24 }} />
          )}
          <GradientButton
            title="Done"
            variant={isEditMode ? 'solid' : 'outline'}
            onPress={() => navigation.goBack()}
            style={{ marginTop: isEditMode ? 24 : 12 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader title={isEditMode ? 'Edit Department' : 'Add Department'} onBack={() => navigation.goBack()} />
      <KeyboardAwareScrollView
        className="px-6 pt-2"
        keyboardShouldPersistTaps="handled"
        bottomOffset={40}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Input
          label="Department Name"
          value={name}
          onChangeText={(v) => setName(filterAlpha(v))}
          placeholder="e.g. Neurology"
        />
        <Input label="Description" value={description} onChangeText={setDescription} />
        <Input label="Symptom Keywords (comma separated)" value={keywords} onChangeText={setKeywords} placeholder="e.g. migraine, seizure" />
        {error ? <Text className="mb-4 text-sm text-status-danger">{error}</Text> : null}
        <GradientButton
          title={isEditMode ? 'Save Changes' : 'Add Department'}
          onPress={handleAdd}
          loading={saving}
          style={{ marginBottom: 32 }}
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
