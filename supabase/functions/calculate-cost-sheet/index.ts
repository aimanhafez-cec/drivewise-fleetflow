import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CalculateCostSheetRequest {
  quote_id: string
  financing_rate?: number
  overhead_percent?: number
  target_margin?: number
  residual_value_percent?: number
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

    const {
      quote_id,
      financing_rate,
      overhead_percent,
      target_margin,
      residual_value_percent
    }: CalculateCostSheetRequest = await req.json()

    console.log('📊 Calculating cost sheet for quote:', quote_id)

    // Fetch quote and its items
    const { data: quote, error: quoteError } = await supabaseClient
      .from('quotes')
      .select('*')
      .eq('id', quote_id)
      .single()

    if (quoteError || !quote) {
      throw new Error(`Quote not found: ${quoteError?.message}`)
    }

    const quoteItems = Array.isArray(quote.quote_items) ? quote.quote_items : []

    if (quoteItems.length === 0) {
      throw new Error('No vehicle lines found in quote')
    }

    // Get default configuration
    const { data: config } = await supabaseClient
      .from('cost_sheet_configurations')
      .select('*')
      .eq('is_active', true)
      .single()

    const finRate = financing_rate ?? config?.financing_rate_percent ?? 6.0
    const overheadPct = overhead_percent ?? config?.overhead_percent ?? 5.0
    const targetMargin = target_margin ?? 15.0
    const residualValue = residual_value_percent ?? 40.0

    // Create or update cost sheet header
    const { data: costSheet, error: costSheetError } = await supabaseClient
      .from('quote_cost_sheets')
      .upsert({
        quote_id,
        financing_rate_percent: finRate,
        overhead_percent: overheadPct,
        target_margin_percent: targetMargin,
        residual_value_percent: residualValue,
        status: 'draft',
      }, {
        onConflict: 'quote_id'
      })
      .select()
      .single()

    if (costSheetError || !costSheet) {
      throw new Error(`Failed to create cost sheet: ${costSheetError?.message}`)
    }

    console.log('✅ Cost sheet created/updated:', costSheet.id)

    // Calculate lines
    const lines = []
    for (const item of quoteItems) {
      const lineNo = item.line_no ?? 0
      
      // Get acquisition cost from vehicle if available
      let acquisitionCost = 150000 // Default estimate
      if (item.vehicle_id) {
        const { data: vehicle } = await supabaseClient
          .from('vehicles')
          .select('daily_rate, monthly_rate')
          .eq('id', item.vehicle_id)
          .single()
        
        if (vehicle?.monthly_rate) {
          // Estimate acquisition cost from monthly rate (rough 36-month lease assumption)
          acquisitionCost = vehicle.monthly_rate * 36
        }
      }

      // Get lease term from item or calculate from dates
      const leaseTerm = item.lease_term_months ?? 36

      // Use config defaults or provided values
      const maintenanceCost = config?.maintenance_per_month_aed ?? 250
      const insuranceCost = config?.insurance_per_month_aed ?? 300
      const registrationCost = config?.registration_admin_per_month_aed ?? 100
      const otherCosts = config?.other_costs_per_month_aed ?? 50

      // Calculate total monthly cost
      const depreciation = (acquisitionCost * (1 - residualValue / 100)) / leaseTerm
      const financing = (acquisitionCost * finRate / 100) / 12
      const overhead = (maintenanceCost + insuranceCost + registrationCost + otherCosts) * (overheadPct / 100)
      
      const totalCost = depreciation + financing + maintenanceCost + insuranceCost + registrationCost + otherCosts + overhead

      // Calculate suggested rate based on target margin
      const suggestedRate = totalCost / (1 - targetMargin / 100)

      // Get current quoted rate
      const quotedRate = item.monthly_rate ?? suggestedRate

      // Calculate actual margin
      const actualMargin = quotedRate > 0 ? ((quotedRate - totalCost) / quotedRate) * 100 : 0

      lines.push({
        cost_sheet_id: costSheet.id,
        line_no: lineNo,
        vehicle_class_id: item.vehicle_class_id,
        vehicle_id: item.vehicle_id,
        lease_term_months: leaseTerm,
        acquisition_cost_aed: acquisitionCost,
        residual_value_percent: residualValue,
        maintenance_per_month_aed: maintenanceCost,
        insurance_per_month_aed: insuranceCost,
        registration_admin_per_month_aed: registrationCost,
        other_costs_per_month_aed: otherCosts,
        total_cost_per_month_aed: totalCost,
        suggested_rate_per_month_aed: suggestedRate,
        quoted_rate_per_month_aed: quotedRate,
        actual_margin_percent: actualMargin,
      })
    }

    // Delete existing lines and insert new ones
    await supabaseClient
      .from('quote_cost_sheet_lines')
      .delete()
      .eq('cost_sheet_id', costSheet.id)

    const { data: insertedLines, error: linesError } = await supabaseClient
      .from('quote_cost_sheet_lines')
      .insert(lines)
      .select()

    if (linesError) {
      throw new Error(`Failed to insert cost sheet lines: ${linesError.message}`)
    }

    console.log('✅ Cost sheet lines created:', insertedLines.length)

    // Calculate summary
    const totalMonthlyCost = lines.reduce((sum, l) => sum + l.total_cost_per_month_aed, 0)
    const totalRevenue = lines.reduce((sum, l) => sum + l.quoted_rate_per_month_aed, 0)
    const avgMargin = totalRevenue > 0 ? ((totalRevenue - totalMonthlyCost) / totalRevenue) * 100 : 0
    const lowestMarginLine = lines.reduce((min, l) => 
      l.actual_margin_percent < min.actual_margin_percent ? l : min, lines[0])

    return new Response(
      JSON.stringify({
        cost_sheet_id: costSheet.id,
        lines: insertedLines,
        summary: {
          total_monthly_cost: totalMonthlyCost,
          total_revenue: totalRevenue,
          average_margin: avgMargin,
          lowest_margin_line: {
            line_no: lowestMarginLine.line_no,
            margin: lowestMarginLine.actual_margin_percent,
          },
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Error calculating cost sheet:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})