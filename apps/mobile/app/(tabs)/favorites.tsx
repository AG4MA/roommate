import { View, Text, StyleSheet } from 'react-native';
import { Heart } from 'lucide-react-native';
import { Link } from 'expo-router';

export default function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.emptyState}>
        <View style={styles.iconContainer}>
          <Heart size={48} color="#d1d5db" />
        </View>
        <Text style={styles.title}>Nessun preferito</Text>
        <Text style={styles.subtitle}>
          Salva le stanze che ti interessano per trovarle facilmente.
        </Text>
        <Link href="/search" asChild>
          <Text style={styles.link}>Esplora le stanze</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#f3f4f6',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  link: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0ea5e9',
  },
});
