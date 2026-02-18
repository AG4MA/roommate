import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Users, Crown } from 'lucide-react-native';
import type { GroupDetail } from '@roommate/shared';
import { TenantProfileCard } from './TenantProfileCard';

interface Props {
  group: GroupDetail;
}

export function GroupProfileCard({ group }: Props) {
  const acceptedMembers = group.members.filter((m) => m.status === 'ACCEPTED');

  return (
    <View style={styles.container}>
      {/* Group Header */}
      <View style={styles.header}>
        <View style={styles.icon}>
          <Users size={20} color="#0ea5e9" />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>
            {group.name || 'Gruppo senza nome'}
          </Text>
          <Text style={styles.subtitle}>
            {acceptedMembers.length} membr{acceptedMembers.length === 1 ? 'o' : 'i'}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Gruppo</Text>
        </View>
      </View>

      {group.description ? (
        <Text style={styles.description}>{group.description}</Text>
      ) : null}

      {/* Members horizontal scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.membersScroll}>
        {acceptedMembers.map((member) => (
          <View key={member.userId} style={styles.memberCard}>
            {member.role === 'OWNER' && (
              <View style={styles.ownerBadge}>
                <Crown size={10} color="#d97706" />
              </View>
            )}
            {member.tenantProfile ? (
              <TenantProfileCard tenant={member.tenantProfile} />
            ) : (
              <View style={styles.placeholderCard}>
                <View style={styles.placeholderAvatar}>
                  <Text style={styles.placeholderInitial}>
                    {member.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.placeholderName}>{member.name}</Text>
                <Text style={styles.placeholderSub}>Profilo non completato</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  icon: {
    width: 40,
    height: 40,
    backgroundColor: '#e0f2fe',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  badge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0ea5e9',
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
  },
  membersScroll: {
    marginHorizontal: -4,
  },
  memberCard: {
    width: 260,
    marginHorizontal: 4,
    position: 'relative',
  },
  ownerBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    zIndex: 10,
    width: 22,
    height: 22,
    backgroundColor: '#fef3c7',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  placeholderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    alignItems: 'center',
  },
  placeholderAvatar: {
    width: 48,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  placeholderInitial: {
    fontSize: 20,
    fontWeight: '600',
    color: '#9ca3af',
  },
  placeholderName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  placeholderSub: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
});
