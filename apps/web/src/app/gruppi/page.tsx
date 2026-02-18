'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
  Loader2,
  Crown,
  Clock,
  Check,
  X,
  MessageCircle,
} from 'lucide-react';
import type { GroupSummary, ApiResponse } from '@roommate/shared';

interface PendingInvitation {
  membershipId: string;
  group: {
    id: string;
    name: string | null;
    description: string | null;
    memberCount: number;
  };
  invitedBy: {
    id: string;
    name: string;
    avatar: string | null;
  };
  createdAt: string;
}

export default function GruppiPage() {
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  async function fetchData() {
    try {
      const [groupsRes, invitationsRes] = await Promise.all([
        fetch('/api/groups'),
        fetch('/api/groups/invitations'),
      ]);

      const groupsJson: ApiResponse<GroupSummary[]> = await groupsRes.json();
      const invitationsJson: ApiResponse<PendingInvitation[]> = await invitationsRes.json();

      if (groupsJson.success && groupsJson.data) {
        setGroups(groupsJson.data);
      }
      if (invitationsJson.success && invitationsJson.data) {
        setInvitations(invitationsJson.data);
      }
    } catch {
      setError('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleInvitationResponse(
    groupId: string,
    membershipId: string,
    action: 'accept' | 'decline'
  ) {
    setRespondingTo(membershipId);
    try {
      const res = await fetch(`/api/groups/${groupId}/members/${membershipId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const json: ApiResponse<null> = await res.json();

      if (json.success) {
        // Refresh data
        setLoading(true);
        await fetchData();
      } else {
        setError(json.error || 'Errore nella risposta');
      }
    } catch {
      setError('Errore nella risposta all\'invito');
    } finally {
      setRespondingTo(null);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">I miei gruppi</h1>
          <p className="text-gray-500 mt-1">
            Forma il tuo gruppo di coinquilini e cercate casa insieme
          </p>
        </div>
        <Link
          href="/gruppi/crea"
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Crea gruppo
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-xl text-red-700">{error}</div>
      )}

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Inviti in sospeso
          </h2>
          <div className="space-y-3">
            {invitations.map((inv) => (
              <div
                key={inv.membershipId}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {inv.group.name || 'Gruppo senza nome'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Invitato da {inv.invitedBy.name} &middot;{' '}
                    {inv.group.memberCount} membr{inv.group.memberCount === 1 ? 'o' : 'i'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleInvitationResponse(inv.group.id, inv.membershipId, 'accept')
                    }
                    disabled={respondingTo === inv.membershipId}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    Accetta
                  </button>
                  <button
                    onClick={() =>
                      handleInvitationResponse(inv.group.id, inv.membershipId, 'decline')
                    }
                    disabled={respondingTo === inv.membershipId}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Rifiuta
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Groups List */}
      {groups.length === 0 && invitations.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Nessun gruppo</p>
          <p className="text-gray-400 text-sm mt-1">
            Crea un gruppo per cercare casa con i tuoi futuri coinquilini
          </p>
          <Link
            href="/gruppi/crea"
            className="inline-flex items-center gap-2 mt-4 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Crea il tuo primo gruppo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => {
            const acceptedMembers = group.members.filter((m) => m.status === 'ACCEPTED');
            return (
              <Link
                key={group.id}
                href={`/gruppi/${group.id}`}
                className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {group.name || 'Gruppo senza nome'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {group.memberCount}/{group.maxMembers} membri
                        {group.pendingCount > 0 && (
                          <span className="text-amber-600 ml-2">
                            ({group.pendingCount} in attesa)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  {group.conversationId && (
                    <MessageCircle className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {group.description && (
                  <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                    {group.description}
                  </p>
                )}

                {/* Member Avatars */}
                <div className="flex items-center gap-1 mt-4">
                  {acceptedMembers.slice(0, 5).map((member) => {
                    const isOwner = member.role === 'OWNER';
                    return (
                      <div key={member.userId} className="relative">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                            isOwner
                              ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-300'
                              : 'bg-primary-100 text-primary-700'
                          }`}
                        >
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            member.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        {isOwner && (
                          <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1" />
                        )}
                      </div>
                    );
                  })}
                  {acceptedMembers.length > 5 && (
                    <span className="text-xs text-gray-400 ml-1">
                      +{acceptedMembers.length - 5}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
