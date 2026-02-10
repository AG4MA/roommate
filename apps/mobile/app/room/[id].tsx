import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, router, Link } from 'expo-router';
import { 
  MapPin, Euro, Users, Calendar, Square, 
  Wifi, Bath, Wind, Tv, Car, Leaf,
  Heart, Share2, MessageCircle, CheckCircle, XCircle
} from 'lucide-react-native';

// Mock data
const mockRoom = {
  id: '1',
  title: 'Stanza singola luminosa con balcone - Porta Venezia',
  description: `Bellissima stanza singola in appartamento completamente ristrutturato, situato in una delle zone più vivaci e ben collegate di Milano.

La stanza è molto luminosa grazie alla finestra che affaccia sul balcone privato.`,
  address: 'Via Lecco 15, Milano',
  price: 550,
  expenses: 80,
  deposit: 1100,
  roomType: 'single',
  size: 14,
  minStay: 6,
  availableFrom: '2024-03-01',
  features: {
    wifi: true,
    furnished: true,
    privateBath: false,
    balcony: true,
    aircon: true,
    heating: true,
    washingMachine: true,
    parking: false,
  },
  roommates: [
    { name: 'Marco', age: 28, occupation: 'Software Developer' },
    { name: 'Luca', age: 26, occupation: 'Marketing Manager' },
  ],
  landlord: {
    name: 'Anna Rossi',
    responseTime: '< 1 ora',
    verified: true,
  },
};

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams();
  const room = mockRoom; // In produzione, fetch dal server

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          <View style={styles.imagePlaceholder}>
            <MapPin size={48} color="#9ca3af" />
          </View>
          <View style={styles.imageActions}>
            <Pressable style={styles.imageActionButton}>
              <Heart size={20} color="#ffffff" />
            </Pressable>
            <Pressable style={styles.imageActionButton}>
              <Share2 size={20} color="#ffffff" />
            </Pressable>
          </View>
        </View>

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{room.title}</Text>
            <View style={styles.addressRow}>
              <MapPin size={16} color="#6b7280" />
              <Text style={styles.address}>{room.address}</Text>
            </View>
          </View>

          {/* Quick Info */}
          <View style={styles.quickInfo}>
            <View style={styles.infoCard}>
              <Euro size={24} color="#0ea5e9" />
              <Text style={styles.infoValue}>€{room.price}</Text>
              <Text style={styles.infoLabel}>+ €{room.expenses} spese</Text>
            </View>
            <View style={styles.infoCard}>
              <Square size={24} color="#0ea5e9" />
              <Text style={styles.infoValue}>{room.size}m²</Text>
              <Text style={styles.infoLabel}>Singola</Text>
            </View>
            <View style={styles.infoCard}>
              <Users size={24} color="#0ea5e9" />
              <Text style={styles.infoValue}>{room.roommates.length}</Text>
              <Text style={styles.infoLabel}>Coinquilini</Text>
            </View>
            <View style={styles.infoCard}>
              <Calendar size={24} color="#0ea5e9" />
              <Text style={styles.infoValue}>{room.minStay}</Text>
              <Text style={styles.infoLabel}>Mesi min</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrizione</Text>
            <Text style={styles.description}>{room.description}</Text>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Caratteristiche</Text>
            <View style={styles.featuresGrid}>
              {Object.entries(room.features).map(([key, value]) => (
                <View 
                  key={key} 
                  style={[styles.featureItem, value ? styles.featureActive : styles.featureInactive]}
                >
                  {value ? (
                    <CheckCircle size={16} color="#10b981" />
                  ) : (
                    <XCircle size={16} color="#9ca3af" />
                  )}
                  <Text style={[styles.featureText, !value && styles.featureTextInactive]}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Roommates */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>I tuoi futuri coinquilini</Text>
            {room.roommates.map((roommate, idx) => (
              <View key={idx} style={styles.roommateCard}>
                <View style={styles.roommateAvatar}>
                  <Text style={styles.roommateInitial}>{roommate.name[0]}</Text>
                </View>
                <View>
                  <Text style={styles.roommateName}>{roommate.name}, {roommate.age}</Text>
                  <Text style={styles.roommateJob}>{roommate.occupation}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Landlord */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Proprietario</Text>
            <View style={styles.landlordCard}>
              <View style={styles.landlordAvatar}>
                <Text style={styles.landlordInitial}>{room.landlord.name[0]}</Text>
              </View>
              <View style={styles.landlordInfo}>
                <View style={styles.landlordNameRow}>
                  <Text style={styles.landlordName}>{room.landlord.name}</Text>
                  {room.landlord.verified && (
                    <CheckCircle size={16} color="#10b981" />
                  )}
                </View>
                <Text style={styles.landlordResponse}>
                  Risponde in {room.landlord.responseTime}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.priceInfo}>
          <Text style={styles.bottomPrice}>€{room.price}</Text>
          <Text style={styles.bottomPriceLabel}>/mese</Text>
        </View>
        <View style={styles.bottomActions}>
          <Pressable style={styles.messageButton}>
            <MessageCircle size={20} color="#0ea5e9" />
          </Pressable>
          <Link href={`/booking/${room.id}`} asChild>
            <Pressable style={styles.bookButton}>
              <Text style={styles.bookButtonText}>Prenota visita</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  imageGallery: {
    height: 280,
    backgroundColor: '#f3f4f6',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageActions: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  imageActionButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  address: {
    fontSize: 14,
    color: '#6b7280',
  },
  quickInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  infoLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  featureActive: {
    backgroundColor: '#ecfdf5',
  },
  featureInactive: {
    backgroundColor: '#f3f4f6',
  },
  featureText: {
    fontSize: 13,
    color: '#10b981',
    textTransform: 'capitalize',
  },
  featureTextInactive: {
    color: '#9ca3af',
  },
  roommateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  roommateAvatar: {
    width: 48,
    height: 48,
    backgroundColor: '#e0f2fe',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roommateInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0ea5e9',
  },
  roommateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  roommateJob: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  landlordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  landlordAvatar: {
    width: 56,
    height: 56,
    backgroundColor: '#fef3c7',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  landlordInitial: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f59e0b',
  },
  landlordInfo: {
    flex: 1,
  },
  landlordNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  landlordName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  landlordResponse: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bottomPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  bottomPriceLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
  },
  messageButton: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: '#0ea5e9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
