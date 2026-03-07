'use client'

import { useTeam } from '@/lib/hooks/useTeam'
import { useSession } from 'next-auth/react'
import { Shield, User, Mail } from 'lucide-react'
import { useT } from '@/lib/i18n/useLanguage'
import { getInitials } from '@/lib/utils/format'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { toast } from 'sonner'

export default function TeamPage() {
  const t = useT()
  const { members, isLoading, mutate } = useTeam()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await fetch('/api/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })
      toast.success('Role updated!')
      mutate()
    } catch {
      toast.error('Failed to update role')
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h1>{t('team.title')}</h1>
      </div>
      <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', marginBottom: '32px' }}>
        {members.length} member{members.length !== 1 ? 's' : ''} in your workspace
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {members.map((member, i) => (
          <div
            key={member._id}
            className="card stagger-item"
            style={{ padding: '24px', animationDelay: `${i * 60}ms` }}
          >
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              {/* Avatar with online indicator */}
              <div style={{ position: 'relative' }}>
                <div className="avatar avatar-xl">{getInitials(member.name)}</div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: '1px',
                    right: '1px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#16a34a',
                    border: '2px solid var(--bg-elevated)',
                  }}
                />
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{member.name}</h3>
                  <span
                    className={`badge ${member.role === 'admin' ? 'badge-primary' : 'badge-neutral'}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    {member.role === 'admin' ? <Shield size={10} /> : <User size={10} />}
                    {member.role}
                  </span>
                </div>

                {member.title && (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {member.title}
                  </p>
                )}

                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={12} /> {member.email}
                </p>

                {/* Admin controls */}
                {isAdmin && member._id !== session?.user?.id && (
                  <div style={{ marginTop: '12px' }}>
                    <select
                      className="select"
                      value={member.role}
                      onChange={(e) => handleRoleChange(member._id, e.target.value)}
                      style={{ width: 'auto', padding: '4px 10px', fontSize: '12px' }}
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
