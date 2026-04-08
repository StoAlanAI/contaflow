import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClienteDashboard from './ClienteDashboard'

export default async function MiCuentaPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (!profile) redirect('/login')
  if (profile.rol !== 'cliente') redirect('/dashboard')

  const { data: transacciones } = await supabase
    .from('transacciones')
    .select('*')
    .eq('cliente_id', user.id)
    .order('fecha', { ascending: false })

  const { data: contador } = profile.contador_id
    ? await supabase.from('profiles').select('nombre,email').eq('id', profile.contador_id).single()
    : { data: null }

  return (
    <ClienteDashboard
      profile={profile}
      transacciones={transacciones ?? []}
      contador={contador}
    />
  )
}
