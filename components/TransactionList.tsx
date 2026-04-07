'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDateShort, type Transaccion } from '@/lib/utils'
import { Trash2, ChevronDown, TrendingUp, TrendingDown, Search } from 'lucide-react'

interface TransactionListProps {
  transacciones: Transaccion[]
  onDelete?: () => void
  canDelete?: boolean
}

export default function TransactionList({ transacciones, onDelete, canDelete = true }: TransactionListProps) {
  const [search, setSearch] = useState('')
  const [filterTipo, setFilterTipo] = useState<'todos' | 'ingreso' | 'egreso'>('todos')
  const [filterDivisa, setFilterDivisa] = useState<'todas' | 'ARS' | 'USD' | 'EUR'>('todas')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showCount, setShowCount] = useState(20)

  const filtered = transacciones.filter(t => {
    if (filterTipo !== 'todos' && t.tipo !== filterTipo) return false
    if (filterDivisa !== 'todas' && t.divisa !== filterDivisa) return false
    if (search && !t.motivo.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este movimiento?')) return
    setDeleting(id)
    const supabase = createClient()
    await supabase.from('transacciones').delete().eq('id', id)
    setDeleting(null)
    onDelete?.()
  }

  return (
    <div className="card">
      {/* Filters */}
      <div className="p-4 flex flex-wrap gap-2 items-center"
        style={{ borderBottom: '1px solid rgba(196,154,60,0.1)' }}>
        <div className="flex-1 min-w-[160px] relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'rgba(244,244,245,0.3)' }} />
          <input
            type="text"
            className="input-field pl-8 py-2 text-xs"
            placeholder="Buscar por motivo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Tipo filter */}
        <div className="flex rounded-lg overflow-hidden"
          style={{ border: '1px solid rgba(196,154,60,0.2)' }}>
          {(['todos', 'ingreso', 'egreso'] as const).map(t => (
            <button key={t} onClick={() => setFilterTipo(t)}
              className="px-2.5 py-1.5 text-xs font-medium transition-all capitalize"
              style={{
                background: filterTipo === t ? 'rgba(196,154,60,0.15)' : 'transparent',
                color: filterTipo === t ? '#C49A3C' : 'rgba(244,244,245,0.4)',
              }}>
              {t}
            </button>
          ))}
        </div>

        {/* Divisa filter */}
        <div className="flex rounded-lg overflow-hidden"
          style={{ border: '1px solid rgba(196,154,60,0.2)' }}>
          {(['todas', 'ARS', 'USD', 'EUR'] as const).map(d => (
            <button key={d} onClick={() => setFilterDivisa(d)}
              className="px-2.5 py-1.5 text-xs font-mono font-medium transition-all"
              style={{
                background: filterDivisa === d ? 'rgba(196,154,60,0.15)' : 'transparent',
                color: filterDivisa === d ? '#C49A3C' : 'rgba(244,244,245,0.4)',
              }}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm" style={{ color: 'rgba(244,244,245,0.25)' }}>
            Sin movimientos registrados
          </p>
        </div>
      ) : (
        <>
          <div className="divide-y" style={{ borderColor: 'rgba(196,154,60,0.06)' }}>
            {filtered.slice(0, showCount).map((t, i) => (
              <div
                key={t.id}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-opacity-50 transition-colors group animate-fade-in"
                style={{
                  animationDelay: `${i * 0.03}s`,
                  animationFillMode: 'backwards',
                  opacity: 0,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(196,154,60,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Icon */}
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{
                    background: t.tipo === 'ingreso' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  }}>
                  {t.tipo === 'ingreso'
                    ? <TrendingUp size={14} style={{ color: '#22C55E' }} />
                    : <TrendingDown size={14} style={{ color: '#EF4444' }} />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'rgba(244,244,245,0.85)' }}>
                    {t.motivo || <span style={{ color: 'rgba(244,244,245,0.3)', fontStyle: 'italic' }}>Sin descripción</span>}
                  </p>
                  <p className="text-xs mt-0.5 font-mono" style={{ color: 'rgba(244,244,245,0.3)' }}>
                    {formatDateShort(t.fecha)}
                  </p>
                </div>

                {/* Badge + Amount */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={t.tipo === 'ingreso' ? 'badge-income' : 'badge-expense'}>
                    {t.tipo}
                  </span>
                  <span className="font-mono text-sm font-semibold"
                    style={{ color: t.tipo === 'ingreso' ? '#22C55E' : '#EF4444' }}>
                    {t.tipo === 'egreso' ? '−' : '+'}{formatCurrency(Number(t.monto), t.divisa)}
                  </span>
                </div>

                {/* Delete */}
                {canDelete && (
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg ml-1"
                    style={{ color: 'rgba(239,68,68,0.5)' }}
                    disabled={deleting === t.id}
                  >
                    {deleting === t.id
                      ? <span className="inline-block w-3.5 h-3.5 border border-current/30 border-t-current rounded-full animate-spin" />
                      : <Trash2 size={14} />}
                  </button>
                )}
              </div>
            ))}
          </div>

          {filtered.length > showCount && (
            <button
              onClick={() => setShowCount(c => c + 20)}
              className="w-full py-3 flex items-center justify-center gap-2 text-xs transition-colors"
              style={{
                color: 'rgba(244,244,245,0.4)',
                borderTop: '1px solid rgba(196,154,60,0.08)',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#C49A3C')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,244,245,0.4)')}
            >
              <ChevronDown size={13} />
              Ver {Math.min(20, filtered.length - showCount)} más de {filtered.length - showCount} restantes
            </button>
          )}
        </>
      )}

      <div className="px-4 py-2.5 flex justify-between items-center"
        style={{ borderTop: '1px solid rgba(196,154,60,0.08)' }}>
        <p className="text-xs" style={{ color: 'rgba(244,244,245,0.3)' }}>
          {filtered.length} {filtered.length === 1 ? 'movimiento' : 'movimientos'}
          {filtered.length !== transacciones.length && ` de ${transacciones.length}`}
        </p>
      </div>
    </div>
  )
}
