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

    // Create service role client for profile lookup (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user's profile ID using service role
    let { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    // If profile doesn't exist, create one automatically
    if (!profile) {
      console.log('Profile not found, creating one for user:', user.id)
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        })
        .select('id')
        .single()
      
      if (createError || !newProfile) {
        throw new Error(`Failed to create user profile: ${createError?.message}`)
      }
      
      profile = newProfile
    }

    if (profileError) {
      throw new Error(`Profile query error: ${profileError.message}`)
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