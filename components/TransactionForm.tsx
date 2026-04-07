'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, TrendingUp, TrendingDown } from 'lucide-react'

interface TransactionFormProps {
  clienteId: string
  onSuccess: () => void
}

export default function TransactionForm({ clienteId, onSuccess }: TransactionFormProps) {
  const [tipo, setTipo] = useState<'ingreso' | 'egreso'>('ingreso')
  const [monto, setMonto] = useState('')
  const [divisa, setDivisa] = useState<'ARS' | 'USD' | 'EUR'>('ARS')
  const [motivo, setMotivo] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const montoNum = parseFloat(monto.replace(',', '.'))
    if (isNaN(montoNum) || montoNum <= 0) {
      setError('Ingresá un monto válido mayor a 0.')
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: dbError } = await supabase.from('transacciones').insert({
      cliente_id: clienteId,
      tipo,
      monto: montoNum,
      divisa,
      motivo: motivo.trim(),
      fecha,
    })

    if (dbError) {
      setError('Error al guardar. Intentá de nuevo.')
      setLoading(false)
      return
    }

    setMonto('')
    setMotivo('')
    setFecha(new Date().toISOString().split('T')[0])
    setLoading(false)
    onSuccess()
  }

  return (
    <div className="card p-6">
      <h3 className="font-playfair text-lg font-semibold text-white mb-5">
        Registrar movimiento
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo */}
        <div>
          <label className="block text-xs font-medium mb-2 uppercase tracking-widest"
            style={{ color: 'rgba(244,244,245,0.5)' }}>Tipo</label>
          <div className="grid grid-cols-2 gap-2">
            {(['ingreso', 'egreso'] as const).map(t => {
              const isSelected = tipo === t
              const color = t === 'ingreso' ? '#22C55E' : '#EF4444'
              const Icon = t === 'ingreso' ? TrendingUp : TrendingDown
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all capitalize"
                  style={{
                    background: isSelected
                      ? `rgba(${t === 'ingreso' ? '34,197,94' : '239,68,68'}, 0.12)`
                      : 'rgba(6,8,13,0.6)',
                    border: `1px solid ${isSelected ? color : 'rgba(196,154,60,0.2)'}`,
                    color: isSelected ? color : 'rgba(244,244,245,0.5)',
                  }}
                >
                  <Icon size={14} />
                  {t}
                </button>
              )
            })}
          </div>
        </div>

        {/* Monto y Divisa */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium mb-2 uppercase tracking-widest"
              style={{ color: 'rgba(244,244,245,0.5)' }}>Monto</label>
            <input
              type="number"
              className="input-field font-mono"
              placeholder="0.00"
              value={monto}
              onChange={e => setMonto(e.target.value)}
              step="0.01"
              min="0.01"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2 uppercase tracking-widest"
              style={{ color: 'rgba(244,244,245,0.5)' }}>Divisa</label>
            <select
              className="input-field font-mono"
              value={divisa}
              onChange={e => setDivisa(e.target.value as 'ARS' | 'USD' | 'EUR')}
            >
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-xs font-medium mb-2 uppercase tracking-widest"
            style={{ color: 'rgba(244,244,245,0.5)' }}>Fecha</label>
          <input
            type="date"
            className="input-field font-mono"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            required
          />
        </div>

        {/* Motivo */}
        <div>
          <label className="block text-xs font-medium mb-2 uppercase tracking-widest"
            style={{ color: 'rgba(244,244,245,0.5)' }}>Motivo / Descripción</label>
          <textarea
            className="input-field resize-none"
            placeholder="Ej: Cobro de factura N° 0042, pago de alquiler..."
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            rows={2}
          />
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
              <Plus size={15} />
              Agregar movimiento
            </>
          )}
        </button>
      </form>
    </div>
  )
}
