'use client'

import { TrendingUp, TrendingDown, Scale } from 'lucide-react'
import { formatCurrency, type Transaccion } from '@/lib/utils'

interface FinancialSummaryProps {
  transacciones: Transaccion[]
}

const DIVISAS = ['ARS', 'USD', 'EUR'] as const
const DIVISA_NAMES: Record<string, string> = { ARS: 'Pesos', USD: 'Dólares', EUR: 'Euros' }

export default function FinancialSummary({ transacciones }: FinancialSummaryProps) {
  const stats = DIVISAS.map(divisa => {
    const filtered = transacciones.filter(t => t.divisa === divisa)
    const ingresos = filtered.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + Number(t.monto), 0)
    const egresos = filtered.filter(t => t.tipo === 'egreso').reduce((s, t) => s + Number(t.monto), 0)
    return { divisa, ingresos, egresos, balance: ingresos - egresos, count: filtered.length }
  }).filter(s => s.count > 0 || true) // show all divisas

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((s, i) => (
        <div
          key={s.divisa}
          className="card p-5 animate-fade-up"
          style={{ opacity: 0, animationDelay: `${i * 0.07}s`, animationFillMode: 'forwards' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-widest font-medium mb-0.5"
                style={{ color: 'rgba(244,244,245,0.4)', letterSpacing: '0.1em' }}>
                {DIVISA_NAMES[s.divisa]}
              </p>
              <p className="font-mono text-xs font-semibold"
                style={{ color: '#C49A3C' }}>{s.divisa}</p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: s.balance >= 0 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                border: `1px solid ${s.balance >= 0 ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
              }}>
              <Scale size={14} style={{ color: s.balance >= 0 ? '#22C55E' : '#EF4444' }} />
            </div>
          </div>

          {/* Balance */}
          <p className="font-mono text-2xl font-semibold mb-4 truncate"
            style={{ color: s.balance >= 0 ? '#22C55E' : '#EF4444' }}>
            {formatCurrency(Math.abs(s.balance), s.divisa)}
          </p>

          {/* Divider */}
          <div className="gold-divider mb-4" />

          {/* Ingresos / Egresos */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={12} style={{ color: '#22C55E' }} />
                <span className="text-xs" style={{ color: 'rgba(244,244,245,0.5)' }}>Ingresos</span>
              </div>
              <span className="font-mono text-xs font-medium" style={{ color: '#22C55E' }}>
                {formatCurrency(s.ingresos, s.divisa)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TrendingDown size={12} style={{ color: '#EF4444' }} />
                <span className="text-xs" style={{ color: 'rgba(244,244,245,0.5)' }}>Egresos</span>
              </div>
              <span className="font-mono text-xs font-medium" style={{ color: '#EF4444' }}>
                {formatCurrency(s.egresos, s.divisa)}
              </span>
            </div>
          </div>

          {/* Transaction count */}
          {s.count > 0 && (
            <p className="text-xs mt-3 pt-3" style={{ color: 'rgba(244,244,245,0.3)', borderTop: '1px solid rgba(196,154,60,0.08)' }}>
              {s.count} {s.count === 1 ? 'movimiento' : 'movimientos'}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
