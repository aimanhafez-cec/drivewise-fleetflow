import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SubmitAgreementRequest {
  agreement_id: string
  notes?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { agreement_id, notes }: SubmitAgreementRequest = await req.json()

    console.log('📤 Submitting master agreement for approval:', agreement_id)

    // Verify agreement exists and is in draft status
    const { data: agreement, error: fetchError } = await supabaseClient
      .from('corporate_leasing_agreements')
      .select('*')
      .eq('id', agreement_id)
      .single()

    if (fetchError || !agreement) {
      throw new Error('Master agreement not found')
    }

    if (agreement.status !== 'draft') {
      throw new Error(`Cannot submit master agreement with status: ${agreement.status}`)
    }

    // Auto-approve for demo: Update to approved status directly
    const { error: updateError } = await supabaseClient
      .from('corporate_leasing_agreements')
      .update({
        status: 'approved',
        submitted_by: user.id,
        submitted_at: new Date().toISOString(),
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        approval_notes: notes ?? null,
      })
      .eq('id', agreement_id)

    if (updateError) {
      throw new Error(`Failed to update master agreement: ${updateError.message}`)
    }

    console.log('✅ Master agreement auto-approved (demo mode)')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Master agreement submitted and approved',
        agreement_id,
        status: 'approved'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Error submitting master agreement:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
