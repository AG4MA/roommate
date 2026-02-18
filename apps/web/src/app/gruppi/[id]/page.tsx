'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Crown,
  ArrowLeft,
  Loader2,
  Mail,
  UserMinus,
  Trash2,
  LogOut,
  MessageCircle,
  Clock,
  Check,
  X,
} from 'lucide-react';
import type { GroupDetail, GroupMember, ApiResponse } from '@roommate/shared';
import { getGroupRoleLabel, getGroupMemberStatusLabel } from '@roommate/shared';
import { TenantProfileCard } from '@/components/room/TenantProfileCard';

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Determine current user's role from the group members
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user session
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((session) => {
        if (session?.user?.id) {
          setCurrentUserId(session.user.id);
        }
      });
  }, []);

  async function fetchGroup() {
    try {
      const res = await fetch(`/api/groups/${id}`);
      const json: ApiResponse<GroupDetail> = await res.json();

      if (json.success && json.data) {
        setGroup(json.data);
      } else {
        setError(json.error || 'Gruppo non trovato');
      }
    } catch {
      setError('Errore nel caricamento del gruppo');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) fetchGroup();
  }, [id]);

  const currentMember = group?.members.find((m) => m.userId === currentUserId);
  const isOwner = currentMember?.role === 'OWNER';
  const acceptedMembers = group?.members.filter((m) => m.status === 'ACCEPTED') || [];
  const pendingMembers = group?.members.filter((m) => m.status === 'PENDING') || [];

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setError(null);

    try {
      const res = await fetch(`/api/groups/${id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      const json: ApiResponse<{ membershipId: string }> = await res.json();

      if (json.success) {
        setInviteEmail('');
        await fetchGroup();
      } else {
        setError(json.error || 'Errore nell\'invio dell\'invito');
      }
    } catch {
      setError('Errore nell\'invio dell\'invito');
    } finally {
      setInviting(false);
    }
  }

  async function handleRemoveMember(member: GroupMember) {
    const isSelf = member.userId === currentUserId;
    const label = isSelf ? 'lasciare il gruppo' : `rimuovere ${member.name}`;
    if (!confirm(`Sei sicuro di voler ${label}?`)) return;

    setActionLoading(member.id);
    try {
      const res = await fetch(`/api/groups/${id}/members/${member.id}`, {
        method: 'DELETE',
      });
      const json: ApiResponse<null> = await res.json();

      if (json.success) {
        if (isSelf) {
          router.push('/gruppi');
        } else {
          await fetchGroup();
        }
      } else {
        setError(json.error || 'Errore nella rimozione');
      }
    } catch {
      setError('Errore nella rimozione del membro');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDissolve() {
    if (!confirm('Sei sicuro di voler sciogliere il gruppo? Questa azione è irreversibile.'))
      return;

    setActionLoading('dissolve');
    try {
      const res = await fetch(`/api/groups/${id}`, { method: 'DELETE' });
      const json: ApiResponse<null> = await res.json();

      if (json.success) {
        router.push('/gruppi');
      } else {
        setError(json.error || 'Errore nello scioglimento');
      }
    } catch {
      setError('Errore nello scioglimento del gruppo');
    } finally {
      setActionLoading(null);
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

  if (!group) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">{error || 'Gruppo non trovato'}</p>
          <Link
            href="/gruppi"
            className="inline-flex items-center gap-1.5 mt-4 text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna ai gruppi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/gruppi"
        className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Torna ai gruppi
      </Link>

      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-xl text-red-700">{error}</div>
      )}

      {/* Group Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
              <Users className="w-7 h-7 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {group.name || 'Gruppo senza nome'}
              </h1>
              <p className="text-gray-500">
                {group.memberCount}/{group.maxMembers} membri
              </p>
            </div>
          </div>
          {group.conversationId && (
            <Link
              href={`/messaggi`}
              className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              Chat del gruppo
            </Link>
          )}
        </div>
        {group.description && (
          <p className="text-gray-600 mt-4">{group.description}</p>
        )}
      </div>

      {/* Invite Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary-600" />
          Invita un membro
        </h2>
        <form onSubmit={handleInvite} className="flex gap-3">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Email dell'inquilino da invitare"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
          <button
            type="submit"
            disabled={inviting || !inviteEmail.trim()}
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {inviting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Invita'
            )}
          </button>
        </form>
      </div>

      {/* Pending Invitations */}
      {pendingMembers.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Inviti in sospeso ({pendingMembers.length})
          </h2>
          <div className="space-y-3">
            {pendingMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-amber-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-amber-700">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{member.name}</p>
                    <p className="text-xs text-amber-600">
                      {getGroupMemberStatusLabel(member.status)}
                    </p>
                  </div>
                </div>
                {isOwner && (
                  <button
                    onClick={() => handleRemoveMember(member)}
                    disabled={actionLoading === member.id}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Annulla invito"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accepted Members */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-500" />
          Membri ({acceptedMembers.length})
        </h2>
        <div className="space-y-4">
          {acceptedMembers.map((member) => (
            <div key={member.id}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">{member.name}</span>
                  {member.role === 'OWNER' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full font-medium">
                      <Crown className="w-3 h-3" />
                      {getGroupRoleLabel(member.role)}
                    </span>
                  )}
                </div>
                {/* Owner can remove others; anyone can leave */}
                {currentUserId &&
                  member.userId !== currentUserId &&
                  isOwner && (
                    <button
                      onClick={() => handleRemoveMember(member)}
                      disabled={actionLoading === member.id}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                      Rimuovi
                    </button>
                  )}
              </div>
              {member.tenantProfile && (
                <TenantProfileCard tenant={member.tenantProfile} compact />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
        <h2 className="text-lg font-semibold text-red-700 mb-4">Zona pericolosa</h2>
        <div className="flex flex-wrap gap-3">
          {currentMember && (
            <button
              onClick={() => handleRemoveMember(currentMember)}
              disabled={actionLoading === currentMember.id}
              className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              Lascia il gruppo
            </button>
          )}
          {isOwner && (
            <button
              onClick={handleDissolve}
              disabled={actionLoading === 'dissolve'}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Sciogli il gruppo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
