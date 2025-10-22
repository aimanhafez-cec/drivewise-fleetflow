import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuoteActionRequest {
  token: string;
  action: 'accept' | 'reject';
  reason_or_notes?: string;
  signature_data?: string;
  signer_name?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📝 [customer-quote-action] Request received');

    const body: QuoteActionRequest = await req.json();
    const { token, action, reason_or_notes, signature_data, signer_name } = body;

    // Validate required fields
    if (!token || !action) {
      console.error('❌ [customer-quote-action] Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Token and action are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['accept', 'reject'].includes(action)) {
      console.error('❌ [customer-quote-action] Invalid action:', action);
      return new Response(
        JSON.stringify({ error: 'Action must be either "accept" or "reject"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate action-specific requirements
    if (action === 'accept' && !signature_data) {
      console.error('❌ [customer-quote-action] Signature required for acceptance');
      return new Response(
        JSON.stringify({ error: 'Signature is required to accept the quote' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'reject' && !reason_or_notes?.trim()) {
      console.error('❌ [customer-quote-action] Rejection reason required');
      return new Response(
        JSON.stringify({ error: 'Rejection reason is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔍 [customer-quote-action] Processing:', { action, token: token.substring(0, 8) + '...' });

    // Create Supabase client with service role key
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
      console.error('❌ [customer-quote-action] Quote not found:', quoteError);
      return new Response(
        JSON.stringify({ error: 'Quote not found or invalid token' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ [customer-quote-action] Quote found:', quote.quote_number);

    // Check if token has expired
    if (quote.public_token_expires_at) {
      const expiryDate = new Date(quote.public_token_expires_at);
      const now = new Date();
      
      if (expiryDate < now) {
        console.warn('⚠️ [customer-quote-action] Token expired');
        return new Response(
          JSON.stringify({ error: 'This quote link has expired' }),
          { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check if quote has already been responded to
    if (quote.customer_acceptance_status === 'accepted' || quote.customer_acceptance_status === 'rejected') {
      console.warn('⚠️ [customer-quote-action] Quote already processed:', quote.customer_acceptance_status);
      return new Response(
        JSON.stringify({ 
          error: `This quote has already been ${quote.customer_acceptance_status}`,
          current_status: quote.customer_acceptance_status 
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare update data based on action
    const updateData: any = {
      customer_signed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (action === 'accept') {
      updateData.customer_acceptance_status = 'accepted';
      updateData.customer_signature = {
        dataUrl: signature_data,
        signerName: signer_name,
        signedAt: new Date().toISOString()
      };
      updateData.status = 'accepted'; // Update main quote status as well
      
      console.log('✅ [customer-quote-action] Processing acceptance with signature');
    } else {
      updateData.customer_acceptance_status = 'rejected';
      updateData.customer_rejection_reason = reason_or_notes;
      updateData.status = 'rejected'; // Update main quote status as well
      
      console.log('✅ [customer-quote-action] Processing rejection with reason');
    }

    // Update the quote
    const { error: updateError } = await supabase
      .from('quotes')
      .update(updateData)
      .eq('id', quote.id);

    if (updateError) {
      console.error('❌ [customer-quote-action] Update failed:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update quote', details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ [customer-quote-action] Quote updated successfully:', {
      quote_number: quote.quote_number,
      action,
      new_status: updateData.customer_acceptance_status
    });

    // Return success response
    const successMessage = action === 'accept' 
      ? 'Thank you! Your acceptance has been recorded. We will contact you shortly to proceed with the next steps.'
      : 'Your rejection has been recorded. Thank you for your time. Our team will reach out to discuss alternatives.';

    return new Response(
      JSON.stringify({ 
        success: true,
        message: successMessage,
        quote_number: quote.quote_number,
        action: action,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('❌ [customer-quote-action] Error:', error.message);
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
