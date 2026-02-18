'use client';

import { Users, Crown } from 'lucide-react';
import type { GroupDetail } from '@roommate/shared';
import { TenantProfileCard } from '@/components/room/TenantProfileCard';

interface GroupProfileCardProps {
  group: GroupDetail;
  compact?: boolean;
}

export function GroupProfileCard({ group, compact = false }: GroupProfileCardProps) {
  const acceptedMembers = group.members.filter((m) => m.status === 'ACCEPTED');

  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
      {/* Group Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <Users className="w-5 h-5 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800 truncate">
            {group.name || 'Gruppo senza nome'}
          </h4>
          <p className="text-sm text-gray-500">
            {acceptedMembers.length} membr{acceptedMembers.length === 1 ? 'o' : 'i'}
          </p>
        </div>
        <span className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs rounded-full font-medium">
          Gruppo
        </span>
      </div>

      {group.description && (
        <p className="text-sm text-gray-600 mb-4">{group.description}</p>
      )}

      {/* Members Grid */}
      <div className={`flex gap-4 overflow-x-auto pb-2 ${compact ? '' : '-mx-2 px-2'}`}>
        {acceptedMembers.map((member) => (
          <div key={member.userId} className="min-w-[280px] flex-shrink-0 relative">
            {member.role === 'OWNER' && (
              <div className="absolute -top-1 -right-1 z-10 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center border-2 border-white">
                <Crown className="w-3 h-3 text-amber-600" />
              </div>
            )}
            {member.tenantProfile ? (
              <TenantProfileCard tenant={member.tenantProfile} compact />
            ) : (
              <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-semibold text-gray-400">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="font-medium text-gray-700">{member.name}</p>
                <p className="text-xs text-gray-400 mt-1">Profilo non completato</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
