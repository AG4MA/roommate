import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Users, ArrowLeft } from 'lucide-react-native';
import { useCreateGroup } from '../../hooks/useApi';

export default function CreateGroupScreen() {
  const router = useRouter();
  const createMutation = useCreateGroup();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState(4);

  async function handleSubmit() {
    const result = await createMutation.mutateAsync({
      name: name.trim() || undefined,
      description: description.trim() || undefined,
      maxMembers,
    });

    if (result.success && result.data) {
      router.replace(`/groups/${result.data.id}`);
    }
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#6b7280" />
        </Pressable>
        <Text style={styles.headerTitle}>Crea un gruppo</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.iconContainer}>
          <Users size={32} color="#0ea5e9" />
        </View>
        <Text style={styles.subtitle}>
          Forma il tuo gruppo di coinquilini per cercare casa insieme
        </Text>

        {createMutation.error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Errore nella creazione del gruppo</Text>
          </View>
        )}

        <Text style={styles.label}>Nome del gruppo (opzionale)</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="es. Amici del Poli"
          maxLength={50}
        />

        <Text style={styles.label}>Descrizione (opzionale)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Descrivi cosa state cercando..."
          maxLength={300}
          multiline
          numberOfLines={3}
        />
        <Text style={styles.charCount}>{description.length}/300</Text>

        <Text style={styles.label}>Numero massimo di membri</Text>
        <View style={styles.memberPicker}>
          {[2, 3, 4, 5, 6, 7, 8].map((n) => (
            <Pressable
              key={n}
              style={[styles.memberOption, maxMembers === n && styles.memberOptionActive]}
              onPress={() => setMaxMembers(n)}
            >
              <Text style={[styles.memberOptionText, maxMembers === n && styles.memberOptionTextActive]}>
                {n}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.submitBtn, createMutation.isPending && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Users size={20} color="#ffffff" />
              <Text style={styles.submitBtnText}>Crea gruppo</Text>
            </>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  form: { padding: 20 },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#e0f2fe',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: { color: '#dc2626', fontSize: 14 },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  charCount: { fontSize: 12, color: '#9ca3af', textAlign: 'right', marginTop: 4 },
  memberPicker: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  memberOption: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberOptionActive: {
    backgroundColor: '#0ea5e9',
  },
  memberOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4b5563',
  },
  memberOptionTextActive: {
    color: '#ffffff',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 32,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});
