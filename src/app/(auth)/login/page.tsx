'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Rocket, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
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
      if (isLogin) {
        const res = await signIn('credentials', {
          email: form.email,
          password: form.password,
          redirect: false,
        })

        if (res?.error) {
          setError(res.error)
        } else {
          router.push('/dashboard')
          router.refresh()
        }
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Registration failed')
        } else {
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
        }
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: '400px' }}>
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
          {isLogin ? 'Welcome back' : 'Create your account'}
        </h1>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
          {isLogin ? 'Sign in to your workspace' : 'Get started with your startup workspace'}
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
            {!isLogin && (
              <div>
                <label className="label" htmlFor="name">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input id="name" className="input" type="text" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ paddingLeft: '38px' }} required={!isLogin} />
                </div>
              </div>
            )}

            <div>
              <label className="label" htmlFor="email">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input id="email" className="input" type="email" placeholder="you@startup.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ paddingLeft: '38px' }} required />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input id="password" className="input" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ paddingLeft: '38px' }} required minLength={6} />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '24px', height: '42px' }}>
            {loading ? (
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <>
                {isLogin ? 'Sign in' : 'Create account'}
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Toggle */}
      <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-tertiary)' }}>
        {isLogin ? "Don't have an account? " : 'Already have an account? '}
        <button
          type="button"
          onClick={() => { setIsLogin(!isLogin); setError('') }}
          style={{ background: 'none', border: 'none', color: 'var(--text-brand)', cursor: 'pointer', fontWeight: 500, fontSize: 'inherit' }}
        >
          {isLogin ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  )
}
