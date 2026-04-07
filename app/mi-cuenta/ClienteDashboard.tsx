'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import FinancialSummary from '@/components/FinancialSummary'
import FinancialChart from '@/components/FinancialChart'
import TransactionList from '@/components/TransactionList'
import TransactionForm from '@/components/TransactionForm'
import { type Profile, type Transaccion } from '@/lib/utils'
import { User, RefreshCw } from 'lucide-react'

interface Props {
  profile: Profile
  transacciones: Transaccion[]
  contador: { nombre: string; email: string } | null
}

export default function ClienteDashboard({ profile, transacciones: initial, contador }: Props) {
  const [txs, setTxs] = useState(initial)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('transacciones')
      .select('*')
      .eq('cliente_id', profile.id)
      .order('fecha', { ascending: false })
    if (data) setTxs(data)
    setLoading(false)
  }, [profile.id])

  return (
    <div className="min-h-screen">
      <Navbar nombre={profile.nombre} rol="cliente" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap animate-fade-up"
          style={{ opacity: 0, animationFillMode: 'forwards' }}>
          <div>
            <p className="text-xs uppercase tracking-widest mb-1"
              style={{ color: '#C49A3C', letterSpacing: '0.15em' }}>Mis finanzas</p>
            <h1 className="font-playfair text-3xl sm:text-4xl font-semibold text-white">
              {profile.nombre}
            </h1>
            {contador && (
              <p className="text-xs mt-1.5 flex items-center gap-1.5"
                style={{ color: 'rgba(244,244,245,0.4)' }}>
                <User size={11} style={{ color: '#C49A3C' }} />
                Contador: <span style={{ color: 'rgba(244,244,245,0.65)' }}>{contador.nombre}</span>
              </p>
            )}
          </div>
          <button onClick={refresh} disabled={loading}
            className="btn-ghost flex items-center gap-2 text-xs py-2">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>

        {/* Summary cards */}
        <div className="mb-6">
          <FinancialSummary transacciones={txs} />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Chart + List */}
          <div className="lg:col-span-2 space-y-5">
            <FinancialChart transacciones={txs} />
            <div>
              <h3 className="font-playfair text-lg font-semibold text-white mb-3">
                Mis movimientos
              </h3>
              <TransactionList transacciones={txs} onDelete={refresh} canDelete={true} />
            </div>
          </div>

          {/* Right: Form */}
          <div>
            <h3 className="font-playfair text-lg font-semibold text-white mb-3">
              Nuevo movimiento
            </h3>
            <TransactionForm clienteId={profile.id} onSuccess={refresh} />
          </div>
        </div>
      </main>
    </div>
  )
}
