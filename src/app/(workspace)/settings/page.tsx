'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Settings as SettingsIcon, User, Shield, Palette, Sun, Moon } from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from '@/components/providers'

export default function SettingsPage() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [profile, setProfile] = useState({
    name: session?.user?.name || '',
    title: '',
  })

  const handleSaveProfile = async () => {
    toast.success('Profile updated!')
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '700px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: 'var(--gray-100)', borderRadius: 'var(--radius-md)' }}>
          <SettingsIcon size={20} color="var(--text-tertiary)" />
        </div>
        <h1>Settings</h1>
      </div>

      {/* Profile Section */}
      <section className="card" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <User size={18} color="var(--brand-600)" />
          <h2>Profile</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="label">Display Name</label>
            <input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Job Title</label>
            <input className="input" placeholder="e.g. Lead Developer" value={profile.title} onChange={(e) => setProfile({ ...profile, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" value={session?.user?.email || ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
          </div>
          <button className="btn-primary" onClick={handleSaveProfile} style={{ alignSelf: 'flex-start' }}>
            Save Profile
          </button>
        </div>
      </section>

      {/* Account Section */}
      <section className="card" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Shield size={18} color="var(--brand-600)" />
          <h2>Account</h2>
        </div>
        <div>
          <label className="label">Role</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`badge ${session?.user?.role === 'admin' ? 'badge-primary' : 'badge-neutral'}`}>
              {session?.user?.role || 'member'}
            </span>
            {session?.user?.role === 'admin' && (
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Full access to team management and settings</span>
            )}
          </div>
        </div>
      </section>

      {/* Theme Section — Pill Switcher */}
      <section className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Palette size={18} color="var(--brand-600)" />
          <h2>Appearance</h2>
        </div>
        <div>
          <label className="label" style={{ marginBottom: '10px' }}>Theme</label>
          <div className="theme-toggle">
            <button
              className={`theme-toggle-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => setTheme('light')}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Sun size={14} /> Light
              </span>
            </button>
            <button
              className={`theme-toggle-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme('dark')}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Moon size={14} /> Dark
              </span>
            </button>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
            Theme preference is saved in your browser.
          </p>
        </div>
      </section>
    </div>
  )
}
