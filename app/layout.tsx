import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ContaFlow — Gestión Financiera',
  description: 'Plataforma de gestión financiera para contadores y sus clientes',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
