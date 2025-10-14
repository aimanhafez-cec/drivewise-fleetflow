import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ApplyRatesRequest {
  cost_sheet_id: string
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

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { cost_sheet_id }: ApplyRatesRequest = await req.json()

    console.log('📊 Applying cost sheet rates to vehicle lines:', cost_sheet_id)

    // Get cost sheet and verify it's approved
    const { data: costSheet, error: fetchError } = await supabaseClient
      .from('quote_cost_sheets')
      .select('*, quote:quotes(id, quote_items)')
      .eq('id', cost_sheet_id)
      .single()

    if (fetchError || !costSheet) {
      throw new Error('Cost sheet not found')
    }

    if (costSheet.status !== 'approved') {
      throw new Error('Cost sheet must be approved before applying rates')
    }

    // Get cost sheet lines with suggested rates
    const { data: costSheetLines } = await supabaseClient
      .from('quote_cost_sheet_lines')
      .select('line_no, suggested_rate_per_month_aed')
      .eq('cost_sheet_id', cost_sheet_id)

    if (!costSheetLines || costSheetLines.length === 0) {
      throw new Error('No cost sheet lines found')
    }

    // Get current quote items
    const quoteItems = costSheet.quote?.quote_items || []
    
    if (!Array.isArray(quoteItems) || quoteItems.length === 0) {
      throw new Error('No vehicle lines found in quote')
    }
    
    // Update monthly_rate for each matching line
    const updatedLines = quoteItems.map((line: any) => {
      const costLine = costSheetLines.find(cl => cl.line_no === line.line_no)
      if (costLine && costLine.suggested_rate_per_month_aed) {
        console.log(`✅ Updating line ${line.line_no}: ${line.monthly_rate} → ${costLine.suggested_rate_per_month_aed}`)
        return {
          ...line,
          monthly_rate: costLine.suggested_rate_per_month_aed
        }
      }
      return line
    })

    // Update the quote with modified lines
    const { error: updateError } = await supabaseClient
      .from('quotes')
      .update({ quote_items: updatedLines })
      .eq('id', costSheet.quote_id)

    if (updateError) {
      throw new Error(`Failed to update quote items: ${updateError.message}`)
    }

    console.log('✅ Successfully applied rates to vehicle lines')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Rates applied to vehicle lines successfully',
        updated_lines: updatedLines.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Error applying rates:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
