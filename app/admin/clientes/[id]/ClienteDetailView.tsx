'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import FinancialSummary from '@/components/FinancialSummary'
import FinancialChart from '@/components/FinancialChart'
import TransactionList from '@/components/TransactionList'
import TransactionForm from '@/components/TransactionForm'
import { type Profile, type Transaccion, formatDate } from '@/lib/utils'
import { ArrowLeft, Mail, Calendar, RefreshCw } from 'lucide-react'

interface Props {
  contador: Profile
  cliente: Profile
  transacciones: Transaccion[]
}

export default function ClienteDetailView({ contador, cliente, transacciones: initial }: Props) {
  const router = useRouter()
  const [txs, setTxs] = useState(initial)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('transacciones')
      .select('*')
      .eq('cliente_id', cliente.id)
      .order('fecha', { ascending: false })
    if (data) setTxs(data)
    setLoading(false)
  }, [cliente.id])

  return (
    <div className="min-h-screen">
      <Navbar nombre={contador.nombre} rol="contador" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 animate-fade-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
          <Link href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs mb-4 transition-colors"
            style={{ color: 'rgba(244,244,245,0.4)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#C49A3C')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,244,245,0.4)')}>
            <ArrowLeft size={12} />
            Volver al panel
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg"
                style={{ background: 'rgba(196,154,60,0.12)', color: '#C49A3C', border: '1px solid rgba(196,154,60,0.2)' }}>
                {cliente.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest mb-0.5"
                  style={{ color: '#C49A3C', letterSpacing: '0.12em' }}>Cliente</p>
                <h1 className="font-playfair text-2xl sm:text-3xl font-semibold text-white">
                  {cliente.nombre}
                </h1>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 text-xs"
                    style={{ color: 'rgba(244,244,245,0.4)' }}>
                    <Mail size={11} />
                    {cliente.email}
                  </span>
                  <span className="flex items-center gap-1 text-xs"
                    style={{ color: 'rgba(244,244,245,0.3)' }}>
                    <Calendar size={11} />
                    Desde {formatDate(cliente.created_at.split('T')[0])}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={refresh} disabled={loading}
              className="btn-ghost flex items-center gap-2 text-xs py-2">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6">
          <FinancialSummary transacciones={txs} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart + List */}
          <div className="lg:col-span-2 space-y-5">
            <FinancialChart transacciones={txs} />
            <div>
              <h3 className="font-playfair text-lg font-semibold text-white mb-3">
                Historial de movimientos
              </h3>
              <TransactionList transacciones={txs} onDelete={refresh} canDelete={false} />
            </div>
          </div>

          {/* Form */}
          <div>
            <h3 className="font-playfair text-lg font-semibold text-white mb-3">
              Cargar movimiento
            </h3>
            <TransactionForm clienteId={cliente.id} onSuccess={refresh} />
          </div>
        </div>
      </main>
    </div>
  )
}
