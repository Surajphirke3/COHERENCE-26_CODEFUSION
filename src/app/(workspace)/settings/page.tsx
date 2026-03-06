'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Settings as SettingsIcon, User, Shield, Palette, Sun, Moon, Bot, Key, Eye, EyeOff, Check, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from '@/components/providers'
import { useAIProviderStore } from '@/lib/store/aiProviderStore'
import { ALL_PROVIDERS } from '@/lib/ai/providers'

export default function SettingsPage() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const { configs, activeProviderId, setActiveProvider, updateConfig, hydrate, hydrated } = useAIProviderStore()
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [profile, setProfile] = useState({
    name: session?.user?.name || '',
    title: '',
  })

  useEffect(() => { hydrate() }, [hydrate])

  const handleSaveProfile = async () => {
    toast.success('Profile updated!')
  }

  const toggleKeyVisibility = (id: string) => setShowKeys((s) => ({ ...s, [id]: !s[id] }))

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
      <section className="card" style={{ padding: '24px', marginBottom: '20px' }}>
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

      {/* AI Providers Section */}
      {hydrated && (
        <section className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Bot size={18} color="var(--brand-600)" />
            <h2>AI Providers</h2>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '20px' }}>
            Configure API keys and select your preferred AI provider. All keys are stored locally in your browser.
          </p>

          {/* Active provider selector */}
          <div style={{ marginBottom: '20px' }}>
            <label className="label">Active Provider</label>
            <select
              className="select"
              value={activeProviderId}
              onChange={(e) => {
                setActiveProvider(e.target.value)
                toast.success(`Switched to ${ALL_PROVIDERS.find(p => p.id === e.target.value)?.name}`)
              }}
            >
              {ALL_PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Provider configs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {ALL_PROVIDERS.map((provider) => {
              const cfg = configs[provider.id]
              if (!cfg) return null
              const isActive = activeProviderId === provider.id
              const keyVisible = showKeys[provider.id]

              return (
                <div
                  key={provider.id}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${isActive ? 'var(--brand-500)' : 'var(--border-default)'}`,
                    background: isActive ? 'color-mix(in srgb, var(--brand-50) 30%, transparent)' : 'var(--bg-surface)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{provider.name}</span>
                      {isActive && (
                        <span style={{
                          fontSize: '10px', fontWeight: 600, padding: '2px 8px',
                          borderRadius: '9999px', background: 'var(--brand-600)', color: '#fff',
                        }}>
                          Active
                        </span>
                      )}
                    </div>
                    {!isActive && (
                      <button
                        className="btn-ghost"
                        style={{ fontSize: '12px', padding: '4px 10px' }}
                        onClick={() => { setActiveProvider(provider.id); toast.success(`Switched to ${provider.name}`) }}
                      >
                        <Check size={12} /> Use
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>{provider.description}</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {provider.requiresApiKey && (
                      <div>
                        <label className="label" style={{ fontSize: '12px' }}>
                          <Key size={11} style={{ display: 'inline', marginRight: '4px' }} />
                          API Key
                        </label>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input
                            className="input"
                            type={keyVisible ? 'text' : 'password'}
                            placeholder={`Enter ${provider.name} API key...`}
                            value={cfg.apiKey}
                            onChange={(e) => updateConfig(provider.id, { apiKey: e.target.value })}
                            style={{ flex: 1, fontSize: '13px' }}
                          />
                          <button
                            className="btn-ghost"
                            onClick={() => toggleKeyVisibility(provider.id)}
                            style={{ padding: '6px' }}
                            title={keyVisible ? 'Hide key' : 'Show key'}
                          >
                            {keyVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="label" style={{ fontSize: '12px' }}>Base URL</label>
                      <input
                        className="input"
                        value={cfg.baseUrl}
                        onChange={(e) => updateConfig(provider.id, { baseUrl: e.target.value })}
                        placeholder="https://api.example.com/v1"
                        style={{ fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label className="label" style={{ fontSize: '12px' }}>Model</label>
                      {provider.id === 'byok' || provider.models.length === 0 ? (
                        <input
                          className="input"
                          value={cfg.model}
                          onChange={(e) => updateConfig(provider.id, { model: e.target.value })}
                          placeholder="Enter model name..."
                          style={{ fontSize: '13px' }}
                        />
                      ) : (
                        <select
                          className="select"
                          value={cfg.model}
                          onChange={(e) => updateConfig(provider.id, { model: e.target.value })}
                          style={{ fontSize: '13px' }}
                        >
                          {provider.models.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    {provider.id === 'byok' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn-ghost"
                          style={{ fontSize: '12px', padding: '4px 10px', color: 'var(--danger)' }}
                          onClick={() => {
                            updateConfig('byok', { apiKey: '', baseUrl: '', model: '' })
                            toast.success('BYOK config cleared')
                          }}
                        >
                          <Trash2 size={12} /> Clear BYOK Config
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
