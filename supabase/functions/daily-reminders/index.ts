// supabase/functions/daily-reminders/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const today = new Date().toISOString().slice(0, 10)

  const { data: reminders, error } = await supabase
    .from('reminders')
    .select('*, pets!inner(name)')
    .eq('due_date', today)
    .eq('is_completed', false)

  if (error) {
    console.error('Error fetching reminders:', error)
    return new Response('Error', { status: 500 })
  }

  for (const r of reminders ?? []) {
    console.log(`📅 Reminder: ${r.pets?.name} - ${r.title}`)
    // Future: send email via Resend / Supabase built-in email
  }

  return new Response(`Processed ${reminders?.length ?? 0} reminders`)
})
