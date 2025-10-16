import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Round to 2 decimal places for currency
const roundCurrency = (value: number): number => {
  return Math.round(value * 100) / 100
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

    const finRate = financing_rate ?? config?.financing_rate_percent ?? 5.5
    const overheadPct = overhead_percent ?? config?.overhead_percent ?? 8.0
    const targetMargin = target_margin ?? 15.0
    // Residual value will be dynamically set based on lease term for each line

    // Check for existing draft cost sheet
    const { data: existingDraft } = await supabaseClient
      .from('quote_cost_sheets')
      .select('id, version')
      .eq('quote_id', quote_id)
      .eq('status', 'draft')
      .single()

    let costSheet
    
    if (existingDraft) {
      // Update existing draft
      const { data, error: updateError } = await supabaseClient
        .from('quote_cost_sheets')
        .update({
          financing_rate_percent: finRate,
          overhead_percent: overheadPct,
          target_margin_percent: targetMargin,
          residual_value_percent: residualValue,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingDraft.id)
        .select()
        .single()
      
      if (updateError) throw updateError
      costSheet = data
    } else {
      // Create new version
      const { data: maxVersionData } = await supabaseClient
        .from('quote_cost_sheets')
        .select('version')
        .eq('quote_id', quote_id)
        .order('version', { ascending: false })
        .limit(1)
        .single()
      
      const nextVersion = (maxVersionData?.version || 0) + 1
      
      const { data, error: insertError } = await supabaseClient
        .from('quote_cost_sheets')
        .insert({
          quote_id,
          version: nextVersion,
          financing_rate_percent: finRate,
          overhead_percent: overheadPct,
          target_margin_percent: targetMargin,
          residual_value_percent: residualValue,
          status: 'draft',
        })
        .select()
        .single()
      
      if (insertError) throw insertError
      costSheet = data
    }

    if (!costSheet) {
      throw new Error('Failed to create/update cost sheet')
    }

    console.log('✅ Cost sheet created/updated:', costSheet.id)

    // Calculate lines
    const lines = []
    for (const item of quoteItems) {
      const lineNo = item.line_no ?? 0
      
      // Get acquisition cost from vehicle database
      let acquisitionCost = 135000 // Default for mid-range SUV
      
      if (item.vehicle_id) {
        const { data: vehicle } = await supabaseClient
          .from('vehicles')
          .select('make, model, year, acquisition_cost')
          .eq('id', item.vehicle_id)
          .single()
        
        // Use stored acquisition cost if available
        if (vehicle?.acquisition_cost && vehicle.acquisition_cost > 0) {
          acquisitionCost = vehicle.acquisition_cost
        } else {
          // Intelligent estimation based on vehicle class
          const makeModel = `${vehicle?.make || ''} ${vehicle?.model || ''}`.toLowerCase()
          
          if (makeModel.includes('civic') || makeModel.includes('corolla') || 
              makeModel.includes('sentra') || makeModel.includes('altima')) {
            acquisitionCost = 105000 // Economy/Mid sedans
          } else if (makeModel.includes('camry') || makeModel.includes('accord') || 
                     makeModel.includes('maxima')) {
            acquisitionCost = 120000 // Premium sedans
          } else if (makeModel.includes('cr-v') || makeModel.includes('rav4') || 
                     makeModel.includes('rogue') || makeModel.includes('tucson')) {
            acquisitionCost = 135000 // Compact SUVs
          } else if (makeModel.includes('highlander') || makeModel.includes('pilot') || 
                     makeModel.includes('pathfinder')) {
            acquisitionCost = 170000 // Mid SUVs
          } else if (makeModel.includes('x5') || makeModel.includes('gle') || 
                     makeModel.includes('q7')) {
            acquisitionCost = 280000 // Premium SUVs
          } else if (makeModel.includes('750') || makeModel.includes('s-class') || 
                     makeModel.includes('a8')) {
            acquisitionCost = 420000 // Luxury sedans
          } else if (makeModel.includes('f-150') || makeModel.includes('hilux') || 
                     makeModel.includes('silverado')) {
            acquisitionCost = 150000 // Pickup trucks
          } else if (makeModel.includes('mustang') || makeModel.includes('camaro') || 
                     makeModel.includes('convertible')) {
            acquisitionCost = 220000 // Sports/convertibles
          }
          
          // Age depreciation adjustment
          const currentYear = new Date().getFullYear()
          const age = currentYear - (vehicle?.year || currentYear)
          if (age > 0) {
            acquisitionCost = acquisitionCost * Math.pow(0.90, age) // 10% per year
          }
        }
      }

      // Get lease term from item or calculate from dates
      const leaseTerm = item.lease_term_months ?? 36

      // Dynamic residual value based on lease term (shorter leases = higher residual)
      let dynamicResidualValue = residual_value_percent ?? 40.0
      if (leaseTerm <= 12) {
        dynamicResidualValue = 85.0  // 12-month: vehicle retains 85% value
      } else if (leaseTerm <= 18) {
        dynamicResidualValue = 75.0  // 18-month: vehicle retains 75% value
      } else if (leaseTerm <= 24) {
        dynamicResidualValue = 65.0  // 24-month: vehicle retains 65% value
      } else if (leaseTerm <= 30) {
        dynamicResidualValue = 55.0  // 30-month: vehicle retains 55% value
      } else {
        dynamicResidualValue = 45.0  // 36+ month: vehicle retains 45% value
      }

      // Determine if maintenance is included
      // Check per-vehicle override first, then fall back to quote-level setting
      const maintenanceIncluded = item.maintenance_included ?? quote.maintenance_included ?? false
      
      // Use config defaults or provided values
      const maintenanceCost = maintenanceIncluded 
        ? (item.monthly_maintenance_cost ?? quote.monthly_maintenance_cost_per_vehicle ?? config?.maintenance_per_month_aed ?? 350)
        : 0
      const insuranceCost = config?.insurance_per_month_aed ?? 450
      const registrationCost = config?.registration_admin_per_month_aed ?? 125
      const otherCosts = config?.other_costs_per_month_aed ?? 75

      console.log(`Line ${lineNo}: Maintenance ${maintenanceIncluded ? 'INCLUDED' : 'EXCLUDED'} - ${maintenanceCost} AED/month`)

      // Calculate total monthly cost
      const depreciation = (acquisitionCost * (1 - dynamicResidualValue / 100)) / leaseTerm
      const financing = (acquisitionCost * finRate / 100) / 12
      const overhead = (maintenanceCost + insuranceCost + registrationCost + otherCosts) * (overheadPct / 100)
      
      const totalCost = depreciation + financing + maintenanceCost + insuranceCost + registrationCost + otherCosts + overhead

      // Calculate base suggested rate based on target margin
      let suggestedRate = roundCurrency(totalCost / (1 - targetMargin / 100))

      // Apply short-term lease premium
      let leasePremiumMultiplier = 1.0
      if (leaseTerm <= 12) {
        leasePremiumMultiplier = 1.25  // 25% premium for 12-month
      } else if (leaseTerm <= 18) {
        leasePremiumMultiplier = 1.15  // 15% premium for 18-month
      } else if (leaseTerm <= 24) {
        leasePremiumMultiplier = 1.10  // 10% premium for 24-month
      }

      suggestedRate = roundCurrency(suggestedRate * leasePremiumMultiplier)

      // Get current quoted rate
      const quotedRate = roundCurrency(item.monthly_rate ?? suggestedRate)

      // Calculate actual margin
      const actualMargin = roundCurrency(quotedRate > 0 ? ((quotedRate - totalCost) / quotedRate) * 100 : 0)

      lines.push({
        cost_sheet_id: costSheet.id,
        line_no: lineNo,
        vehicle_class_id: item.vehicle_class_id,
        vehicle_id: item.vehicle_id,
        lease_term_months: leaseTerm,
        acquisition_cost_aed: roundCurrency(acquisitionCost),
        residual_value_percent: dynamicResidualValue,
        maintenance_per_month_aed: roundCurrency(maintenanceCost),
        insurance_per_month_aed: roundCurrency(insuranceCost),
        registration_admin_per_month_aed: roundCurrency(registrationCost),
        other_costs_per_month_aed: roundCurrency(otherCosts),
        total_cost_per_month_aed: roundCurrency(totalCost),
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
    const totalMonthlyCost = roundCurrency(lines.reduce((sum, l) => sum + l.total_cost_per_month_aed, 0))
    const totalRevenue = roundCurrency(lines.reduce((sum, l) => sum + l.quoted_rate_per_month_aed, 0))
    const avgMargin = roundCurrency(totalRevenue > 0 ? ((totalRevenue - totalMonthlyCost) / totalRevenue) * 100 : 0)
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