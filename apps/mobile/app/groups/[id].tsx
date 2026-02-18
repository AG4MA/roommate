import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Users, Crown, ArrowLeft, Mail, UserMinus,
  Trash2, LogOut, MessageCircle, Clock, Check, X,
} from 'lucide-react-native';
import { useGroup, useInviteGroupMember, useRemoveGroupMember, useDeleteGroup } from '../../hooks/useApi';
import { TenantProfileCard } from '../../components/TenantProfileCard';
import { useAuthStore } from '../../store/auth';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: groupRes, isLoading } = useGroup(id!);
  const inviteMutation = useInviteGroupMember();
  const removeMutation = useRemoveGroupMember();
  const deleteMutation = useDeleteGroup();
  const [inviteEmail, setInviteEmail] = useState('');

  const group = groupRes?.data;
  const currentMember = group?.members.find((m) => m.userId === user?.id);
  const isOwner = currentMember?.role === 'OWNER';
  const acceptedMembers = group?.members.filter((m) => m.status === 'ACCEPTED') || [];
  const pendingMembers = group?.members.filter((m) => m.status === 'PENDING') || [];

  async function handleInvite() {
    if (!inviteEmail.trim() || !id) return;
    const result = await inviteMutation.mutateAsync({ groupId: id, email: inviteEmail.trim() });
    if (result.success) {
      setInviteEmail('');
      Alert.alert('Invito inviato');
    } else {
      Alert.alert('Errore', result.error || 'Impossibile inviare l\'invito');
    }
  }

  function handleRemove(memberName: string, membershipId: string, isSelf: boolean) {
    const message = isSelf ? 'Vuoi lasciare il gruppo?' : `Vuoi rimuovere ${memberName}?`;
    Alert.alert('Conferma', message, [
      { text: 'Annulla', style: 'cancel' },
      {
        text: isSelf ? 'Lascia' : 'Rimuovi',
        style: 'destructive',
        onPress: async () => {
          const result = await removeMutation.mutateAsync({ groupId: id!, membershipId });
          if (result.success && isSelf) {
            router.replace('/groups');
          }
        },
      },
    ]);
  }

  function handleDissolve() {
    Alert.alert('Sciogli gruppo', 'Questa azione è irreversibile.', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Sciogli',
        style: 'destructive',
        onPress: async () => {
          const result = await deleteMutation.mutateAsync(id!);
          if (result.success) {
            router.replace('/groups');
          }
        },
      },
    ]);
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Users size={48} color="#d1d5db" />
        <Text style={styles.emptyText}>Gruppo non trovato</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#6b7280" />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {group.name || 'Gruppo senza nome'}
          </Text>
          <Text style={styles.headerSub}>
            {group.memberCount}/{group.maxMembers} membri
          </Text>
        </View>
        {group.conversationId && (
          <Pressable style={styles.chatBtn}>
            <MessageCircle size={20} color="#0ea5e9" />
          </Pressable>
        )}
      </View>

      {group.description ? (
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>{group.description}</Text>
        </View>
      ) : null}

      {/* Invite Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Mail size={18} color="#0ea5e9" />
          <Text style={styles.sectionTitle}>Invita un membro</Text>
        </View>
        <View style={styles.inviteRow}>
          <TextInput
            style={styles.inviteInput}
            value={inviteEmail}
            onChangeText={setInviteEmail}
            placeholder="Email dell'inquilino"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Pressable
            style={[styles.inviteBtn, (!inviteEmail.trim() || inviteMutation.isPending) && styles.inviteBtnDisabled]}
            onPress={handleInvite}
            disabled={!inviteEmail.trim() || inviteMutation.isPending}
          >
            {inviteMutation.isPending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.inviteBtnText}>Invita</Text>
            )}
          </Pressable>
        </View>
      </View>

      {/* Pending */}
      {pendingMembers.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={18} color="#d97706" />
            <Text style={styles.sectionTitle}>In attesa ({pendingMembers.length})</Text>
          </View>
          {pendingMembers.map((m) => (
            <View key={m.id} style={styles.pendingRow}>
              <View style={styles.pendingAvatar}>
                <Text style={styles.pendingInitial}>{m.name.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.pendingName}>{m.name}</Text>
              {isOwner && (
                <Pressable onPress={() => handleRemove(m.name, m.id, false)}>
                  <X size={18} color="#9ca3af" />
                </Pressable>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Members */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Check size={18} color="#10b981" />
          <Text style={styles.sectionTitle}>Membri ({acceptedMembers.length})</Text>
        </View>
        {acceptedMembers.map((m) => (
          <View key={m.id} style={styles.memberBlock}>
            <View style={styles.memberHeader}>
              <Text style={styles.memberName}>{m.name}</Text>
              {m.role === 'OWNER' && (
                <View style={styles.ownerTag}>
                  <Crown size={10} color="#d97706" />
                  <Text style={styles.ownerTagText}>Owner</Text>
                </View>
              )}
              {isOwner && m.userId !== user?.id && (
                <Pressable
                  style={styles.removeBtn}
                  onPress={() => handleRemove(m.name, m.id, false)}
                >
                  <UserMinus size={14} color="#9ca3af" />
                </Pressable>
              )}
            </View>
            {m.tenantProfile && <TenantProfileCard tenant={m.tenantProfile} />}
          </View>
        ))}
      </View>

      {/* Danger Zone */}
      <View style={styles.dangerSection}>
        {currentMember && (
          <Pressable
            style={styles.leaveBtn}
            onPress={() => handleRemove('', currentMember.id, true)}
          >
            <LogOut size={18} color="#ef4444" />
            <Text style={styles.leaveBtnText}>Lascia il gruppo</Text>
          </Pressable>
        )}
        {isOwner && (
          <Pressable style={styles.dissolveBtn} onPress={handleDissolve}>
            <Trash2 size={18} color="#ffffff" />
            <Text style={styles.dissolveBtnText}>Sciogli il gruppo</Text>
          </Pressable>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centered: { alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, color: '#6b7280', marginTop: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  headerSub: { fontSize: 13, color: '#6b7280' },
  chatBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  descriptionBox: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  descriptionText: { fontSize: 14, color: '#4b5563', lineHeight: 20 },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 12,
    padding: 16,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  inviteRow: { flexDirection: 'row', gap: 8 },
  inviteInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
  },
  inviteBtn: {
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  inviteBtnDisabled: { opacity: 0.5 },
  inviteBtnText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  pendingAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingInitial: { fontSize: 14, fontWeight: '600', color: '#d97706' },
  pendingName: { flex: 1, fontSize: 15, fontWeight: '500', color: '#1f2937' },
  memberBlock: { marginBottom: 16 },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  memberName: { fontSize: 15, fontWeight: '600', color: '#374151', flex: 1 },
  ownerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ownerTagText: { fontSize: 11, fontWeight: '500', color: '#d97706' },
  removeBtn: { padding: 4 },
  dangerSection: {
    padding: 16,
    marginTop: 12,
    gap: 12,
  },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  leaveBtnText: { fontSize: 15, fontWeight: '600', color: '#ef4444' },
  dissolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#ef4444',
  },
  dissolveBtnText: { fontSize: 15, fontWeight: '600', color: '#ffffff' },
});
