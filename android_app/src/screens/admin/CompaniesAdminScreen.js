import { useCallback, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import api from '../../utils/apiClient';

export default function CompaniesAdminScreen({ navigation }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.get('/companies').then((res) => setCompanies(res.companies)).finally(() => setLoading(false));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleAdd = async () => {
    setError('');
    if (!name) {
      setError('Company name is required');
      return;
    }
    setSaving(true);
    try {
      await api.post('/companies', { name, code });
      setName('');
      setCode('');
      load();
    } catch (err) {
      setError(err.message || 'Unable to add company');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader title="Companies" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="px-5">
          <Text className="mb-4 -mt-1 text-xs text-ink-soft">
            A patient whose employer matches a company here is automatically classified Non-Payment.
          </Text>
          <Input label="Company Name" value={name} onChangeText={setName} placeholder="e.g. Acme Industries" />
          <Input label="Code (optional)" value={code} onChangeText={setCode} placeholder="e.g. ACM001" />
          {error ? <Text className="mb-2 text-sm text-status-danger">{error}</Text> : null}
          <GradientButton title="Add Company" onPress={handleAdd} loading={saving} style={{ marginBottom: 16 }} />
        </View>
        <FlatList
          data={companies}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          refreshing={loading}
          onRefresh={load}
          renderItem={({ item }) => (
            <Card className="mb-3 flex-row items-center justify-between">
              <Text className="text-sm font-bold text-ink">{item.name}</Text>
              <Text className="text-xs text-ink-soft">{item.code}</Text>
            </Card>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
