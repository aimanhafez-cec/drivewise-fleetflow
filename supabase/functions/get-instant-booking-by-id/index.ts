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

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const bookingId = url.pathname.split('/').pop() || url.searchParams.get('id');

    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: 'Booking ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[get-instant-booking-by-id] User: ${user.id}, Booking ID: ${bookingId}`);

    // Fetch detailed booking data
    const { data, error } = await supabaseClient
      .from('reservations')
      .select(`
        *,
        profiles!customer_id(
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
          registration_no,
          make_model,
          year,
          color,
          fuel_type,
          transmission_type,
          odometer_reading,
          vehicle_class_id
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
      .eq('status', 'confirmed')
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
        JSON.stringify({ error: 'Instant booking not found or not eligible' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already converted
    if (data.converted_agreement_id) {
      return new Response(
        JSON.stringify({ 
          error: 'This instant booking has already been converted to an agreement',
          converted_agreement_id: data.converted_agreement_id
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
