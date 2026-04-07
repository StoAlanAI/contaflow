import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClienteDetailView from './ClienteDetailView'

export default async function ClienteDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: contadorProfile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (!contadorProfile || contadorProfile.rol !== 'contador') redirect('/mi-cuenta')

  const { data: cliente } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .eq('contador_id', user.id)
    .single()

  if (!cliente) notFound()

  const { data: transacciones } = await supabase
    .from('transacciones')
    .select('*')
    .eq('cliente_id', params.id)
    .order('fecha', { ascending: false })

  return (
    <ClienteDetailView
      contador={contadorProfile}
      cliente={cliente}
      transacciones={transacciones ?? []}
    />
  )
}
