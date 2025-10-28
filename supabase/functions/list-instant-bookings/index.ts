import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

interface ListInstantBookingsRequest {
  q?: string;
  page?: number;
  pageSize?: number;
}

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
      console.error('[list-instant-bookings] Missing Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is authenticated with explicit JWT
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt);
    if (authError || !user) {
      console.error('[list-instant-bookings] Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { q = '', page = 1, pageSize = 20 }: ListInstantBookingsRequest = 
      req.method === 'POST' ? await req.json() : Object.fromEntries(new URL(req.url).searchParams);

    console.log(`[list-instant-bookings] User: ${user.id}, Query: "${q}", Page: ${page}, PageSize: ${pageSize}`);

    // Build base query with UI-compatible field names
    let query = supabaseClient
      .from('reservations')
      .select(`
        id,
        ro_number,
        created_at,
        pickup_datetime:start_datetime,
        return_datetime:end_datetime,
        pickup_location,
        return_location,
        status,
        booking_type,
        converted_agreement_id,
        total_amount,
        customer_id,
        vehicle_id,
        profiles:customer_id(
          id,
          full_name,
          email,
          phone
        ),
        vehicles(
          id,
          registration_number,
          make,
          model,
          year
        )
      `, { count: 'exact' })
      .eq('booking_type', 'INSTANT')
      .order('created_at', { ascending: false });

    // Apply search filter if provided
    if (q && q.trim()) {
      const searchTerm = q.trim();
      query = query.or(`ro_number.ilike.%${searchTerm}%,profiles.full_name.ilike.%${searchTerm}%,profiles.email.ilike.%${searchTerm}%,profiles.phone.ilike.%${searchTerm}%,vehicles.registration_number.ilike.%${searchTerm}%,vehicles.make.ilike.%${searchTerm}%,vehicles.model.ilike.%${searchTerm}%`);
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('[list-instant-bookings] Query error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[list-instant-bookings] Found ${data?.length || 0} items (total: ${count})`);

    return new Response(
      JSON.stringify({
        items: data || [],
        page,
        pageSize,
        total: count || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[list-instant-bookings] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
