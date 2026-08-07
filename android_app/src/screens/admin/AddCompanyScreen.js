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

export default function AddCompanyScreen({ navigation, route }) {
  const { colors } = useThemeColors();
  const editing = route?.params?.company || null;
  const isEditMode = !!editing;

  const [name, setName] = useState(editing?.name || '');
  const [code, setCode] = useState(editing?.code || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleAdd = async () => {
    setError('');
    if (!name) {
      setError('Company name is required');
      return;
    }
    setSaving(true);
    try {
      if (isEditMode) {
        const { company } = await api.patch(`/companies/${editing._id}`, { name, code });
        setSuccess(company);
      } else {
        const { company } = await api.post('/companies', { name, code });
        setSuccess(company);
      }
    } catch (err) {
      setError(err.message || `Unable to ${isEditMode ? 'update' : 'add'} company`);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSuccess(null);
    setName('');
    setCode('');
  };

  if (success) {
    return (
      <SafeAreaView className="flex-1 bg-surface-app">
        <ScreenHeader title={isEditMode ? 'Company Updated' : 'Company Added'} onBack={() => navigation.goBack()} />
        <View className="flex-1 px-6 pt-4">
          <Card className="items-center">
            <Ionicons name="checkmark-circle" size={40} color={colors.success} />
            <Text className="mt-2 text-lg font-bold text-ink">{success.name}</Text>
            {success.code ? <Text className="text-xs text-ink-soft">Code: {success.code}</Text> : null}
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
      <ScreenHeader title={isEditMode ? 'Edit Company' : 'Add Company'} onBack={() => navigation.goBack()} />
      <KeyboardAwareScrollView
        className="px-6 pt-2"
        keyboardShouldPersistTaps="handled"
        bottomOffset={40}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text className="mb-4 -mt-1 text-xs text-ink-soft">
          A patient whose employer matches a company here is automatically classified Non-Payment.
        </Text>
        <Input label="Company Name" value={name} onChangeText={setName} placeholder="e.g. Acme Industries" />
        <Input label="Code (optional)" value={code} onChangeText={setCode} placeholder="e.g. ACM001" />
        {error ? <Text className="mb-4 text-sm text-status-danger">{error}</Text> : null}
        <GradientButton
          title={isEditMode ? 'Save Changes' : 'Add Company'}
          onPress={handleAdd}
          loading={saving}
          style={{ marginBottom: 32 }}
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
