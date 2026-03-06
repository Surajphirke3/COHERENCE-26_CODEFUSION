// src/app/(dashboard)/settings/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { Mail, Shield, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/contexts/toast-context';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Member = {
  role: string;
  joinedAt: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    lastLoginAt?: string;
  } | null;
};

const TEAM_ROLES = ['admin', 'manager', 'sdr', 'viewer'] as const;

export default function SettingsPage() {
  const { addToast } = useToast();
  const { data, isLoading, mutate } = useSWR('/api/team', fetcher);
  const members: Member[] = data?.members || [];
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('sdr');
  const [isInviting, setIsInviting] = useState(false);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || 'Invite failed');
      }
      addToast('Team member invited', 'success');
      setInviteEmail('');
      mutate();
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to invite member', 'error');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleUpdate = async (memberId: string, role: string) => {
    setUpdatingRoleId(memberId);
    try {
      const res = await fetch(`/api/team/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || 'Failed to update role');
      }
      addToast('Role updated', 'success');
      mutate();
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to update role', 'error');
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setRemovingMemberId(memberId);
    try {
      const res = await fetch(`/api/team/${memberId}`, { method: 'DELETE' });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || 'Failed to remove member');
      }
      addToast('Member removed', 'success');
      mutate();
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to remove member', 'error');
    } finally {
      setRemovingMemberId(null);
    }
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your team and sending configuration" />

      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Team Members</h3>
          {isLoading ? (
            <Skeleton variant="card" className="h-52" />
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No team members yet.</p>
          ) : (
            <div className="space-y-2">
              {members.map((member, index) => (
                <div key={`${member.user?.email || index}`} className="flex items-center justify-between rounded-lg border border-border bg-white/2 p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{member.user?.name || 'Pending User'}</p>
                    <p className="text-xs text-muted-foreground">{member.user?.email || 'No email'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge size="sm" status={member.user?.isActive === false ? 'failed' : 'active'}>
                      {member.user?.isActive === false ? 'Inactive' : 'Active'}
                    </Badge>
                    {member.user?._id ? (
                      <select
                        value={member.role}
                        onChange={(e) =>
                          TEAM_ROLES.includes(e.target.value as (typeof TEAM_ROLES)[number]) &&
                          handleRoleUpdate(member.user!._id, e.target.value)
                        }
                        disabled={updatingRoleId === member.user._id || member.role === 'owner'}
                        className="h-8 rounded-md border border-border bg-card px-2 text-xs text-foreground outline-none transition-colors hover:border-border-hover focus:border-accent disabled:opacity-60"
                      >
                        {member.role === 'owner' && <option value="owner">owner</option>}
                        {TEAM_ROLES.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    ) : (
                      <Badge size="sm" status="default">{member.role}</Badge>
                    )}
                    {member.user?._id && member.role !== 'owner' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={removingMemberId === member.user._id}
                        icon={<Trash2 size={13} />}
                        onClick={() => handleRemoveMember(member.user!._id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Invite Member</h3>
          <div className="space-y-3">
            <Input
              label="Email"
              type="email"
              placeholder="name@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              startIcon={<Mail size={14} />}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors hover:border-border-hover focus:border-accent"
              >
                {TEAM_ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <Button className="w-full" loading={isInviting} onClick={handleInvite}>
              Send Invite
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-3">
          <h3 className="mb-2 text-sm font-semibold text-foreground">Safety & Sending</h3>
          <p className="text-sm text-muted-foreground">
            Configure daily limits, delay windows, and bounce protection from Safety settings.
          </p>
          <div className="mt-4">
            <Link href="/safety">
              <Button variant="secondary" icon={<Shield size={16} />}>Open Safety Settings</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
