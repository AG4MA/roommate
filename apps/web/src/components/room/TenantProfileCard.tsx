'use client';

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
} from 'lucide-react';
import type { TenantProfileCard as TenantProfileCardType } from '@roommate/shared';
import {
  getOccupationLabel,
  getContractTypeLabel,
  getIncomeRangeLabel,
  formatBudgetRange,
} from '@roommate/shared';

interface TenantProfileCardProps {
  tenant: TenantProfileCardType;
  compact?: boolean;
}

export function TenantProfileCard({ tenant, compact = false }: TenantProfileCardProps) {
  return (
    <div className={`bg-gray-50 rounded-xl ${compact ? 'p-4' : 'p-6'} border border-gray-100`}>
      {/* Header: Avatar + Name + Occupation */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
          {tenant.avatar ? (
            <img
              src={tenant.avatar}
              alt={tenant.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-6 h-6 text-primary-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-800 truncate">
              {tenant.name}
              {tenant.age ? `, ${tenant.age}` : ''}
            </h4>
            {tenant.verified && (
              <BadgeCheck className="w-4 h-4 text-green-500 shrink-0" />
            )}
          </div>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Briefcase className="w-4 h-4 shrink-0" />
            {tenant.occupation
              ? getOccupationLabel(tenant.occupation)
              : 'Non specificato'}
          </p>
        </div>
      </div>

      {/* Attributes Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
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
            verified={tenant.incomeVerified}
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
          positive={tenant.hasGuarantor}
        />
      </div>

      {/* Boolean Traits Row */}
      <div className="flex flex-wrap gap-2">
        <TraitPill
          icon={Cigarette}
          label={tenant.smoker ? 'Fumatore' : 'Non fumatore'}
          negative={tenant.smoker}
          positive={!tenant.smoker}
        />
        {tenant.hasPets && (
          <TraitPill icon={PawPrint} label="Ha animali" />
        )}
        {tenant.referencesAvailable && (
          <TraitPill icon={FileText} label="Referenze disponibili" positive />
        )}
        {tenant.employmentVerified && (
          <TraitPill icon={Check} label="Impiego verificato" positive />
        )}
      </div>
    </div>
  );
}

function AttributeBadge({
  icon: Icon,
  label,
  value,
  verified,
  positive,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  verified?: boolean;
  positive?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg p-2.5 border border-gray-100">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs text-gray-400 uppercase tracking-wide">
          {label}
        </span>
        {verified && <BadgeCheck className="w-3 h-3 text-green-500" />}
      </div>
      <p
        className={`text-sm font-medium ${
          positive === false ? 'text-red-600' : 'text-gray-700'
        } truncate`}
      >
        {value}
      </p>
    </div>
  );
}

function TraitPill({
  icon: Icon,
  label,
  positive,
  negative,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  positive?: boolean;
  negative?: boolean;
}) {
  const colorClasses = positive
    ? 'bg-green-50 text-green-700 border-green-200'
    : negative
      ? 'bg-red-50 text-red-600 border-red-200'
      : 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClasses}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
