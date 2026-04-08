'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react'

type Estado = 'cargando' | 'form' | 'listo' | 'error'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [estado, setEstado] = useState<Estado>('cargando')
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Supabase redirige con ?code=... en la URL — lo intercambia por sesión
    const supabase = createClient()
    const code = new URLSearchParams(window.location.search).get('code')

    if (!code) {
      setEstado('error')
      return
    }

    supabase.auth.exchangeCodeForSession(code)
      .then(({ error }) => {
        if (error) setEstado('error')
        else setEstado('form')
      })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError('No se pudo actualizar. Pedí un nuevo link de recuperación.')
      setLoading(false)
      return
    }

    setEstado('listo')
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

  if (estado === 'cargando') return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <span className="inline-block w-6 h-6 border-2 rounded-full animate-spin mb-3"
          style={{ borderColor: 'rgba(196,154,60,0.2)', borderTopColor: '#C49A3C' }} />
        <p className="text-sm" style={{ color: 'rgba(244,244,245,0.4)' }}>Verificando link...</p>
      </div>
    </div>
  )

  if (estado === 'error') return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <AlertCircle size={24} style={{ color: '#EF4444' }} />
        </div>
        <h1 className="font-playfair text-2xl font-semibold text-white mb-2">Link inválido</h1>
        <p className="text-sm mb-6" style={{ color: 'rgba(244,244,245,0.5)' }}>
          Este link expiró o ya fue usado. Pedí uno nuevo desde el login.
        </p>
        <button onClick={() => router.push('/login')} className="btn-gold flex items-center gap-2 mx-auto px-5 py-2.5">
          Ir al login
        </button>
      </div>
    </div>
  )

  if (estado === 'listo') return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm animate-fade-up" style={{ opacity: 0 }}>
        <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <CheckCircle2 size={28} style={{ color: '#22C55E' }} />
        </div>
        <h1 className="font-playfair text-3xl font-semibold text-white mb-2">
          Contraseña actualizada
        </h1>
        <p className="text-sm mb-8" style={{ color: 'rgba(244,244,245,0.5)' }}>
          Tu nueva contraseña está activa. Podés ingresar normalmente.
        </p>
        <button onClick={() => router.push('/login')} className="btn-gold flex items-center gap-2 mx-auto px-6 py-3">
          <KeyRound size={14} />
          Ir al login
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-up" style={{ opacity: 0 }}>
        <div className="text-center mb-10">
          <Logo />
          <h1 className="font-playfair text-3xl font-semibold text-white mb-2">
            Nueva contraseña
          </h1>
          <p className="text-sm" style={{ color: 'rgba(244,244,245,0.45)' }}>
            Elegí una contraseña segura para tu cuenta
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-widest"
                style={{ color: 'rgba(244,244,245,0.5)' }}>Nueva contraseña</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input-field pr-10"
                  placeholder="Mínimo 8 caracteres"
                  value={password} onChange={e => setPassword(e.target.value)}
                  required minLength={8} autoFocus />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(244,244,245,0.4)' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-widest"
                style={{ color: 'rgba(244,244,245,0.5)' }}>Confirmar contraseña</label>
              <input type={showPass ? 'text' : 'password'} className="input-field"
                placeholder="Repetí la contraseña"
                value={confirmar} onChange={e => setConfirmar(e.target.value)} required />
            </div>

            {/* Indicador de fortaleza */}
            {password.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => {
                    const strength = password.length >= 12 ? 4 : password.length >= 10 ? 3 : password.length >= 8 ? 2 : 1
                    return (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all"
                        style={{
                          background: i < strength
                            ? strength >= 4 ? '#22C55E' : strength >= 3 ? '#C49A3C' : '#EF4444'
                            : 'rgba(244,244,245,0.1)'
                        }} />
                    )
                  })}
                </div>
                <p className="text-xs" style={{ color: 'rgba(244,244,245,0.35)' }}>
                  {password.length < 8 ? 'Muy corta' : password.length < 10 ? 'Aceptable' : password.length < 12 ? 'Buena' : 'Excelente'}
                </p>
              </div>
            )}

            {error && (
              <div className="text-sm px-3 py-2 rounded-lg"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-gold w-full flex items-center justify-center gap-2 py-3">
              {loading
                ? <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                : <><KeyRound size={15} />Guardar nueva contraseña</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
