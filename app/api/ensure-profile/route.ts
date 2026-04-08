import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Ver si ya existe el profile
    const { data: existing } = await supabase
      .from('profiles')
      .select('id, rol')
      .eq('id', user.id)
      .single()

    if (existing) return NextResponse.json({ rol: existing.rol })

    // No existe → crear con service role (bypassa RLS)
    const admin = createAdminClient()
    const meta = user.user_metadata ?? {}
    const rol = meta.rol || 'contador'

    const { error: insertError } = await admin.from('profiles').insert({
      id: user.id,
      email: user.email!,
      nombre: meta.nombre || user.email!.split('@')[0],
      rol,
    })

    if (insertError) {
      console.error('[ensure-profile] insert error:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ rol, created: true })
  } catch (e: any) {
    console.error('[ensure-profile] unexpected error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
