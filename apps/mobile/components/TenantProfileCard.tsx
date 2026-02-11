import { View, Text, StyleSheet, Image } from 'react-native';
import {
  User,
  Briefcase,
  Euro,
  Calendar,
  Shield,
  Check,
  Cigarette,
  PawPrint,
  Languages,
  FileText,
  Building2,
  BadgeCheck,
} from 'lucide-react-native';
import type { TenantProfileCard as TenantProfileCardType } from '@roommate/shared';
import {
  getOccupationLabel,
  getContractTypeLabel,
  getIncomeRangeLabel,
  formatBudgetRange,
} from '@roommate/shared';

interface Props {
  tenant: TenantProfileCardType;
}

export function TenantProfileCard({ tenant }: Props) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          {tenant.avatar ? (
            <Image source={{ uri: tenant.avatar }} style={styles.avatarImage} />
          ) : (
            <User size={24} color="#0ea5e9" />
          )}
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {tenant.name}
              {tenant.age ? `, ${tenant.age}` : ''}
            </Text>
            {tenant.verified && <BadgeCheck size={16} color="#10b981" />}
          </View>
          <View style={styles.occupationRow}>
            <Briefcase size={14} color="#6b7280" />
            <Text style={styles.occupation}>
              {tenant.occupation
                ? getOccupationLabel(tenant.occupation)
                : 'Non specificato'}
            </Text>
          </View>
        </View>
      </View>

      {/* Attributes Grid */}
      <View style={styles.attributesGrid}>
        {(tenant.budgetMin || tenant.budgetMax) && (
          <AttributeBadge
            icon={Euro}
            label="Budget"
            value={formatBudgetRange(tenant.budgetMin, tenant.budgetMax)}
          />
        )}
        {tenant.contractType && (
          <AttributeBadge
            icon={FileText}
            label="Contratto"
            value={getContractTypeLabel(tenant.contractType)}
          />
        )}
        {tenant.incomeRange && (
          <AttributeBadge
            icon={Building2}
            label="Reddito"
            value={getIncomeRangeLabel(tenant.incomeRange)}
          />
        )}
        {tenant.moveInDate && (
          <AttributeBadge
            icon={Calendar}
            label="Ingresso"
            value={new Date(tenant.moveInDate).toLocaleDateString('it-IT', {
              month: 'short',
              year: 'numeric',
            })}
          />
        )}
        {tenant.languages.length > 0 && (
          <AttributeBadge
            icon={Languages}
            label="Lingue"
            value={tenant.languages.join(', ')}
          />
        )}
        <AttributeBadge
          icon={Shield}
          label="Garante"
          value={tenant.hasGuarantor ? 'Disponibile' : 'Non disponibile'}
        />
      </View>

      {/* Trait Pills */}
      <View style={styles.traitsRow}>
        <TraitPill
          label={tenant.smoker ? 'Fumatore' : 'Non fumatore'}
          type={tenant.smoker ? 'negative' : 'positive'}
        />
        {tenant.hasPets && <TraitPill label="Ha animali" type="neutral" />}
        {tenant.hasGuarantor && <TraitPill label="Garante" type="positive" />}
        {tenant.referencesAvailable && (
          <TraitPill label="Referenze" type="positive" />
        )}
        {tenant.employmentVerified && (
          <TraitPill label="Impiego verificato" type="positive" />
        )}
      </View>
    </View>
  );
}

function AttributeBadge({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.attributeCard}>
      <View style={styles.attributeHeader}>
        <Icon size={12} color="#9ca3af" />
        <Text style={styles.attributeLabel}>{label}</Text>
      </View>
      <Text style={styles.attributeValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function TraitPill({
  label,
  type,
}: {
  label: string;
  type: 'positive' | 'negative' | 'neutral';
}) {
  const bgColor =
    type === 'positive'
      ? '#ecfdf5'
      : type === 'negative'
        ? '#fef2f2'
        : '#f3f4f6';
  const textColor =
    type === 'positive'
      ? '#15803d'
      : type === 'negative'
        ? '#dc2626'
        : '#4b5563';
  const borderColor =
    type === 'positive'
      ? '#bbf7d0'
      : type === 'negative'
        ? '#fecaca'
        : '#e5e7eb';

  return (
    <View
      style={[styles.traitPill, { backgroundColor: bgColor, borderColor }]}
    >
      <Text style={[styles.traitPillText, { color: textColor }]}>{label}</Text>
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
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    backgroundColor: '#e0f2fe',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  occupationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  occupation: {
    fontSize: 14,
    color: '#6b7280',
  },
  attributesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  attributeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    width: '48%',
  },
  attributeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  attributeLabel: {
    fontSize: 10,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  attributeValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  traitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  traitPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  traitPillText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
