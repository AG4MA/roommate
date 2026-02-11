import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { MessageCircle, ChevronRight, RefreshCw } from 'lucide-react-native';
import { Link, useRouter } from 'expo-router';
import { useConversations } from '../../hooks/useApi';
import { useAuthStore } from '../../store/auth';
import type { Conversation } from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

export default function MessagesScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { data, isLoading, isError, refetch, isFetching } = useConversations();

  const conversations = data?.data ?? [];

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <View style={styles.iconContainer}>
            <MessageCircle size={48} color="#d1d5db" />
          </View>
          <Text style={styles.title}>Accedi per vedere i messaggi</Text>
          <Text style={styles.subtitle}>
            Effettua l'accesso per vedere le tue conversazioni con proprietari e inquilini.
          </Text>
          <Link href="/auth/login" asChild>
            <Pressable style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Accedi</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    );
  }

  const formatTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: it });
    } catch {
      return '';
    }
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <Pressable 
      style={styles.conversationItem}
      onPress={() => router.push(`/conversation/${item.id}`)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.otherUser.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName} numberOfLines={1}>
            {item.otherUser.name}
          </Text>
          {item.lastMessage && (
            <Text style={styles.conversationTime}>
              {formatTime(item.lastMessage.createdAt)}
            </Text>
          )}
        </View>
        {item.listing && (
          <Text style={styles.listingTitle} numberOfLines={1}>
            {item.listing.title}
          </Text>
        )}
        {item.lastMessage && (
          <Text style={[
            styles.lastMessage,
            item.unreadCount > 0 && styles.lastMessageUnread
          ]} numberOfLines={1}>
            {item.lastMessage.content}
          </Text>
        )}
      </View>
      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>{item.unreadCount}</Text>
        </View>
      )}
      <ChevronRight size={20} color="#d1d5db" />
    </Pressable>
  );

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.subtitle}>Caricamento...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.title}>Errore di caricamento</Text>
          <Text style={styles.subtitle}>Impossibile caricare le conversazioni.</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <RefreshCw size={16} color="#ffffff" />
            <Text style={styles.retryButtonText}>Riprova</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <View style={styles.iconContainer}>
          <MessageCircle size={48} color="#d1d5db" />
        </View>
        <Text style={styles.title}>Nessun messaggio</Text>
        <Text style={styles.subtitle}>
          Quando contatti un proprietario, le conversazioni appariranno qui.
        </Text>
        <Link href="/search" asChild>
          <Text style={styles.link}>Cerca una stanza</Text>
        </Link>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={conversations.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={renderEmptyState}
        refreshing={isFetching && !isLoading}
        onRefresh={refetch}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  emptyContainer: {
    flex: 1,
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
  loginButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0ea5e9',
  },
  conversationContent: {
    flex: 1,
    marginRight: 8,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  conversationTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  listingTitle: {
    fontSize: 13,
    color: '#0ea5e9',
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6b7280',
  },
  lastMessageUnread: {
    fontWeight: '600',
    color: '#1f2937',
  },
  unreadBadge: {
    backgroundColor: '#0ea5e9',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginRight: 8,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 76,
  },
});
