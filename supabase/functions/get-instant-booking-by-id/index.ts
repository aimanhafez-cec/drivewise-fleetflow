import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
    );

    // Extract and verify JWT token
    const authHeader = req.headers.get('Authorization') ?? req.headers.get('authorization') ?? '';
    const jwt = authHeader.replace('Bearer ', '').trim();
    
    if (!jwt) {
      console.error('[get-instant-booking-by-id] Missing Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is authenticated with explicit JWT
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt);
    if (authError || !user) {
      console.error('[get-instant-booking-by-id] Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    let bookingId = url.pathname.split('/').pop() || url.searchParams.get('id') || '';

    // Also accept ID from JSON body (when invoked via supabase.functions.invoke)
    let body: any = null;
    if (req.method !== 'GET') {
      body = await req.json().catch(() => null);
    }
    if (!bookingId && body) {
      bookingId = body.id || body.bookingId || '';
    }

    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: 'Booking ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[get-instant-booking-by-id] User: ${user.id}, Booking ID: ${bookingId}`);

    // Fetch detailed booking data with UI-compatible relation syntax
    const { data, error } = await supabaseClient
      .from('reservations')
      .select(`
        *,
        profiles:customer_id(
          id,
          full_name,
          email,
          phone,
          address,
          date_of_birth,
          license_number,
          license_expiry,
          nationality
        ),
        vehicles(
          id,
          registration_number,
          make,
          model,
          year,
          color,
          fuel_type,
          odometer,
          category_id
        ),
        reservation_addons(
          id,
          addon_id,
          quantity,
          rate,
          total_amount,
          addons(
            id,
            name,
            type,
            rate
          )
        )
      `)
      .eq('id', bookingId)
      .eq('booking_type', 'INSTANT')
      .single();

    if (error) {
      console.error('[get-instant-booking-by-id] Query error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Instant booking not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[get-instant-booking-by-id] Successfully fetched booking: ${data.ro_number}`);

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[get-instant-booking-by-id] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
