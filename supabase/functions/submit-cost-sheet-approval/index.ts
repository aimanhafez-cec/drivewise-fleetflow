import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SubmitApprovalRequest {
  cost_sheet_id: string
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

    // Get user's profile ID
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      throw new Error('User profile not found')
    }

    const { cost_sheet_id, notes }: SubmitApprovalRequest = await req.json()

    console.log('📤 Submitting cost sheet for approval:', cost_sheet_id)

    // Verify cost sheet exists and is in draft status
    const { data: costSheet, error: fetchError } = await supabaseClient
      .from('quote_cost_sheets')
      .select('*, quote:quotes(*)')
      .eq('id', cost_sheet_id)
      .single()

    if (fetchError || !costSheet) {
      throw new Error('Cost sheet not found')
    }

    if (costSheet.status !== 'draft') {
      throw new Error(`Cannot submit cost sheet with status: ${costSheet.status}`)
    }

    // Auto-approve for demo: Update to approved status directly
    const { error: updateError } = await supabaseClient
      .from('quote_cost_sheets')
      .update({
        status: 'approved',
        submitted_by: profile.id,
        submitted_at: new Date().toISOString(),
        approved_by: profile.id,
        approved_at: new Date().toISOString(),
        notes_assumptions: notes ?? costSheet.notes_assumptions,
      })
      .eq('id', cost_sheet_id)

    if (updateError) {
      throw new Error(`Failed to update cost sheet: ${updateError.message}`)
    }

    // Log the auto-approval in the approvals table
    const { error: approvalError } = await supabaseClient
      .from('cost_sheet_approvals')
      .insert({
        cost_sheet_id,
        approver_user_id: profile.id,
        action: 'approved',
        comments: notes ? `Auto-approved (Demo). ${notes}` : 'Auto-approved (Demo)',
      })

    if (approvalError) {
      console.warn('Failed to log approval:', approvalError.message)
    }

    console.log('✅ Cost sheet auto-approved (demo mode)')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Cost sheet submitted for approval',
        cost_sheet_id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Error submitting cost sheet:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})