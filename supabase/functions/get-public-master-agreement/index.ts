import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      throw new Error("Token is required");
    }

    console.log("🔍 Fetching public master agreement with token:", token);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch agreement by public token
    const { data: agreement, error: agreementError } = await supabase
      .from("corporate_leasing_agreements")
      .select("*")
      .eq("public_token", token)
      .single();

    if (agreementError || !agreement) {
      console.error("❌ Agreement not found:", agreementError);
      throw new Error("Master agreement not found or invalid token");
    }

    // Check if token is expired
    if (agreement.public_token_expires_at) {
      const expiresAt = new Date(agreement.public_token_expires_at);
      if (expiresAt < new Date()) {
        throw new Error("This link has expired");
      }
    }

    // Fetch related data separately
    let customer = null;
    let contact_person = null;
    let legal_entity = null;
    let business_unit = null;

    if (agreement.customer_id) {
      const { data } = await supabase
        .from("customers")
        .select("id, full_name, email, phone, company_name")
        .eq("id", agreement.customer_id)
        .single();
      customer = data;
    }

    if (agreement.contact_person_id) {
      const { data } = await supabase
        .from("contact_persons")
        .select("id, full_name, email, phone, title")
        .eq("id", agreement.contact_person_id)
        .single();
      contact_person = data;
    }

    if (agreement.legal_entity_id) {
      const { data } = await supabase
        .from("legal_entities")
        .select("id, name, code")
        .eq("id", agreement.legal_entity_id)
        .single();
      legal_entity = data;
    }

    if (agreement.business_unit_id) {
      const { data } = await supabase
        .from("business_units")
        .select("id, name, code")
        .eq("id", agreement.business_unit_id)
        .single();
      business_unit = data;
    }

    // Hydrate vehicle data for each agreement item
    const agreementItems = agreement.agreement_items || [];
    const hydratedItems = await Promise.all(
      agreementItems.map(async (item: any) => {
        let vehicleMeta = null;
        let vehicleClass = null;

        if (item.vehicle_id) {
          const { data } = await supabase
            .from("vehicles")
            .select("id, make, model, year, color, plate_no, vin, item_code")
            .eq("id", item.vehicle_id)
            .single();
          vehicleMeta = data;
        }

        if (item.vehicle_class_id) {
          const { data } = await supabase
            .from("vehicle_classes")
            .select("id, name, code")
            .eq("id", item.vehicle_class_id)
            .single();
          vehicleClass = data;
        }

        return {
          ...item,
          _vehicleMeta: vehicleMeta,
          _vehicleClass: vehicleClass,
        };
      })
    );

    // Build complete response
    const response = {
      ...agreement,
      customer,
      contact_person,
      legal_entity,
      business_unit,
      agreement_items: hydratedItems,
    };

    console.log("✅ Public master agreement fetched successfully");

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("❌ Error fetching public master agreement:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
