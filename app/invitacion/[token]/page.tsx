'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generatePassword } from '@/lib/utils'
import { UserCheck, Copy, Check, LogIn, AlertCircle, Loader2 } from 'lucide-react'

type Estado = 'verificando' | 'invalido' | 'expirado' | 'usado' | 'form' | 'listo'

export default function InvitacionPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [estado, setEstado] = useState<Estado>('verificando')
  const [invId, setInvId] = useState('')
  const [contadorId, setContadorId] = useState('')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password] = useState(() => generatePassword())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiado, setCopiado] = useState<'email' | 'pass' | null>(null)

  useEffect(() => {
    async function verificar() {
      const supabase = createClient()
      const { data: inv, error } = await supabase
        .from('invitaciones')
        .select('*')
        .eq('token', token)
        .single()

      if (error || !inv) { setEstado('invalido'); return }
      if (inv.usado) { setEstado('usado'); return }
      if (new Date(inv.expires_at) < new Date()) { setEstado('expirado'); return }

      setInvId(inv.id)
      setContadorId(inv.contador_id)
      setEstado('form')
    }
    verificar()
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) { setError('Ingresá tu nombre.'); return }
    setLoading(true)
    setError('')

    const supabase = createClient()

    // 1. Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre: nombre.trim(), rol: 'cliente' },
      },
    })

    if (authError) {
      setError(authError.message === 'User already registered'
        ? 'Ya existe una cuenta con ese email.'
        : 'Error al crear la cuenta. Intentá de nuevo.')
      setLoading(false)
      return
    }

    const clienteId = authData.user?.id
    if (!clienteId) { setError('Error inesperado.'); setLoading(false); return }

    // 2. Update profile with contador_id
    await supabase.from('profiles').update({ contador_id: contadorId }).eq('id', clienteId)

    // 3. Mark invitation as used
    await supabase.from('invitaciones').update({ usado: true, cliente_id: clienteId }).eq('id', invId)

    setEstado('listo')
    setLoading(false)
  }

  async function copiar(texto: string, tipo: 'email' | 'pass') {
    await navigator.clipboard.writeText(texto)
    setCopiado(tipo)
    setTimeout(() => setCopiado(null), 2000)
  }

  // ── Estados de carga/error ────────────────────────────────────
  if (estado === 'verificando') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={28} className="animate-spin mx-auto mb-3" style={{ color: '#C49A3C' }} />
          <p className="text-sm" style={{ color: 'rgba(244,244,245,0.5)' }}>Verificando invitación...</p>
        </div>
      </div>
    )
  }

  if (estado === 'invalido' || estado === 'expirado' || estado === 'usado') {
    const msgs: Record<string, { title: string; desc: string }> = {
      invalido: { title: 'Link inválido', desc: 'Esta invitación no existe o fue eliminada.' },
      expirado: { title: 'Invitación expirada', desc: 'Este link ya no está activo. Pedile a tu contador un nuevo link.' },
      usado: { title: 'Invitación ya utilizada', desc: 'Este link ya fue usado para crear una cuenta. Si ya tenés cuenta, ingresá normalmente.' },
    }
    const msg = msgs[estado]
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <AlertCircle size={24} style={{ color: '#EF4444' }} />
          </div>
          <h1 className="font-playfair text-2xl font-semibold text-white mb-2">{msg.title}</h1>
          <p className="text-sm mb-6" style={{ color: 'rgba(244,244,245,0.5)' }}>{msg.desc}</p>
          <button onClick={() => router.push('/login')} className="btn-ghost flex items-center gap-2 mx-auto">
            <LogIn size={14} />
            Ir al login
          </button>
        </div>
      </div>
    )
  }

  // ── Formulario de registro ───────────────────────────────────
  if (estado === 'form') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md animate-fade-up" style={{ opacity: 0 }}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #C49A3C, #A07D28)' }}>
                <span className="text-black font-bold text-sm font-mono">CF</span>
              </div>
              <span className="font-playfair text-xl font-semibold tracking-wide"
                style={{ color: '#C49A3C' }}>ContaFlow</span>
            </div>
            <h1 className="font-playfair text-3xl font-semibold text-white mb-2">
              Tu contador te invita
            </h1>
            <p className="text-sm" style={{ color: 'rgba(244,244,245,0.45)' }}>
              Completá tus datos para acceder a tu panel financiero
            </p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-medium mb-2 uppercase tracking-widest"
                  style={{ color: 'rgba(244,244,245,0.5)' }}>Tu nombre completo</label>
                <input type="text" className="input-field" placeholder="Ej: Juan Pérez"
                  value={nombre} onChange={e => setNombre(e.target.value)} required />
              </div>

              <div>
                <label className="block text-xs font-medium mb-2 uppercase tracking-widest"
                  style={{ color: 'rgba(244,244,245,0.5)' }}>Tu email</label>
                <input type="email" className="input-field" placeholder="tu@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              <div className="p-3 rounded-lg"
                style={{ background: 'rgba(196,154,60,0.06)', border: '1px solid rgba(196,154,60,0.2)' }}>
                <p className="text-xs mb-2 font-medium" style={{ color: 'rgba(244,244,245,0.5)' }}>
                  Tu contraseña generada automáticamente:
                </p>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-sm flex-1" style={{ color: '#C49A3C' }}>
                    {password}
                  </code>
                  <button type="button" onClick={() => copiar(password, 'pass')}
                    className="p-1.5 rounded transition-colors"
                    style={{ color: copiado === 'pass' ? '#22C55E' : 'rgba(244,244,245,0.4)' }}>
                    {copiado === 'pass' ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
                <p className="text-xs mt-1.5" style={{ color: 'rgba(244,244,245,0.3)' }}>
                  Guardala antes de continuar — la vas a necesitar para ingresar
                </p>
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
                    <UserCheck size={15} />
                    Crear mi cuenta
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ── Cuenta creada exitosamente ───────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center animate-fade-up" style={{ opacity: 0 }}>
        <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <UserCheck size={28} style={{ color: '#22C55E' }} />
        </div>
        <h1 className="font-playfair text-3xl font-semibold text-white mb-2">
          ¡Cuenta creada!
        </h1>
        <p className="text-sm mb-8" style={{ color: 'rgba(244,244,245,0.5)' }}>
          Tu panel financiero está listo. Guardá tus credenciales:
        </p>

        <div className="card p-6 text-left mb-6">
          <div className="space-y-3">
            {[
              { label: 'Email', value: email, tipo: 'email' as const },
              { label: 'Contraseña', value: password, tipo: 'pass' as const },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between gap-3 p-3 rounded-lg"
                style={{ background: 'rgba(6,8,13,0.5)', border: '1px solid rgba(196,154,60,0.12)' }}>
                <div>
                  <p className="text-xs uppercase tracking-widest mb-0.5"
                    style={{ color: 'rgba(244,244,245,0.4)', letterSpacing: '0.1em' }}>{item.label}</p>
                  <code className="font-mono text-sm" style={{ color: '#F4F4F5' }}>{item.value}</code>
                </div>
                <button onClick={() => copiar(item.value, item.tipo)}
                  className="p-1.5 rounded flex-shrink-0 transition-colors"
                  style={{ color: copiado === item.tipo ? '#22C55E' : 'rgba(244,244,245,0.4)' }}>
                  {copiado === item.tipo ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => router.push('/login')}
          className="btn-gold w-full flex items-center justify-center gap-2 py-3"
        >
          <LogIn size={15} />
          Ir al panel
        </button>
      </div>
    </div>
  )
}
