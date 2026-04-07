'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import { type Profile, type Invitacion } from '@/lib/utils'
import {
  Users, Link2, Copy, Check, ExternalLink,
  TrendingUp, Clock, ChevronRight, Plus,
} from 'lucide-react'

interface Props {
  profile: Profile
  clientes: Profile[]
  invitacionesRecientes: Invitacion[]
}

export default function ContadorDashboard({ profile, clientes, invitacionesRecientes }: Props) {
  const [generando, setGenerando] = useState(false)
  const [linkGenerado, setLinkGenerado] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [listaInv, setListaInv] = useState(invitacionesRecientes)

  async function generarLink() {
    setGenerando(true)
    const supabase = createClient()

    // Generate unique token
    const token = Array.from(crypto.getRandomValues(new Uint8Array(18)))
      .map(b => b.toString(36).padStart(2, '0')).join('').slice(0, 24)

    const { error } = await supabase.from('invitaciones').insert({
      token,
      contador_id: profile.id,
    })

    if (!error) {
      const url = `${window.location.origin}/invitacion/${token}`
      setLinkGenerado(url)
      setListaInv(prev => [{
        id: 'new',
        token,
        contador_id: profile.id,
        usado: false,
        expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
        created_at: new Date().toISOString(),
      }, ...prev].slice(0, 5))
    }
    setGenerando(false)
  }

  async function copiar(text: string) {
    await navigator.clipboard.writeText(text)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const invPendientes = listaInv.filter(i => !i.usado).length

  return (
    <div className="min-h-screen">
      <Navbar nombre={profile.nombre} rol="contador" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
          <p className="text-xs uppercase tracking-widest mb-1"
            style={{ color: '#C49A3C', letterSpacing: '0.15em' }}>Panel del contador</p>
          <h1 className="font-playfair text-3xl sm:text-4xl font-semibold text-white">
            Buen día, {profile.nombre.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(244,244,245,0.45)' }}>
            Gestioná a tus clientes desde un solo lugar
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Clientes activos', value: clientes.length, icon: Users, color: '#C49A3C' },
            { label: 'Invitaciones pendientes', value: invPendientes, icon: Clock, color: '#A78BFA' },
            { label: 'Total movimientos', value: '—', icon: TrendingUp, color: '#22C55E' },
          ].map((stat, i) => (
            <div key={stat.label} className="card p-4 animate-fade-up"
              style={{ opacity: 0, animationDelay: `${0.1 + i * 0.07}s`, animationFillMode: 'forwards' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-widest"
                  style={{ color: 'rgba(244,244,245,0.4)', letterSpacing: '0.1em' }}>
                  {stat.label}
                </span>
                <stat.icon size={14} style={{ color: stat.color }} />
              </div>
              <p className="font-playfair text-2xl font-semibold" style={{ color: stat.color }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Clients list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-playfair text-xl font-semibold text-white">Mis clientes</h2>
              <span className="text-xs px-2.5 py-1 rounded-full font-mono"
                style={{ background: 'rgba(196,154,60,0.1)', color: '#C49A3C', border: '1px solid rgba(196,154,60,0.2)' }}>
                {clientes.length}
              </span>
            </div>

            {clientes.length === 0 ? (
              <div className="card p-10 text-center animate-fade-up"
                style={{ opacity: 0, animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'rgba(196,154,60,0.08)', border: '1px solid rgba(196,154,60,0.15)' }}>
                  <Users size={20} style={{ color: 'rgba(196,154,60,0.5)' }} />
                </div>
                <p className="text-sm font-medium text-white mb-1">Todavía no tenés clientes</p>
                <p className="text-xs" style={{ color: 'rgba(244,244,245,0.35)' }}>
                  Generá un link de invitación para incorporar tu primer cliente
                </p>
              </div>
            ) : (
              <div className="card divide-y animate-fade-up"
                style={{ opacity: 0, animationDelay: '0.2s', animationFillMode: 'forwards', borderColor: 'rgba(196,154,60,0.06)' }}>
                {clientes.map(cliente => (
                  <Link key={cliente.id} href={`/admin/clientes/${cliente.id}`}
                    className="flex items-center gap-3 px-4 py-3.5 transition-colors group"
                    style={{ borderColor: 'rgba(196,154,60,0.06)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(196,154,60,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-sm"
                      style={{ background: 'rgba(196,154,60,0.12)', color: '#C49A3C' }}>
                      {cliente.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{cliente.nombre}</p>
                      <p className="text-xs truncate" style={{ color: 'rgba(244,244,245,0.4)' }}>{cliente.email}</p>
                    </div>
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: '#C49A3C' }} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right: Generate link */}
          <div className="space-y-4">
            <h2 className="font-playfair text-xl font-semibold text-white">Nuevo cliente</h2>

            <div className="card p-5 animate-fade-up"
              style={{ opacity: 0, animationDelay: '0.25s', animationFillMode: 'forwards' }}>
              <div className="flex items-center gap-2 mb-3">
                <Link2 size={15} style={{ color: '#C49A3C' }} />
                <p className="text-sm font-medium text-white">Generar link de invitación</p>
              </div>
              <p className="text-xs mb-4" style={{ color: 'rgba(244,244,245,0.4)' }}>
                El link es único y válido por 7 días. El cliente podrá crear su cuenta desde ese link.
              </p>

              <button
                onClick={generarLink}
                disabled={generando}
                className="btn-gold w-full flex items-center justify-center gap-2 py-2.5"
              >
                {generando ? (
                  <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus size={14} />
                    Generar link
                  </>
                )}
              </button>

              {linkGenerado && (
                <div className="mt-4 p-3 rounded-lg animate-fade-in"
                  style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', opacity: 0, animationFillMode: 'forwards' }}>
                  <p className="text-xs mb-2 font-medium" style={{ color: '#22C55E' }}>
                    Link generado correctamente
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-mono flex-1 truncate"
                      style={{ color: 'rgba(244,244,245,0.6)' }}>
                      {linkGenerado}
                    </p>
                    <button onClick={() => copiar(linkGenerado)}
                      className="flex-shrink-0 p-1.5 rounded transition-colors"
                      style={{ color: copiado ? '#22C55E' : 'rgba(244,244,245,0.5)' }}>
                      {copiado ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Recent invitations */}
            {listaInv.length > 0 && (
              <div className="card p-5 animate-fade-up"
                style={{ opacity: 0, animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                <p className="text-xs uppercase tracking-widest mb-3 font-medium"
                  style={{ color: 'rgba(244,244,245,0.4)', letterSpacing: '0.1em' }}>
                  Invitaciones recientes
                </p>
                <div className="space-y-2">
                  {listaInv.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs truncate flex-1"
                        style={{ color: 'rgba(244,244,245,0.4)' }}>
                        ...{inv.token.slice(-10)}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs px-1.5 py-0.5 rounded font-mono"
                          style={{
                            background: inv.usado ? 'rgba(34,197,94,0.1)' : 'rgba(196,154,60,0.1)',
                            color: inv.usado ? '#22C55E' : '#C49A3C',
                            fontSize: '0.65rem',
                          }}>
                          {inv.usado ? 'usado' : 'pendiente'}
                        </span>
                        {!inv.usado && (
                          <button
                            onClick={() => copiar(`${window.location.origin}/invitacion/${inv.token}`)}
                            className="p-1 rounded transition-colors"
                            style={{ color: 'rgba(244,244,245,0.3)' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#C49A3C')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,244,245,0.3)')}
                          >
                            <Copy size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
