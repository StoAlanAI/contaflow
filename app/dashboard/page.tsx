import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ContadorDashboard from './ContadorDashboard'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  if (profile.rol !== 'contador') redirect('/mi-cuenta')

  const { data: clientes } = await supabase
    .from('profiles')
    .select('*')
    .eq('contador_id', user.id)
    .order('created_at', { ascending: false })

  const { data: invitaciones } = await supabase
    .from('invitaciones')
    .select('*')
    .eq('contador_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <ContadorDashboard
      profile={profile}
      clientes={clientes ?? []}
      invitacionesRecientes={invitaciones ?? []}
    />
  )
}
