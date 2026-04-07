'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { LogOut, LayoutDashboard, User } from 'lucide-react'

interface NavbarProps {
  nombre: string
  rol: 'contador' | 'cliente'
}

export default function Navbar({ nombre, rol }: NavbarProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 border-b"
      style={{
        background: 'rgba(8, 10, 15, 0.92)',
        borderColor: 'rgba(196, 154, 60, 0.15)',
        backdropFilter: 'blur(16px)',
      }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={rol === 'contador' ? '/dashboard' : '/mi-cuenta'}
          className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-md flex items-center justify-center transition-transform group-hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #C49A3C, #A07D28)' }}>
            <span className="text-black font-bold text-xs font-mono">CF</span>
          </div>
          <span className="font-playfair text-lg font-semibold"
            style={{ color: '#C49A3C' }}>ContaFlow</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(196,154,60,0.08)', border: '1px solid rgba(196,154,60,0.15)' }}>
            <User size={13} style={{ color: '#C49A3C' }} />
            <span className="text-xs font-medium" style={{ color: 'rgba(244,244,245,0.7)' }}>
              {nombre}
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded font-mono"
              style={{
                background: rol === 'contador' ? 'rgba(196,154,60,0.15)' : 'rgba(34,197,94,0.12)',
                color: rol === 'contador' ? '#C49A3C' : '#22C55E',
                fontSize: '0.65rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
              {rol}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="btn-ghost flex items-center gap-2 py-2 px-3 text-xs"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
