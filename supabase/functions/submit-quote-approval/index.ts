import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SubmitQuoteRequest {
  quote_id: string
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

    const { quote_id, notes }: SubmitQuoteRequest = await req.json()

    console.log('📤 Submitting quote for approval:', quote_id)

    // Verify quote exists and is in draft status
    const { data: quote, error: fetchError } = await supabaseClient
      .from('quotes')
      .select('*')
      .eq('id', quote_id)
      .single()

    if (fetchError || !quote) {
      throw new Error('Quote not found')
    }

    if (quote.status !== 'draft') {
      throw new Error(`Cannot submit quote with status: ${quote.status}`)
    }

    // For corporate quotes, verify cost sheet is approved
    if (quote.quote_type === 'Corporate lease') {
      const { data: costSheet } = await supabaseClient
        .from('quote_cost_sheets')
        .select('status')
        .eq('quote_id', quote_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (costSheet && costSheet.status !== 'approved') {
        throw new Error('Cost sheet must be approved before submitting quote')
      }
    }

    // Auto-approve for demo: Update to approved status directly
    const { error: updateError } = await supabaseClient
      .from('quotes')
      .update({
        status: 'approved',
        submitted_by: user.id,
        submitted_at: new Date().toISOString(),
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        approval_notes: notes ?? null,
      })
      .eq('id', quote_id)

    if (updateError) {
      throw new Error(`Failed to update quote: ${updateError.message}`)
    }

    // Log the auto-approval
    const { error: approvalError } = await supabaseClient
      .from('quote_approvals')
      .insert({
        quote_id,
        approver_user_id: user.id,
        action: 'approved',
        comments: notes ? `Auto-approved (Demo). ${notes}` : 'Auto-approved (Demo)',
      })

    if (approvalError) {
      console.warn('Failed to log approval:', approvalError.message)
    }

    console.log('✅ Quote auto-approved (demo mode)')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Quote submitted and approved',
        quote_id,
        status: 'approved'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Error submitting quote:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
