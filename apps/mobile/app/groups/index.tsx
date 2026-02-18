import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Users, Plus, Crown, Clock, Check, X } from 'lucide-react-native';
import { useMyGroups, useMyGroupInvitations, useRespondToGroupInvitation } from '../../hooks/useApi';

export default function GroupsScreen() {
  const router = useRouter();
  const { data: groupsRes, isLoading: loadingGroups } = useMyGroups();
  const { data: invitationsRes, isLoading: loadingInvitations } = useMyGroupInvitations();
  const respondMutation = useRespondToGroupInvitation();

  const groups = groupsRes?.data || [];
  const invitations = invitationsRes?.data || [];
  const isLoading = loadingGroups || loadingInvitations;

  function handleRespond(groupId: string, membershipId: string, action: 'accept' | 'decline') {
    respondMutation.mutate({ groupId, membershipId, action });
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>I miei gruppi</Text>
        <Pressable style={styles.createButton} onPress={() => router.push('/groups/create')}>
          <Plus size={20} color="#ffffff" />
          <Text style={styles.createButtonText}>Crea</Text>
        </Pressable>
      </View>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={18} color="#d97706" />
            <Text style={styles.sectionTitle}>Inviti in sospeso</Text>
          </View>
          {invitations.map((inv) => (
            <View key={inv.membershipId} style={styles.invitationCard}>
              <View style={styles.invitationInfo}>
                <Text style={styles.invitationName}>
                  {inv.group.name || 'Gruppo senza nome'}
                </Text>
                <Text style={styles.invitationSub}>
                  Da {inv.invitedBy.name} · {inv.group.memberCount} membri
                </Text>
              </View>
              <View style={styles.invitationActions}>
                <Pressable
                  style={styles.acceptBtn}
                  onPress={() => handleRespond(inv.group.id, inv.membershipId, 'accept')}
                >
                  <Check size={16} color="#ffffff" />
                </Pressable>
                <Pressable
                  style={styles.declineBtn}
                  onPress={() => handleRespond(inv.group.id, inv.membershipId, 'decline')}
                >
                  <X size={16} color="#6b7280" />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Groups List */}
      {groups.length === 0 && invitations.length === 0 ? (
        <View style={styles.emptyState}>
          <Users size={48} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Nessun gruppo</Text>
          <Text style={styles.emptySubtitle}>
            Crea un gruppo per cercare casa con i tuoi futuri coinquilini
          </Text>
          <Pressable style={styles.createEmptyButton} onPress={() => router.push('/groups/create')}>
            <Plus size={20} color="#ffffff" />
            <Text style={styles.createButtonText}>Crea il tuo primo gruppo</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.section}>
          {groups.map((group) => {
            const accepted = group.members.filter((m) => m.status === 'ACCEPTED');
            return (
              <Pressable
                key={group.id}
                style={styles.groupCard}
                onPress={() => router.push(`/groups/${group.id}`)}
              >
                <View style={styles.groupIcon}>
                  <Users size={24} color="#0ea5e9" />
                </View>
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>
                    {group.name || 'Gruppo senza nome'}
                  </Text>
                  <Text style={styles.groupSub}>
                    {group.memberCount}/{group.maxMembers} membri
                    {group.pendingCount > 0 && ` · ${group.pendingCount} in attesa`}
                  </Text>
                  {/* Member avatars */}
                  <View style={styles.memberAvatars}>
                    {accepted.slice(0, 5).map((m) => (
                      <View
                        key={m.userId}
                        style={[
                          styles.miniAvatar,
                          m.role === 'OWNER' && styles.ownerAvatar,
                        ]}
                      >
                        <Text style={styles.miniAvatarText}>
                          {m.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centered: { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  createButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  invitationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  invitationInfo: { flex: 1 },
  invitationName: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  invitationSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  invitationActions: { flexDirection: 'row', gap: 8 },
  acceptBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: { fontSize: 18, color: '#6b7280', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 8 },
  createEmptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  groupCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  groupIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupInfo: { flex: 1, marginLeft: 12 },
  groupName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  groupSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  memberAvatars: { flexDirection: 'row', gap: 4, marginTop: 8 },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerAvatar: {
    backgroundColor: '#fef3c7',
    borderWidth: 2,
    borderColor: '#fcd34d',
  },
  miniAvatarText: { fontSize: 11, fontWeight: '600', color: '#0ea5e9' },
});
