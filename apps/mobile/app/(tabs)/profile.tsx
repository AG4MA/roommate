import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { 
  User, Settings, Bell, Shield, HelpCircle, 
  LogOut, ChevronRight, Home 
} from 'lucide-react-native';

export default function ProfileScreen() {
  // In produzione, verificare se l'utente è loggato
  const isLoggedIn = false;

  if (!isLoggedIn) {
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
        <View style={styles.avatarPlaceholder}>
          <User size={32} color="#0ea5e9" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Mario Rossi</Text>
          <Text style={styles.profileEmail}>mario.rossi@email.com</Text>
        </View>
        <Pressable>
          <Settings size={24} color="#6b7280" />
        </Pressable>
      </View>

      {/* Menu Sections */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Il mio account</Text>
        <MenuItem icon={User} label="Modifica profilo" />
        <MenuItem icon={Home} label="I miei annunci" />
        <MenuItem icon={Bell} label="Notifiche" />
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Supporto</Text>
        <MenuItem icon={HelpCircle} label="Centro assistenza" />
        <MenuItem icon={Shield} label="Privacy e sicurezza" />
      </View>

      <Pressable style={styles.logoutButton}>
        <LogOut size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Esci</Text>
      </Pressable>
    </ScrollView>
  );
}

function MenuItem({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <Pressable style={styles.menuItem}>
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
  loginPrompt: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    backgroundColor: '#f3f4f6',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '500',
  },
});
