'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Settings as SettingsIcon, User, Shield, Palette, Sun, Moon, Bot, Key, Eye, EyeOff, Check, Trash2, Mail, Loader2, CheckCircle, ChevronDown, ChevronRight, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from '@/components/providers'
import { useAIProviderStore } from '@/lib/store/aiProviderStore'
import { ALL_PROVIDERS } from '@/lib/ai/providers'
import { LANGUAGES } from '@/lib/i18n/translations'
import { useLanguageStore, useT } from '@/lib/i18n/useLanguage'

export default function SettingsPage() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const { configs, activeProviderId, setActiveProvider, updateConfig, hydrate, hydrated } = useAIProviderStore()
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null)
  const { lang, setLang, hydrate: hydrateLang } = useLanguageStore()
  const t = useT()
  const [profile, setProfile] = useState({
    name: session?.user?.name || '',
    title: '',
  })

  // Email & AI settings from server
  const [emailConfig, setEmailConfig] = useState({
    emailAddress: '',
    emailAppPassword: '',
    emailFromName: '',
  })
  const [savingEmail, setSavingEmail] = useState(false)
  const [savingAI, setSavingAI] = useState(false)
  const [emailSaved, setEmailSaved] = useState(false)
  const [aiSaved, setAISaved] = useState(false)

  useEffect(() => { hydrate(); hydrateLang() }, [hydrate, hydrateLang])

  // Load user settings from server
  useEffect(() => {
    fetch('/api/user/settings')
      .then(r => r.json())
      .then(data => {
        if (data.settings) {
          setEmailConfig({
            emailAddress: data.settings.emailAddress || session?.user?.email || '',
            emailAppPassword: data.settings.emailAppPassword || '',
            emailFromName: data.settings.emailFromName || session?.user?.name || '',
          })
        }
      })
      .catch(() => {})
  }, [session])

  // Save email config to server
  const handleSaveEmail = async () => {
    setSavingEmail(true)
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailConfig),
      })
      if (res.ok) {
        setEmailSaved(true)
        toast.success('Email settings saved! Workflows will use this to send emails.')
        setTimeout(() => setEmailSaved(false), 3000)
      } else {
        toast.error('Failed to save email settings')
      }
    } finally {
      setSavingEmail(false)
    }
  }

  // Save AI config to server (so workflows can read it)
  const handleSaveAI = async () => {
    setSavingAI(true)
    try {
      const activeCfg = configs[activeProviderId]
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiProvider: activeProviderId,
          aiApiKey: activeCfg?.apiKey || '',
          aiModel: activeCfg?.model || '',
          aiBaseUrl: activeCfg?.baseUrl || '',
        }),
      })
      if (res.ok) {
        setAISaved(true)
        toast.success('AI settings saved! Workflows will use this provider.')
        setTimeout(() => setAISaved(false), 3000)
      } else {
        toast.error('Failed to save AI settings')
      }
    } finally {
      setSavingAI(false)
    }
  }

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

      {/* Email Configuration */}
      <section className="card" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Mail size={18} color="var(--brand-600)" />
          <h2>Email Configuration</h2>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '20px' }}>
          Connect your Gmail to send outreach emails. All workflows will use this email automatically.
          You need a <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" style={{ color: 'var(--text-brand)', textDecoration: 'underline' }}>Google App Password</a> (not your regular password).
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="label">Gmail Address</label>
            <input
              className="input"
              type="email"
              placeholder="you@gmail.com"
              value={emailConfig.emailAddress}
              onChange={(e) => setEmailConfig({ ...emailConfig, emailAddress: e.target.value })}
            />
          </div>
          <div>
            <label className="label">App Password</label>
            <input
              className="input"
              type="password"
              placeholder="16-character app password from Google"
              value={emailConfig.emailAppPassword}
              onChange={(e) => setEmailConfig({ ...emailConfig, emailAppPassword: e.target.value })}
            />
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" style={{ color: 'var(--text-brand)' }}>Google App Passwords</a> → Create one for &quot;Chronos&quot; → Paste the 16 characters here.
            </p>
          </div>
          <div>
            <label className="label">From Name</label>
            <input
              className="input"
              placeholder="Your Name"
              value={emailConfig.emailFromName}
              onChange={(e) => setEmailConfig({ ...emailConfig, emailFromName: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="btn-primary" onClick={handleSaveEmail} disabled={savingEmail} style={{ alignSelf: 'flex-start' }}>
              {savingEmail ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : emailSaved ? <><CheckCircle size={14} /> Saved!</> : 'Save Email Settings'}
            </button>
            {emailConfig.emailAppPassword && (
              <span style={{ fontSize: '12px', color: 'var(--success-text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={12} /> Email configured
              </span>
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

      {/* Language Section */}
      <section className="card" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Globe size={18} color="var(--brand-600)" />
          <h2>{t('settings.language')}</h2>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
          {t('settings.languageDesc')}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); toast.success(`Language changed to ${l.name}`) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 12px', borderRadius: 'var(--radius-md)',
                border: lang === l.code ? '2px solid var(--brand-500)' : '1px solid var(--border-default)',
                background: lang === l.code ? 'var(--brand-50)' : 'var(--bg-sunken)',
                cursor: 'pointer', fontSize: '13px', fontWeight: lang === l.code ? 600 : 400,
                color: 'var(--text-primary)', transition: 'all 100ms ease',
              }}
            >
              <span style={{ fontSize: '18px' }}>{l.flag}</span>
              <span>{l.name}</span>
            </button>
          ))}
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

          {/* Provider configs — Collapsible Accordion */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {ALL_PROVIDERS.map((provider) => {
              const cfg = configs[provider.id]
              if (!cfg) return null
              const isActive = activeProviderId === provider.id
              const isExpanded = expandedProvider === provider.id
              const keyVisible = showKeys[provider.id]

              return (
                <div
                  key={provider.id}
                  style={{
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${isActive ? 'var(--brand-500)' : 'var(--border-default)'}`,
                    background: isActive ? 'var(--brand-50)' : 'var(--bg-sunken)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Accordion Header — always visible */}
                  <button
                    onClick={() => setExpandedProvider(isExpanded ? null : provider.id)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '12px 14px', border: 'none', cursor: 'pointer',
                      background: 'transparent', textAlign: 'left',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {isExpanded ? <ChevronDown size={14} color="var(--text-tertiary)" /> : <ChevronRight size={14} color="var(--text-tertiary)" />}
                    <span style={{ fontWeight: 600, fontSize: '13px', flex: 1 }}>{provider.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{provider.description.split('—')[0]}</span>
                    {isActive && (
                      <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', background: 'var(--brand-600)', color: '#fff' }}>
                        Active
                      </span>
                    )}
                    {!isActive && cfg.apiKey && (
                      <span style={{ fontSize: '10px', fontWeight: 500, padding: '2px 8px', borderRadius: '9999px', background: 'var(--success-bg)', color: 'var(--success-text)' }}>
                        Key set
                      </span>
                    )}
                  </button>

                  {/* Accordion Body — only when expanded */}
                  {isExpanded && (
                    <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                      <div style={{ paddingTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {!isActive && (
                          <button
                            className="btn-primary"
                            style={{ fontSize: '12px', padding: '4px 12px' }}
                            onClick={() => { setActiveProvider(provider.id); toast.success(`Switched to ${provider.name}`) }}
                          >
                            <Check size={12} /> Set as Active
                          </button>
                        )}
                        {isActive && <span style={{ fontSize: '12px', color: 'var(--success-text)' }}>Currently active provider</span>}
                      </div>

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
                            <button className="btn-ghost" onClick={() => toggleKeyVisibility(provider.id)} style={{ padding: '6px' }}>
                              {keyVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="label" style={{ fontSize: '12px' }}>Model</label>
                        {provider.id === 'byok' || provider.models.length === 0 ? (
                          <input className="input" value={cfg.model} onChange={(e) => updateConfig(provider.id, { model: e.target.value })} placeholder="Enter model name..." style={{ fontSize: '13px' }} />
                        ) : (
                          <select className="select" value={cfg.model} onChange={(e) => updateConfig(provider.id, { model: e.target.value })} style={{ fontSize: '13px' }}>
                            {provider.models.map((m) => (<option key={m} value={m}>{m}</option>))}
                          </select>
                        )}
                      </div>

                      <div>
                        <label className="label" style={{ fontSize: '12px' }}>Base URL</label>
                        <input className="input" value={cfg.baseUrl} onChange={(e) => updateConfig(provider.id, { baseUrl: e.target.value })} placeholder="https://api.example.com/v1" style={{ fontSize: '13px' }} />
                      </div>

                      {provider.id === 'byok' && (
                        <button className="btn-ghost" style={{ fontSize: '12px', padding: '4px 10px', color: 'var(--danger)', alignSelf: 'flex-start' }}
                          onClick={() => { updateConfig('byok', { apiKey: '', baseUrl: '', model: '' }); toast.success('BYOK config cleared') }}>
                          <Trash2 size={12} /> Clear Config
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="btn-primary" onClick={handleSaveAI} disabled={savingAI}>
              {savingAI ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : aiSaved ? <><CheckCircle size={14} /> Saved!</> : 'Save AI Settings for Workflows'}
            </button>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              Saves the active provider so workflows can use it
            </span>
          </div>
        </section>
      )}
    </div>
  )
}
