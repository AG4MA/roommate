import { View, Text, FlatList, StyleSheet, Pressable, TextInput } from 'react-native';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Search, MapPin, SlidersHorizontal, Euro, Users, Wifi } from 'lucide-react-native';

// Mock data
const mockRooms = [
  {
    id: '1',
    title: 'Stanza singola luminosa - Porta Venezia',
    address: 'Via Lecco, Milano',
    price: 550,
    roomType: 'single',
    size: 14,
    features: ['wifi', 'furnished'],
    roommates: 2,
  },
  {
    id: '2',
    title: 'Ampia stanza doppia con bagno privato',
    address: 'Via Padova 120, Milano',
    price: 450,
    roomType: 'double',
    size: 18,
    features: ['wifi', 'privateBath', 'furnished'],
    roommates: 1,
  },
  {
    id: '3',
    title: 'Monolocale accogliente zona Navigli',
    address: 'Ripa di Porta Ticinese, Milano',
    price: 750,
    roomType: 'studio',
    size: 28,
    features: ['wifi', 'furnished', 'balcony'],
    roommates: 0,
  },
  {
    id: '4',
    title: 'Stanza singola appartamento ristrutturato',
    address: 'Corso Buenos Aires, Milano',
    price: 600,
    roomType: 'single',
    size: 12,
    features: ['wifi', 'aircon'],
    roommates: 3,
  },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const renderRoomCard = ({ item }: { item: typeof mockRooms[0] }) => (
    <Link href={`/room/${item.id}`} asChild>
      <Pressable style={styles.card}>
        {/* Image placeholder */}
        <View style={styles.cardImage}>
          <MapPin size={32} color="#9ca3af" />
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>€{item.price}</Text>
              <Text style={styles.priceSubtext}>/mese</Text>
            </View>
          </View>

          <View style={styles.cardAddress}>
            <MapPin size={14} color="#6b7280" />
            <Text style={styles.addressText}>{item.address}</Text>
          </View>

          <View style={styles.cardTags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {item.roomType === 'single' ? 'Singola' : item.roomType === 'double' ? 'Doppia' : 'Monolocale'}
              </Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{item.size}m²</Text>
            </View>
            {item.features.includes('wifi') && (
              <View style={[styles.tag, styles.tagHighlight]}>
                <Wifi size={12} color="#0ea5e9" />
                <Text style={[styles.tagText, styles.tagTextHighlight]}>WiFi</Text>
              </View>
            )}
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.roommatesInfo}>
              <Users size={14} color="#6b7280" />
              <Text style={styles.roommatesText}>{item.roommates} coinquilini</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#9ca3af" />
          <TextInput
            placeholder="Città o quartiere..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor="#9ca3af"
          />
        </View>
        <Pressable 
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={20} color={showFilters ? '#0ea5e9' : '#6b7280'} />
        </Pressable>
      </View>

      {/* Quick Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <Pressable style={styles.filterChip}>
              <Euro size={14} color="#6b7280" />
              <Text style={styles.filterChipText}>Budget</Text>
            </Pressable>
            <Pressable style={styles.filterChip}>
              <Text style={styles.filterChipText}>Tipo stanza</Text>
            </Pressable>
            <Pressable style={styles.filterChip}>
              <Text style={styles.filterChipText}>Data</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Results */}
      <FlatList
        data={mockRooms}
        renderItem={renderRoomCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.resultsCount}>
            {mockRooms.length} stanze trovate
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  searchHeader: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#1f2937',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#e0f2fe',
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  filterChipText: {
    fontSize: 14,
    color: '#6b7280',
  },
  list: {
    padding: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImage: {
    height: 160,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 12,
  },
  priceTag: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  priceSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },
  cardAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  tagHighlight: {
    backgroundColor: '#e0f2fe',
  },
  tagText: {
    fontSize: 12,
    color: '#6b7280',
  },
  tagTextHighlight: {
    color: '#0ea5e9',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roommatesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roommatesText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
