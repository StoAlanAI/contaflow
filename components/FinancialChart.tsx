'use client'

import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts'
import { format, parseISO, startOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import { type Transaccion } from '@/lib/utils'

interface FinancialChartProps {
  transacciones: Transaccion[]
}

type Divisa = 'ARS' | 'USD' | 'EUR'
type ChartType = 'area' | 'bar'

const COLORS = {
  income: '#22C55E',
  expense: '#EF4444',
  gold: '#C49A3C',
}

export default function FinancialChart({ transacciones }: FinancialChartProps) {
  const [divisa, setDivisa] = useState<Divisa>('ARS')
  const [chartType, setChartType] = useState<ChartType>('area')

  const filtered = transacciones.filter(t => t.divisa === divisa)

  // Group by month
  const monthMap: Record<string, { ingresos: number; egresos: number }> = {}
  filtered.forEach(t => {
    const key = format(startOfMonth(parseISO(t.fecha)), 'yyyy-MM')
    if (!monthMap[key]) monthMap[key] = { ingresos: 0, egresos: 0 }
    if (t.tipo === 'ingreso') monthMap[key].ingresos += Number(t.monto)
    else monthMap[key].egresos += Number(t.monto)
  })

  const data = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, vals]) => ({
      mes: format(parseISO(key + '-01'), 'MMM yy', { locale: es }),
      Ingresos: vals.ingresos,
      Egresos: vals.egresos,
      Balance: vals.ingresos - vals.egresos,
    }))

  const formatY = (v: number) => {
    if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
    if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}k`
    return String(v)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="px-4 py-3 rounded-xl text-xs"
        style={{ background: '#0C0F16', border: '1px solid rgba(196,154,60,0.25)' }}>
        <p className="font-medium mb-2 capitalize" style={{ color: '#C49A3C' }}>{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-3 mb-1">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span style={{ color: 'rgba(244,244,245,0.6)' }}>{entry.name}:</span>
            <span className="font-mono font-medium" style={{ color: entry.color }}>
              {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0 }).format(entry.value)} {divisa}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="font-playfair text-lg font-semibold text-white">Evolución mensual</h3>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(244,244,245,0.4)' }}>
            Ingresos y egresos agrupados por mes
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Divisa selector */}
          <div className="flex rounded-lg overflow-hidden"
            style={{ border: '1px solid rgba(196,154,60,0.2)' }}>
            {(['ARS', 'USD', 'EUR'] as Divisa[]).map(d => (
              <button key={d} onClick={() => setDivisa(d)}
                className="px-3 py-1.5 text-xs font-mono font-medium transition-all"
                style={{
                  background: divisa === d ? 'rgba(196,154,60,0.2)' : 'transparent',
                  color: divisa === d ? '#C49A3C' : 'rgba(244,244,245,0.4)',
                }}>
                {d}
              </button>
            ))}
          </div>
          {/* Chart type */}
          <div className="flex rounded-lg overflow-hidden"
            style={{ border: '1px solid rgba(196,154,60,0.2)' }}>
            {(['area', 'bar'] as ChartType[]).map(t => (
              <button key={t} onClick={() => setChartType(t)}
                className="px-3 py-1.5 text-xs font-medium transition-all capitalize"
                style={{
                  background: chartType === t ? 'rgba(196,154,60,0.2)' : 'transparent',
                  color: chartType === t ? '#C49A3C' : 'rgba(244,244,245,0.4)',
                }}>
                {t === 'area' ? 'Área' : 'Barras'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-56 flex items-center justify-center"
          style={{ color: 'rgba(244,244,245,0.25)' }}>
          <p className="text-sm">Sin movimientos en {divisa} todavía</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          {chartType === 'area' ? (
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.income} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={COLORS.income} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.expense} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={COLORS.expense} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'rgba(244,244,245,0.35)' }} />
              <YAxis tickFormatter={formatY} tick={{ fontSize: 11, fill: 'rgba(244,244,245,0.35)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Ingresos" stroke={COLORS.income} strokeWidth={2} fill="url(#colorIngresos)" />
              <Area type="monotone" dataKey="Egresos" stroke={COLORS.expense} strokeWidth={2} fill="url(#colorEgresos)" />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'rgba(244,244,245,0.35)' }} />
              <YAxis tickFormatter={formatY} tick={{ fontSize: 11, fill: 'rgba(244,244,245,0.35)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', color: 'rgba(244,244,245,0.5)' }} />
              <Bar dataKey="Ingresos" fill={COLORS.income} radius={[4, 4, 0, 0]} fillOpacity={0.85} />
              <Bar dataKey="Egresos" fill={COLORS.expense} radius={[4, 4, 0, 0]} fillOpacity={0.85} />
            </BarChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  )
}
