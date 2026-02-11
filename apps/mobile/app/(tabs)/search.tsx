import { View, Text, FlatList, StyleSheet, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { useState, useMemo, useCallback } from 'react';
import { Search, MapPin, SlidersHorizontal, Euro, Users, Wifi, RefreshCw } from 'lucide-react-native';
import { useListings } from '../../hooks/useApi';
import type { Listing } from '../../lib/api';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{ city?: string; roomType?: string; minPrice?: number; maxPrice?: number }>({});

  // Build query params from search and filters
  const queryParams = useMemo(() => ({
    ...(searchQuery ? { city: searchQuery } : {}),
    ...filters,
    limit: 20,
  }), [searchQuery, filters]);

  const { data, isLoading, isError, refetch, isFetching } = useListings(queryParams);

  const listings = data?.data?.listings ?? [];
  const total = data?.data?.total ?? 0;

  const handleSearch = useCallback(() => {
    refetch();
  }, [refetch]);

  const renderRoomCard = ({ item }: { item: Listing }) => (
    <Link href={`/room/${item.id}`} asChild>
      <Pressable style={styles.card}>
        {/* Image */}
        <View style={styles.cardImage}>
          {item.images?.[0] ? (
            <View style={styles.imagePlaceholder}>
              <MapPin size={32} color="#9ca3af" />
              <Text style={styles.imagePlaceholderText}>Immagine</Text>
            </View>
          ) : (
            <MapPin size={32} color="#9ca3af" />
          )}
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
            <Text style={styles.addressText}>{item.address}, {item.city}</Text>
          </View>

          <View style={styles.cardTags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {item.roomType === 'SINGLE' ? 'Singola' : item.roomType === 'DOUBLE' ? 'Doppia' : 'Monolocale'}
              </Text>
            </View>
            {item.size && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{item.size}m²</Text>
              </View>
            )}
            {item.features?.includes('wifi') && (
              <View style={[styles.tag, styles.tagHighlight]}>
                <Wifi size={12} color="#0ea5e9" />
                <Text style={[styles.tagText, styles.tagTextHighlight]}>WiFi</Text>
              </View>
            )}
          </View>

          <View style={styles.cardFooter}>
            {item.interestCount !== undefined && (
              <View style={styles.roommatesInfo}>
                <Users size={14} color="#6b7280" />
                <Text style={styles.roommatesText}>{item.interestCount} interessati</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Link>
  );

  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.emptyText}>Caricamento...</Text>
        </View>
      );
    }
    
    if (isError) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Errore di caricamento</Text>
          <Text style={styles.emptyText}>Impossibile caricare le stanze. Riprova.</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <RefreshCw size={16} color="#ffffff" />
            <Text style={styles.retryButtonText}>Riprova</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <MapPin size={48} color="#d1d5db" />
        <Text style={styles.emptyTitle}>Nessuna stanza trovata</Text>
        <Text style={styles.emptyText}>Prova a modificare i filtri di ricerca</Text>
      </View>
    );
  };

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
        data={listings}
        renderItem={renderRoomCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={isFetching && !isLoading}
        onRefresh={refetch}
        ListEmptyComponent={renderEmptyComponent}
        ListHeaderComponent={
          listings.length > 0 ? (
            <Text style={styles.resultsCount}>
              {total} stanz{total === 1 ? 'a' : 'e'} trovat{total === 1 ? 'a' : 'e'}
            </Text>
          ) : null
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
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
