'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Rocket, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      // Auto-login after successful registration
      const loginRes = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (loginRes?.error) {
        setError(loginRes.error)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: '560px' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            background: 'var(--brand-50)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '16px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Rocket size={26} color="var(--brand-600)" />
        </div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '8px', fontFamily: "'Fraunces', serif" }}>
          Create your account
        </h1>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
          Get started with your startup workspace
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="card" style={{ padding: '28px', marginBottom: '16px', boxShadow: 'var(--shadow-lg)' }}>
          {error && (
            <div
              style={{
                padding: '10px 14px',
                background: 'var(--danger-bg)',
                color: 'var(--danger-text)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                marginBottom: '20px',
                borderLeft: '3px solid var(--danger)',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="label" htmlFor="name">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--l-text-secondary, var(--text-tertiary))' }} />
                <input id="name" className="input" type="text" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ padding: '12px 14px 12px 42px', fontSize: '15px' }} required />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="email">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--l-text-secondary, var(--text-tertiary))' }} />
                <input id="email" className="input" type="email" placeholder="you@startup.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ padding: '12px 14px 12px 42px', fontSize: '15px' }} required />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--l-text-secondary, var(--text-tertiary))' }} />
                <input id="password" className="input" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ padding: '12px 14px 12px 42px', fontSize: '15px' }} required minLength={6} />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '24px', height: '42px' }}>
            {loading ? (
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <>
                Create account
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Toggle */}
      <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-tertiary)' }}>
        Already have an account?{' '}
        <Link
          href="/login"
          style={{ color: 'var(--text-brand)', fontWeight: 500, textDecoration: 'none' }}
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
