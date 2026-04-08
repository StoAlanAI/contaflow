import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  // Ver si ya existe el profile
  const { data: existing } = await supabase
    .from('profiles')
    .select('id, rol')
    .eq('id', user.id)
    .single()

  if (existing) return NextResponse.json({ rol: existing.rol })

  // No existe → crearlo con service role (bypassa RLS)
  const admin = createAdminClient()
  const meta = user.user_metadata ?? {}

  const { error } = await admin.from('profiles').insert({
    id: user.id,
    email: user.email!,
    nombre: meta.nombre || user.email!.split('@')[0],
    rol: meta.rol || 'contador',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ rol: meta.rol || 'contador', created: true })
}
