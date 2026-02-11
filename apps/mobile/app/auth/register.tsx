import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { User, Mail, Lock, Eye, EyeOff, Home, Users } from 'lucide-react-native';
import { useAuthStore } from '../../store/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'TENANT' | 'LANDLORD'>('TENANT');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleRegister = async () => {
    setValidationError(null);
    clearError();

    if (!name || !email || !password || !confirmPassword) {
      setValidationError('Compila tutti i campi');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Le password non corrispondono');
      return;
    }

    if (password.length < 6) {
      setValidationError('La password deve essere di almeno 6 caratteri');
      return;
    }

    const success = await register({ name, email, password, role });
    
    if (success) {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Crea il tuo account</Text>
          <Text style={styles.subtitle}>
            Unisciti a rooMate per trovare la stanza perfetta o gestire i tuoi annunci
          </Text>
        </View>

        {(error || validationError) && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error || validationError}</Text>
          </View>
        )}

        {/* Role Selection */}
        <View style={styles.roleSection}>
          <Text style={styles.roleLabel}>Sono un:</Text>
          <View style={styles.roleButtons}>
            <Pressable 
              style={[styles.roleButton, role === 'TENANT' && styles.roleButtonActive]}
              onPress={() => setRole('TENANT')}
            >
              <Users size={24} color={role === 'TENANT' ? '#0ea5e9' : '#6b7280'} />
              <Text style={[styles.roleButtonText, role === 'TENANT' && styles.roleButtonTextActive]}>
                Inquilino
              </Text>
              <Text style={styles.roleDescription}>Cerco una stanza</Text>
            </Pressable>
            <Pressable 
              style={[styles.roleButton, role === 'LANDLORD' && styles.roleButtonActive]}
              onPress={() => setRole('LANDLORD')}
            >
              <Home size={24} color={role === 'LANDLORD' ? '#0ea5e9' : '#6b7280'} />
              <Text style={[styles.roleButtonText, role === 'LANDLORD' && styles.roleButtonTextActive]}>
                Proprietario
              </Text>
              <Text style={styles.roleDescription}>Affitto stanze</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <User size={20} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Mail size={20} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={20} color="#9ca3af" />
              ) : (
                <Eye size={20} color="#9ca3af" />
              )}
            </Pressable>
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="Conferma password"
              placeholderTextColor="#9ca3af"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
          </View>

          <Pressable 
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.registerButtonText}>Registrati</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Hai già un account?</Text>
          <Link href="/auth/login" asChild>
            <Pressable>
              <Text style={styles.loginLink}>Accedi</Text>
            </Pressable>
          </Link>
        </View>

        <Text style={styles.terms}>
          Registrandoti accetti i nostri Termini di servizio e la Privacy Policy
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  roleSection: {
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleButtonActive: {
    borderColor: '#0ea5e9',
    backgroundColor: '#f0f9ff',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 8,
  },
  roleButtonTextActive: {
    color: '#0ea5e9',
  },
  roleDescription: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  registerButton: {
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 14,
  },
  loginLink: {
    color: '#0ea5e9',
    fontSize: 14,
    fontWeight: '600',
  },
  terms: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
});
