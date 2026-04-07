'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', (await supabase.auth.getUser()).data.user?.id ?? '')
      .single()

    router.push(profile?.rol === 'contador' ? '/dashboard' : '/mi-cuenta')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-up" style={{ opacity: 0 }}>
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #C49A3C, #A07D28)' }}>
              <span className="text-black font-bold text-sm font-mono">CF</span>
            </div>
            <span className="font-playfair text-xl font-semibold tracking-wide"
              style={{ color: '#C49A3C' }}>ContaFlow</span>
          </div>
          <h1 className="font-playfair text-3xl font-semibold text-white mb-2">
            Bienvenido de vuelta
          </h1>
          <p className="text-sm" style={{ color: 'rgba(244,244,245,0.45)' }}>
            Ingresá a tu panel de gestión financiera
          </p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-widest"
                style={{ color: 'rgba(244,244,245,0.5)' }}>
                Email
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-widest"
                style={{ color: 'rgba(244,244,245,0.5)' }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(244,244,245,0.4)' }}
                >
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
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={15} />
                  Ingresar
                </>
              )}
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
}
