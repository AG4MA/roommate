import { View, Text, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { Link } from 'expo-router';
import { MapPin, Search, Calendar, Shield, ChevronRight } from 'lucide-react-native';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Trova la tua stanza ideale</Text>
        <Text style={styles.heroSubtitle}>
          Un solo portale per cercare, visitare e affittare la tua prossima stanza.
        </Text>

        {/* Quick Search */}
        <View style={styles.searchBox}>
          <View style={styles.searchInputContainer}>
            <MapPin size={20} color="#9ca3af" />
            <TextInput
              placeholder="Dove vuoi cercare?"
              style={styles.searchInput}
              placeholderTextColor="#9ca3af"
            />
          </View>
          <Link href="/search" asChild>
            <Pressable style={styles.searchButton}>
              <Search size={20} color="#ffffff" />
              <Text style={styles.searchButtonText}>Cerca</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Perché rooMate?</Text>
        
        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Search size={24} color="#0ea5e9" />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Un Solo Portale</Text>
            <Text style={styles.featureText}>
              Tutte le stanze in un unico posto. Niente più ricerche su mille piattaforme.
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Calendar size={24} color="#0ea5e9" />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Gestione Appuntamenti</Text>
            <Text style={styles.featureText}>
              Organizza visite e open day direttamente dalla app. Zero stress.
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Shield size={24} color="#0ea5e9" />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Profili Verificati</Text>
            <Text style={styles.featureText}>
              Affittuari e proprietari verificati per la tua sicurezza.
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cosa vuoi fare?</Text>
        
        <Link href="/search" asChild>
          <Pressable style={styles.actionCard}>
            <View>
              <Text style={styles.actionTitle}>Cerco una stanza</Text>
              <Text style={styles.actionText}>Esplora gli annunci disponibili</Text>
            </View>
            <ChevronRight size={24} color="#0ea5e9" />
          </Pressable>
        </Link>

        <Link href="/auth/register" asChild>
          <Pressable style={[styles.actionCard, styles.actionCardAccent]}>
            <View>
              <Text style={[styles.actionTitle, styles.textWhite]}>Ho una stanza da affittare</Text>
              <Text style={[styles.actionText, styles.textWhiteLight]}>Pubblica il tuo annuncio</Text>
            </View>
            <ChevronRight size={24} color="#ffffff" />
          </Pressable>
        </Link>
      </View>

      {/* Popular Cities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Città popolari</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['Milano', 'Roma', 'Bologna', 'Firenze', 'Torino', 'Napoli'].map((city) => (
            <Link key={city} href={`/search?city=${city}`} asChild>
              <Pressable style={styles.cityChip}>
                <Text style={styles.cityChipText}>{city}</Text>
              </Pressable>
            </Link>
          ))}
        </ScrollView>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  hero: {
    backgroundColor: '#0ea5e9',
    padding: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#e0f2fe',
    marginBottom: 24,
    lineHeight: 24,
  },
  searchBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#1f2937',
  },
  searchButton: {
    backgroundColor: '#0ea5e9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f3f4f6',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  actionCardAccent: {
    backgroundColor: '#0ea5e9',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  actionText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  textWhite: {
    color: '#ffffff',
  },
  textWhiteLight: {
    color: '#e0f2fe',
  },
  cityChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 12,
  },
  cityChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
});
