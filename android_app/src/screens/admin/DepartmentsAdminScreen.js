import { useCallback, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import api from '../../utils/apiClient';

export default function DepartmentsAdminScreen({ navigation }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.get('/departments').then((res) => setDepartments(res.departments)).finally(() => setLoading(false));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleAdd = async () => {
    setError('');
    if (!name) {
      setError('Department name is required');
      return;
    }
    setSaving(true);
    try {
      await api.post('/departments', {
        name,
        description,
        symptomKeywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
      });
      setName('');
      setDescription('');
      setKeywords('');
      load();
    } catch (err) {
      setError(err.message || 'Unable to add department');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <ScreenHeader title="Departments" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="px-5">
          <Input label="Department Name" value={name} onChangeText={setName} placeholder="e.g. Neurology" />
          <Input label="Description" value={description} onChangeText={setDescription} />
          <Input label="Symptom Keywords (comma separated)" value={keywords} onChangeText={setKeywords} placeholder="e.g. migraine, seizure" />
          {error ? <Text className="mb-2 text-sm text-status-danger">{error}</Text> : null}
          <GradientButton title="Add Department" onPress={handleAdd} loading={saving} style={{ marginBottom: 16 }} />
        </View>
        <FlatList
          data={departments}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          refreshing={loading}
          onRefresh={load}
          renderItem={({ item }) => (
            <Card className="mb-3">
              <Text className="text-sm font-bold text-ink">{item.name}</Text>
              {item.description ? <Text className="text-xs text-ink-soft">{item.description}</Text> : null}
              {item.symptomKeywords?.length ? (
                <Text className="mt-1 text-xs text-ink-soft">Keywords: {item.symptomKeywords.join(', ')}</Text>
              ) : null}
            </Card>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
