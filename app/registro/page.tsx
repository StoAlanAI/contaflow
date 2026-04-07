'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { UserPlus, Eye, EyeOff } from 'lucide-react'

export default function RegistroPage() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre, rol: 'contador' },
      },
    })

    if (authError) {
      setError(authError.message === 'User already registered'
        ? 'Ya existe una cuenta con ese email.'
        : 'Error al registrarse. Intentá de nuevo.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
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
            Crear cuenta de contador
          </h1>
          <p className="text-sm" style={{ color: 'rgba(244,244,245,0.45)' }}>
            Registrate para gestionar a tus clientes
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-widest"
                style={{ color: 'rgba(244,244,245,0.5)' }}>
                Nombre completo
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Ej: María González"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
              />
            </div>

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
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
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
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={15} />
                  Crear cuenta
                </>
              )}
            </button>
          </form>

          <div className="gold-divider my-6" />

          <p className="text-center text-sm" style={{ color: 'rgba(244,244,245,0.4)' }}>
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className="font-medium transition-colors hover:opacity-80"
              style={{ color: '#C49A3C' }}>
              Ingresá aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
