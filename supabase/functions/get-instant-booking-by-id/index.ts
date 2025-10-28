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

    console.log(`[get-instant-booking-by-id] Resolved booking ID: ${bookingId}`);

    // Fetch reservation data (without embedded add-ons)
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
        )
      `)
      .eq('id', bookingId)
      .eq('booking_type', 'INSTANT')
      .single();

    if (error) {
      console.error('[get-instant-booking-by-id] Reservation query error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!data) {
      console.error('[get-instant-booking-by-id] Reservation not found');
      return new Response(
        JSON.stringify({ error: 'Instant booking not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[get-instant-booking-by-id] Fetched reservation: ${data.ro_number}`);

    // Fetch add-ons separately
    const { data: addonsData, error: addonsError } = await supabaseClient
      .from('reservation_addons')
      .select(`
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
      `)
      .eq('reservation_id', bookingId);

    if (addonsError) {
      console.error('[get-instant-booking-by-id] Add-ons query error:', addonsError);
      // Continue without add-ons rather than failing
    }

    // Transform add-ons to match wizard mapper expectations
    const transformedAddons = (addonsData || []).map((addon: any) => ({
      id: addon.id,
      addonId: addon.addon_id,
      quantity: addon.quantity,
      unit_price: addon.rate,
      total: addon.total_amount,
      name: addon.addons?.name || 'Unknown Add-on',
      category: addon.addons?.type || 'other',
    }));

    console.log(`[get-instant-booking-by-id] Fetched add-ons count: ${transformedAddons.length}`);

    // Combine reservation with add-ons
    const result = {
      ...data,
      add_ons: transformedAddons,
    };

    return new Response(
      JSON.stringify(result),
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
