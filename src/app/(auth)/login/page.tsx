'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Rocket, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'

import { useTheme } from '@/components/landing-v2/ThemeContext'

export default function LoginPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
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
            background: 'var(--l-bg-card)',
            borderRadius: '16px',
            marginBottom: '16px',
            border: '1px solid var(--l-border)',
          }}
        >
          <Rocket size={26} color="var(--l-accent)" />
        </div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '8px', fontFamily: "'Fraunces', serif", color: 'var(--l-text)' }}>
          {isLogin ? 'Welcome back' : 'Create your account'}
        </h1>
        <p style={{ color: 'var(--l-text-tertiary)', fontSize: '14px' }}>
          {isLogin ? 'Sign in to your workspace' : 'Get started with your startup workspace'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="card" style={{ padding: '40px', marginBottom: '20px', background: 'var(--l-bg-card)', border: '1px solid var(--l-border)', borderRadius: '18px', backdropFilter: 'blur(20px)' }}>
          {error && (
            <div
              style={{
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '20px',
                borderLeft: '3px solid #ef4444',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {!isLogin && (
              <div>
                <label className="label" htmlFor="name" style={{ color: 'var(--l-text-secondary)' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--l-text-secondary)' }} />
                  <input id="name" className="input" type="text" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ paddingLeft: '42px', padding: '12px 14px 12px 42px', fontSize: '15px', background: 'var(--l-bg-card)', color: 'var(--l-text)', border: '1px solid var(--l-border)' }} required={!isLogin} />
                </div>
              </div>
            )}

            <div>
              <label className="label" htmlFor="email" style={{ color: 'var(--l-text-secondary)' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--l-text-secondary)' }} />
                <input id="email" className="input" type="email" placeholder="you@startup.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ paddingLeft: '42px', padding: '12px 14px 12px 42px', fontSize: '15px', background: 'var(--l-bg-card)', color: 'var(--l-text)', border: '1px solid var(--l-border)' }} required />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password" style={{ color: 'var(--l-text-secondary)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--l-text-secondary)' }} />
                <input id="password" className="input" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ paddingLeft: '42px', padding: '12px 14px 12px 42px', fontSize: '15px', background: 'var(--l-bg-card)', color: 'var(--l-text)', border: '1px solid var(--l-border)' }} required minLength={6} />
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

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0 4px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--l-border)' }} />
            <span style={{ fontSize: '12px', color: 'var(--l-text-tertiary)', whiteSpace: 'nowrap' }}>or continue with</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--l-border)' }} />
          </div>

          {/* Google Sign-In via Firebase */}
          <button
            type="button"
            disabled={googleLoading}
            onClick={async () => {
              setGoogleLoading(true)
              setError('')
              try {
                const result = await signInWithPopup(auth, googleProvider)
                const firebaseUser = result.user

                // Pass Firebase user data to NextAuth's firebase-google provider
                const res = await signIn('firebase-google', {
                  email: firebaseUser.email || '',
                  name: firebaseUser.displayName || '',
                  avatar: firebaseUser.photoURL || '',
                  redirect: false,
                })

                if (res?.error) {
                  setError(res.error)
                } else {
                  router.push('/dashboard')
                  router.refresh()
                }
              } catch (err: any) {
                if (err.code !== 'auth/popup-closed-by-user') {
                  setError(err.message || 'Google sign-in failed')
                }
              } finally {
                setGoogleLoading(false)
              }
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '10px',
              border: '1px solid var(--l-border)',
              borderRadius: '8px',
              background: 'var(--l-bg-card)',
              cursor: googleLoading ? 'wait' : 'pointer',
              fontSize: '13.5px',
              fontWeight: 500,
              color: 'var(--l-text)',
              transition: 'background 120ms ease, border-color 120ms ease',
              marginTop: '8px',
              opacity: googleLoading ? 0.7 : 1,
            }}
            onMouseOver={(e) => { if (!googleLoading) { e.currentTarget.style.background = 'var(--l-bg-card-hover)'; e.currentTarget.style.borderColor = 'var(--l-border-hover)' } }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'var(--l-bg-card)'; e.currentTarget.style.borderColor = 'var(--l-border)' }}
          >
            {googleLoading ? (
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {googleLoading ? 'Signing in...' : 'Continue with Google'}
          </button>
        </div>
      </form>

      {/* Toggle */}
      <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--l-text-tertiary)' }}>
        {isLogin ? "Don't have an account? " : 'Already have an account? '}
        <button
          type="button"
          onClick={() => { setIsLogin(!isLogin); setError('') }}
          style={{ background: 'none', border: 'none', color: 'var(--l-accent)', cursor: 'pointer', fontWeight: 500, fontSize: 'inherit' }}
        >
          {isLogin ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  )
}
