import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router, Link } from 'expo-router';
import { 
  MapPin, Euro, Users, Calendar, Square, 
  Wifi, Bath, Wind, Tv, Car, Leaf,
  Heart, Share2, MessageCircle, CheckCircle, XCircle, RefreshCw
} from 'lucide-react-native';
import { useListing, useExpressInterest, useCreateConversation } from '../../hooks/useApi';
import { useAuthStore } from '../../store/auth';

// Feature icons mapping
const featureIcons: Record<string, any> = {
  wifi: Wifi,
  privateBath: Bath,
  aircon: Wind,
  tv: Tv,
  parking: Car,
  balcony: Leaf,
};

// Feature Italian labels
const featureLabels: Record<string, string> = {
  wifi: 'WiFi',
  furnished: 'Arredato',
  privateBath: 'Bagno privato',
  balcony: 'Balcone',
  aircon: 'Aria condizionata',
  heating: 'Riscaldamento',
  washingMachine: 'Lavatrice',
  parking: 'Parcheggio',
  tv: 'TV',
  dishwasher: 'Lavastoviglie',
  elevator: 'Ascensore',
  petsAllowed: 'Animali ammessi',
};

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const { data, isLoading, isError, refetch } = useListing(id!);
  const expressInterestMutation = useExpressInterest();
  const createConversationMutation = useCreateConversation();

  const listing = data?.data;

  const handleExpressInterest = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Accedi',
        'Devi accedere per esprimere interesse.',
        [
          { text: 'Annulla', style: 'cancel' },
          { text: 'Accedi', onPress: () => router.push('/auth/login') }
        ]
      );
      return;
    }

    try {
      await expressInterestMutation.mutateAsync(id!);
      Alert.alert('Successo', 'Hai espresso interesse per questa stanza!');
    } catch (error) {
      Alert.alert('Errore', 'Impossibile esprimere interesse. Riprova.');
    }
  };

  const handleContact = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Accedi',
        'Devi accedere per contattare il proprietario.',
        [
          { text: 'Annulla', style: 'cancel' },
          { text: 'Accedi', onPress: () => router.push('/auth/login') }
        ]
      );
      return;
    }

    if (!listing?.owner?.id) return;

    try {
      const result = await createConversationMutation.mutateAsync({
        recipientId: listing.owner.id,
        listingId: id,
      });
      
      if (result.data?.id) {
        router.push(`/conversation/${result.data.id}`);
      }
    } catch (error) {
      Alert.alert('Errore', 'Impossibile avviare la conversazione. Riprova.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={styles.loadingText}>Caricamento...</Text>
      </View>
    );
  }

  if (isError || !listing) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Errore di caricamento</Text>
        <Text style={styles.errorText}>Impossibile caricare i dettagli della stanza.</Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <RefreshCw size={16} color="#ffffff" />
          <Text style={styles.retryButtonText}>Riprova</Text>
        </Pressable>
      </View>
    );
  }

  // Parse features array into object for display
  const featuresObj: Record<string, boolean> = {};
  listing.features?.forEach(f => { featuresObj[f] = true; });

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          <View style={styles.imagePlaceholder}>
            <MapPin size={48} color="#9ca3af" />
            {listing.images?.length > 0 && (
              <Text style={styles.imageCount}>{listing.images.length} foto</Text>
            )}
          </View>
          <View style={styles.imageActions}>
            <Pressable style={styles.imageActionButton} onPress={handleExpressInterest}>
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
            <Text style={styles.title}>{listing.title}</Text>
            <View style={styles.addressRow}>
              <MapPin size={16} color="#6b7280" />
              <Text style={styles.address}>{listing.address}, {listing.city}</Text>
            </View>
          </View>

          {/* Quick Info */}
          <View style={styles.quickInfo}>
            <View style={styles.infoCard}>
              <Euro size={24} color="#0ea5e9" />
              <Text style={styles.infoValue}>€{listing.price}</Text>
              <Text style={styles.infoLabel}>al mese</Text>
            </View>
            {listing.size && (
              <View style={styles.infoCard}>
                <Square size={24} color="#0ea5e9" />
                <Text style={styles.infoValue}>{listing.size}m²</Text>
                <Text style={styles.infoLabel}>
                  {listing.roomType === 'SINGLE' ? 'Singola' : listing.roomType === 'DOUBLE' ? 'Doppia' : 'Monolocale'}
                </Text>
              </View>
            )}
            {listing.interestCount !== undefined && (
              <View style={styles.infoCard}>
                <Users size={24} color="#0ea5e9" />
                <Text style={styles.infoValue}>{listing.interestCount}</Text>
                <Text style={styles.infoLabel}>Interessati</Text>
              </View>
            )}
            {listing.minStay && (
              <View style={styles.infoCard}>
                <Calendar size={24} color="#0ea5e9" />
                <Text style={styles.infoValue}>{listing.minStay}</Text>
                <Text style={styles.infoLabel}>Mesi min</Text>
              </View>
            )}
          </View>

          {/* Deposit Info */}
          {listing.deposit && (
            <View style={styles.depositBanner}>
              <Text style={styles.depositLabel}>Deposito cauzionale:</Text>
              <Text style={styles.depositValue}>€{listing.deposit}</Text>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrizione</Text>
            <Text style={styles.description}>{listing.description}</Text>
          </View>

          {/* Features */}
          {listing.features && listing.features.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Caratteristiche</Text>
              <View style={styles.featuresGrid}>
                {listing.features.map((feature) => (
                  <View key={feature} style={[styles.featureItem, styles.featureActive]}>
                    <CheckCircle size={16} color="#10b981" />
                    <Text style={styles.featureText}>
                      {featureLabels[feature] || feature}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Landlord */}
          {listing.owner && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Proprietario</Text>
              <View style={styles.landlordCard}>
                <View style={styles.landlordAvatar}>
                  <Text style={styles.landlordInitial}>
                    {listing.owner.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.landlordInfo}>
                  <View style={styles.landlordNameRow}>
                    <Text style={styles.landlordName}>{listing.owner.name}</Text>
                    <CheckCircle size={16} color="#10b981" />
                  </View>
                  {listing.owner.responseTime && (
                    <Text style={styles.landlordResponse}>
                      Risponde in {listing.owner.responseTime}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Available From */}
          {listing.availableFrom && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Disponibilità</Text>
              <Text style={styles.availableText}>
                Disponibile dal {new Date(listing.availableFrom).toLocaleDateString('it-IT', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.priceInfo}>
          <Text style={styles.bottomPrice}>€{listing.price}</Text>
          <Text style={styles.bottomPriceLabel}>/mese</Text>
        </View>
        <View style={styles.bottomActions}>
          <Pressable 
            style={styles.messageButton}
            onPress={handleContact}
            disabled={createConversationMutation.isPending}
          >
            {createConversationMutation.isPending ? (
              <ActivityIndicator size="small" color="#0ea5e9" />
            ) : (
              <MessageCircle size={20} color="#0ea5e9" />
            )}
          </Pressable>
          <Link href={`/booking/${listing.id}`} asChild>
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
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
  imageCount: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
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
  depositBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  depositLabel: {
    fontSize: 14,
    color: '#92400e',
  },
  depositValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
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
  featureText: {
    fontSize: 13,
    color: '#10b981',
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
  availableText: {
    fontSize: 15,
    color: '#4b5563',
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
