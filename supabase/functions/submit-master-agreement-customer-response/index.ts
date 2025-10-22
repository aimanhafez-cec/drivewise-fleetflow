import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CustomerResponseRequest {
  token: string;
  action: "accept" | "reject";
  signature_data?: {
    signature_image: string;
    signer_name: string;
    signer_title?: string;
    signed_at: string;
    ip_address?: string;
  };
  rejection_reason?: string;
  comments?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: CustomerResponseRequest = await req.json();
    const { token, action, signature_data, rejection_reason, comments } = body;

    if (!token || !action) {
      throw new Error("Token and action are required");
    }

    console.log("📝 Processing customer response:", { token, action });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch agreement by token
    const { data: agreement, error: agreementError } = await supabase
      .from("corporate_leasing_agreements")
      .select("*")
      .eq("public_token", token)
      .single();

    if (agreementError || !agreement) {
      throw new Error("Master agreement not found or invalid token");
    }

    // Check if token is expired
    if (agreement.public_token_expires_at) {
      const expiresAt = new Date(agreement.public_token_expires_at);
      if (expiresAt < new Date()) {
        throw new Error("This link has expired");
      }
    }

    // Check if customer already responded
    if (agreement.customer_acceptance_status !== "pending") {
      throw new Error(
        `Customer has already ${agreement.customer_acceptance_status} this agreement`
      );
    }

    // Validate acceptance requirements
    if (action === "accept") {
      if (!signature_data || !signature_data.signature_image || !signature_data.signer_name) {
        throw new Error("Signature and signer name are required for acceptance");
      }
    }

    // Validate rejection requirements
    if (action === "reject" && !rejection_reason) {
      throw new Error("Rejection reason is required");
    }

    // Prepare update data
    const updateData: any = {
      customer_acceptance_status: action === "accept" ? "accepted" : "rejected",
      customer_comments: comments || null,
    };

    if (action === "accept") {
      updateData.customer_signed_at = new Date().toISOString();
      updateData.customer_signature_data = signature_data;
      updateData.status = "customer_accepted";
    } else {
      updateData.customer_rejection_reason = rejection_reason;
      updateData.status = "customer_rejected";
    }

    // Update agreement
    const { error: updateError } = await supabase
      .from("corporate_leasing_agreements")
      .update(updateData)
      .eq("id", agreement.id);

    if (updateError) {
      console.error("❌ Update error:", updateError);
      throw new Error("Failed to update master agreement");
    }

    console.log(`✅ Customer ${action}ed master agreement successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Master agreement ${action}ed successfully`,
        action,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("❌ Error processing customer response:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
