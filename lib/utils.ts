import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: 'ARS' | 'USD' | 'EUR'): string {
  const symbols: Record<string, string> = { ARS: '$', USD: 'U$S', EUR: '€' }
  const symbol = symbols[currency]
  const formatted = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return `${symbol} ${formatted}`
}

export function formatDate(date: string): string {
  return format(new Date(date + 'T00:00:00'), "d 'de' MMMM, yyyy", { locale: es })
}

export function formatDateShort(date: string): string {
  return format(new Date(date + 'T00:00:00'), 'dd/MM/yyyy')
}

export function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export type Profile = {
  id: string
  email: string
  nombre: string
  rol: 'contador' | 'cliente'
  contador_id?: string
  created_at: string
}

export type Transaccion = {
  id: string
  cliente_id: string
  tipo: 'ingreso' | 'egreso'
  monto: number
  divisa: 'ARS' | 'USD' | 'EUR'
  motivo: string
  fecha: string
  created_at: string
}

export type Invitacion = {
  id: string
  token: string
  contador_id: string
  usado: boolean
  cliente_id?: string
  expires_at: string
  created_at: string
}
