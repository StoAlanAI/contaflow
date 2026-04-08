'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, LogIn, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

type Vista = 'login' | 'recuperar' | 'enviado'

export default function LoginPage() {
  const router = useRouter()
  const [vista, setVista] = useState<Vista>('login')

  // Login
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Recuperar contraseña
  const [emailRecuperar, setEmailRecuperar] = useState('')
  const [loadingRecuperar, setLoadingRecuperar] = useState(false)
  const [errorRecuperar, setErrorRecuperar] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Email o contraseña incorrectos.')
      setLoading(false)
      return
    }

    // Asegurar que existe el profile (crea si falta, usa service role en servidor)
    const res = await fetch('/api/ensure-profile', { method: 'POST' })
    const data = await res.json()

    if (!res.ok || !data.rol) {
      setError('Error al cargar tu cuenta. Intentá de nuevo.')
      setLoading(false)
      return
    }

    router.push(data.rol === 'contador' ? '/dashboard' : '/mi-cuenta')
    router.refresh()
  }

  async function handleRecuperar(e: React.FormEvent) {
    e.preventDefault()
    setLoadingRecuperar(true)
    setErrorRecuperar('')

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(emailRecuperar, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (resetError) {
      setErrorRecuperar('No se pudo enviar el email. Verificá la dirección.')
      setLoadingRecuperar(false)
      return
    }

    setLoadingRecuperar(false)
    setVista('enviado')
  }

  const Logo = () => (
    <div className="inline-flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #C49A3C, #A07D28)' }}>
        <span className="text-black font-bold text-sm font-mono">CF</span>
      </div>
      <span className="font-playfair text-xl font-semibold tracking-wide"
        style={{ color: '#C49A3C' }}>ContaFlow</span>
    </div>
  )

  // ── Vista: login ─────────────────────────────────────────────
  if (vista === 'login') return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-up" style={{ opacity: 0 }}>
        <div className="text-center mb-10">
          <Logo />
          <h1 className="font-playfair text-3xl font-semibold text-white mb-2">
            Bienvenido de vuelta
          </h1>
          <p className="text-sm" style={{ color: 'rgba(244,244,245,0.45)' }}>
            Ingresá a tu panel de gestión financiera
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-widest"
                style={{ color: 'rgba(244,244,245,0.5)' }}>Email</label>
              <input type="email" className="input-field" placeholder="tu@email.com"
                value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium uppercase tracking-widest"
                  style={{ color: 'rgba(244,244,245,0.5)' }}>Contraseña</label>
                <button type="button" onClick={() => { setEmailRecuperar(email); setVista('recuperar') }}
                  className="text-xs transition-colors"
                  style={{ color: 'rgba(196,154,60,0.7)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#C49A3C')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(196,154,60,0.7)')}>
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input-field pr-10"
                  placeholder="••••••••••" value={password}
                  onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(244,244,245,0.4)' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm px-3 py-2 rounded-lg"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-gold w-full flex items-center justify-center gap-2 py-3">
              {loading
                ? <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                : <><LogIn size={15} />Ingresar</>}
            </button>
          </form>

          <div className="gold-divider my-6" />

          <p className="text-center text-sm" style={{ color: 'rgba(244,244,245,0.4)' }}>
            ¿Sos contador y no tenés cuenta?{' '}
            <Link href="/registro" className="font-medium transition-colors hover:opacity-80"
              style={{ color: '#C49A3C' }}>
              Registrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )

  // ── Vista: recuperar contraseña ──────────────────────────────
  if (vista === 'recuperar') return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-up" style={{ opacity: 0 }}>
        <div className="text-center mb-10">
          <Logo />
          <h1 className="font-playfair text-3xl font-semibold text-white mb-2">
            Recuperar contraseña
          </h1>
          <p className="text-sm" style={{ color: 'rgba(244,244,245,0.45)' }}>
            Te enviamos un link para crear una nueva contraseña
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleRecuperar} className="space-y-5">
            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-widest"
                style={{ color: 'rgba(244,244,245,0.5)' }}>Tu email</label>
              <input type="email" className="input-field" placeholder="tu@email.com"
                value={emailRecuperar} onChange={e => setEmailRecuperar(e.target.value)}
                required autoFocus />
            </div>

            {errorRecuperar && (
              <div className="text-sm px-3 py-2 rounded-lg"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444' }}>
                {errorRecuperar}
              </div>
            )}

            <button type="submit" className="btn-gold w-full flex items-center justify-center gap-2 py-3">
              {loadingRecuperar
                ? <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                : <><Mail size={15} />Enviar link de recuperación</>}
            </button>
          </form>

          <div className="gold-divider my-6" />

          <button onClick={() => setVista('login')}
            className="w-full flex items-center justify-center gap-2 text-sm transition-colors"
            style={{ color: 'rgba(244,244,245,0.4)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#C49A3C')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,244,245,0.4)')}>
            <ArrowLeft size={13} />
            Volver al login
          </button>
        </div>
      </div>
    </div>
  )

  // ── Vista: email enviado ─────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center animate-fade-up" style={{ opacity: 0 }}>
        <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <CheckCircle2 size={28} style={{ color: '#22C55E' }} />
        </div>
        <h1 className="font-playfair text-3xl font-semibold text-white mb-2">
          ¡Email enviado!
        </h1>
        <p className="text-sm mb-2" style={{ color: 'rgba(244,244,245,0.5)' }}>
          Revisá tu bandeja de entrada en
        </p>
        <p className="font-mono text-sm mb-8" style={{ color: '#C49A3C' }}>{emailRecuperar}</p>
        <p className="text-xs mb-8" style={{ color: 'rgba(244,244,245,0.3)' }}>
          El link expira en 1 hora. Si no aparece, revisá la carpeta de spam.
        </p>
        <button onClick={() => setVista('login')}
          className="btn-ghost flex items-center gap-2 mx-auto">
          <ArrowLeft size={13} />
          Volver al login
        </button>
      </div>
    </div>
  )
}
