import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📄 [get-public-quote] Request received');
    
    // Get token from query params
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      console.error('❌ [get-public-quote] No token provided');
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔍 [get-public-quote] Looking up quote with token:', token.substring(0, 8) + '...');

    // Create Supabase client with service role key for public access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch quote by public token
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('public_token', token)
      .single();

    if (quoteError || !quote) {
      console.error('❌ [get-public-quote] Quote not found:', quoteError);
      return new Response(
        JSON.stringify({ error: 'Quote not found or invalid token' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ [get-public-quote] Quote found:', quote.quote_number);

    // Check if token has expired
    if (quote.public_token_expires_at) {
      const expiryDate = new Date(quote.public_token_expires_at);
      const now = new Date();
      
      if (expiryDate < now) {
        console.warn('⚠️ [get-public-quote] Token expired:', {
          quote_number: quote.quote_number,
          expired_at: expiryDate.toISOString()
        });
        return new Response(
          JSON.stringify({ 
            error: 'This quote link has expired',
            expired_at: expiryDate.toISOString()
          }),
          { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fetch related data for enrichment
    const relatedData: any = {};

    // Fetch customer info
    if (quote.customer_id) {
      const { data: customer } = await supabase
        .from('customers')
        .select('id, full_name, email, phone')
        .eq('id', quote.customer_id)
        .single();
      
      if (customer) {
        relatedData.customer = customer;
      }
    }

    // Fetch contact person
    if (quote.contact_person_id) {
      const { data: contact } = await supabase
        .from('contact_persons')
        .select('full_name, email, phone')
        .eq('id', quote.contact_person_id)
        .single();
      
      if (contact) {
        relatedData.contact_person = contact;
      }
    }

    // Fetch sales rep info
    if (quote.sales_rep_id) {
      const { data: salesRep } = await supabase
        .from('sales_representatives')
        .select('full_name, email, phone')
        .eq('id', quote.sales_rep_id)
        .single();
      
      if (salesRep) {
        relatedData.sales_rep = salesRep;
      }
    }

    // Enrich quote_items with vehicle metadata if available
    if (quote.quote_items && Array.isArray(quote.quote_items)) {
      const enrichedItems = await Promise.all(
        quote.quote_items.map(async (item: any) => {
          if (item.vehicle_id) {
            const { data: vehicle } = await supabase
              .from('vehicles')
              .select('make, model, year, color, category_id')
              .eq('id', item.vehicle_id)
              .single();
            
            if (vehicle) {
              item._vehicleMeta = vehicle;
            }
          }
          return item;
        })
      );
      quote.quote_items = enrichedItems;
    }

    // Sanitize sensitive fields before sending to customer
    const sanitizedQuote = {
      id: quote.id,
      quote_number: quote.quote_number,
      quote_date: quote.quote_date || quote.created_at,
      valid_until: quote.valid_until || quote.validity_date_to,
      public_token_expires_at: quote.public_token_expires_at,
      customer_acceptance_status: quote.customer_acceptance_status,
      account_name: quote.account_name,
      customer_bill_to: quote.customer_bill_to,
      quote_type: quote.quote_type,
      billing_plan: quote.billing_plan,
      duration_days: quote.duration_days,
      currency: quote.currency || 'AED',
      subtotal: quote.subtotal,
      tax_amount: quote.tax_amount,
      total_amount: quote.total_amount,
      notes: quote.notes,
      payment_terms: quote.payment_terms,
      quote_items: quote.quote_items,
      customer_rejection_reason: quote.customer_rejection_reason,
      customer_signed_at: quote.customer_signed_at,
      ...relatedData
    };

    console.log('✅ [get-public-quote] Returning quote data');

    return new Response(
      JSON.stringify({ 
        success: true,
        quote: sanitizedQuote 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('❌ [get-public-quote] Error:', error.message);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
