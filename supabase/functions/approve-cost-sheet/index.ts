import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ApproveRequest {
  cost_sheet_id: string
  action: 'approved' | 'rejected'
  comments?: string
  apply_suggested_rates?: boolean
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

    const { 
      cost_sheet_id, 
      action, 
      comments, 
      apply_suggested_rates = false 
    }: ApproveRequest = await req.json()

    console.log(`${action === 'approved' ? '✅' : '❌'} Processing cost sheet ${action}:`, cost_sheet_id)

    // Verify cost sheet exists and is pending approval
    const { data: costSheet, error: fetchError } = await supabaseClient
      .from('quote_cost_sheets')
      .select('*, quote:quotes(*)')
      .eq('id', cost_sheet_id)
      .single()

    if (fetchError || !costSheet) {
      throw new Error('Cost sheet not found')
    }

    if (costSheet.status !== 'pending_approval') {
      throw new Error(`Cannot ${action} cost sheet with status: ${costSheet.status}`)
    }

    const newStatus = action === 'approved' ? 'approved' : 'rejected'

    // Update cost sheet status
    const { error: updateError } = await supabaseClient
      .from('quote_cost_sheets')
      .update({
        status: newStatus,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        approval_notes: comments,
      })
      .eq('id', cost_sheet_id)

    if (updateError) {
      throw new Error(`Failed to update cost sheet: ${updateError.message}`)
    }

    // Log approval/rejection
    const { error: approvalError } = await supabaseClient
      .from('cost_sheet_approvals')
      .insert({
        cost_sheet_id,
        approver_user_id: user.id,
        action,
        comments,
      })

    if (approvalError) {
      console.warn('Failed to log approval:', approvalError.message)
    }

    // If approved and apply_suggested_rates is true, update quote items
    if (action === 'approved' && apply_suggested_rates) {
      console.log('📝 Applying suggested rates to quote items')
      
      const { data: lines } = await supabaseClient
        .from('quote_cost_sheet_lines')
        .select('*')
        .eq('cost_sheet_id', cost_sheet_id)

      if (lines && lines.length > 0) {
        // Get quote items
        const { data: quoteItems } = await supabaseClient
          .from('quote_items')
          .select('*')
          .eq('quote_id', costSheet.quote_id)

        if (quoteItems) {
          // Update each quote item with suggested rate
          for (const line of lines) {
            const matchingItem = quoteItems.find(qi => qi.line_no === line.line_no)
            if (matchingItem) {
              await supabaseClient
                .from('quote_items')
                .update({
                  monthly_rate: line.suggested_rate_per_month_aed,
                })
                .eq('id', matchingItem.id)
            }
          }
          
          console.log('✅ Applied suggested rates to quote items')
        }
      }
    }

    console.log(`✅ Cost sheet ${action} successfully`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Cost sheet ${action} successfully`,
        cost_sheet_id,
        status: newStatus
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Error processing cost sheet approval:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})