import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import {
  User, Settings, Bell, Shield, HelpCircle,
  LogOut, ChevronRight, Home, Heart, Calendar, Users
} from 'lucide-react-native';
import { useAuthStore } from '../../store/auth';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Esci',
      'Sei sicuro di voler uscire?',
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Esci', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          }
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <View style={styles.loginPrompt}>
          <View style={styles.avatarPlaceholder}>
            <User size={48} color="#9ca3af" />
          </View>
          <Text style={styles.loginTitle}>Accedi a rooMate</Text>
          <Text style={styles.loginSubtitle}>
            Salva le tue ricerche, contatta i proprietari e gestisci le tue prenotazioni.
          </Text>
          <Link href="/auth/login" asChild>
            <Pressable style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Accedi</Text>
            </Pressable>
          </Link>
          <Link href="/auth/register" asChild>
            <Text style={styles.registerLink}>
              Non hai un account? Registrati
            </Text>
          </Link>
        </View>

        <View style={styles.menuSection}>
          <MenuItem icon={HelpCircle} label="Centro assistenza" />
          <MenuItem icon={Shield} label="Privacy e sicurezza" />
          <MenuItem icon={Settings} label="Impostazioni" />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          {user.avatarUrl ? (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <View style={styles.roleTag}>
            <Text style={styles.roleText}>
              {user.role === 'LANDLORD' ? 'Proprietario' : 'Inquilino'}
            </Text>
          </View>
        </View>
        <Pressable>
          <Settings size={24} color="#6b7280" />
        </Pressable>
      </View>

      {/* User Actions */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Il mio account</Text>
        <MenuItem icon={User} label="Modifica profilo" />
        {user.role === 'LANDLORD' && (
          <MenuItem icon={Home} label="I miei annunci" onPress={() => router.push('/my-listings')} />
        )}
        {user.role === 'TENANT' && (
          <MenuItem icon={Heart} label="I miei interessi" onPress={() => router.push('/my-interests')} />
        )}
        {user.role === 'TENANT' && (
          <MenuItem icon={Users} label="I miei gruppi" onPress={() => router.push('/groups')} />
        )}
        <MenuItem icon={Calendar} label="Le mie prenotazioni" onPress={() => router.push('/my-bookings')} />
        <MenuItem icon={Bell} label="Notifiche" />
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Supporto</Text>
        <MenuItem icon={HelpCircle} label="Centro assistenza" />
        <MenuItem icon={Shield} label="Privacy e sicurezza" />
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Esci</Text>
      </Pressable>
    </ScrollView>
  );
}

function MenuItem({ 
  icon: Icon, 
  label, 
  onPress 
}: { 
  icon: any; 
  label: string; 
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <Icon size={20} color="#6b7280" />
      <Text style={styles.menuItemLabel}>{label}</Text>
      <ChevronRight size={20} color="#d1d5db" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginPrompt: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    backgroundColor: '#e0f2fe',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '600',
    color: '#0ea5e9',
  },
  avatarContainer: {
    marginBottom: 0,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerLink: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '500',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  roleTag: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0ea5e9',
  },
  menuSection: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    paddingVertical: 8,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 20,
    marginTop: 16,
    marginBottom: 32,
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '500',
  },
});
