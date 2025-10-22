import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendAgreementRequest {
  agreement_id: string;
  recipient_email: string;
  custom_message?: string;
  expiration_days?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get auth user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const { agreement_id, recipient_email, custom_message, expiration_days = 30 } = await req.json() as SendAgreementRequest;

    console.log("📧 Sending master agreement to customer:", { agreement_id, recipient_email, expiration_days });

    // Fetch agreement details
    const { data: agreement, error: agreementError } = await supabase
      .from("corporate_leasing_agreements")
      .select("*")
      .eq("id", agreement_id)
      .single();

    if (agreementError || !agreement) {
      console.error("❌ Agreement fetch error:", agreementError);
      throw new Error("Master agreement not found");
    }

    // Fetch related data separately
    let customer = null;
    let contact_person = null;

    if (agreement.customer_id) {
      const { data } = await supabase
        .from("customers")
        .select("full_name, email")
        .eq("id", agreement.customer_id)
        .single();
      customer = data;
    }

    if (agreement.contact_person_id) {
      const { data } = await supabase
        .from("contact_persons")
        .select("full_name, email")
        .eq("id", agreement.contact_person_id)
        .single();
      contact_person = data;
    }

    // Attach the related data to the agreement object
    agreement.customer = customer;
    agreement.contact_person = contact_person;

    // Generate unique public token
    const public_token = crypto.randomUUID();
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + expiration_days);

    // Update agreement with token and sent info
    const { error: updateError } = await supabase
      .from("corporate_leasing_agreements")
      .update({
        public_token,
        public_token_expires_at: expires_at.toISOString(),
        sent_to_customer_at: new Date().toISOString(),
        customer_acceptance_status: 'pending',
        status: 'sent_to_customer'
      })
      .eq("id", agreement_id);

    if (updateError) {
      console.error("❌ Update error:", updateError);
      throw new Error("Failed to update master agreement");
    }

    // Generate customer review link
    const customer_link = `${supabaseUrl.replace('.supabase.co', '')}.lovableproject.com/master-agreement-review/${public_token}`;

    // Calculate totals from agreement_items
    const agreementItems = agreement.agreement_items || [];
    const totalMonthlyRate = agreementItems.reduce((sum: number, item: any) => 
      sum + (parseFloat(item.monthly_rate) || 0), 0
    );
    const vatAmount = totalMonthlyRate * (agreement.vat_percentage || 5) / 100;
    const grandTotal = totalMonthlyRate + vatAmount;

    // Send email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .button { display: inline-block; background: #667eea; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .summary { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .summary-row:last-child { border-bottom: none; font-weight: 600; font-size: 18px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            .expiry { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Master Agreement Review Required</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Agreement #${agreement.agreement_no}</p>
            </div>
            
            <div class="content">
              <p>Dear ${agreement.customer?.full_name || 'Valued Customer'},</p>
              
              <p>${custom_message || 'We are pleased to present your Master Agreement for review. Please take a moment to review the details and provide your decision.'}</p>
              
              <div class="summary">
                <h3 style="margin-top: 0;">Agreement Summary</h3>
                <div class="summary-row">
                  <span>Agreement Number:</span>
                  <strong>${agreement.agreement_no}</strong>
                </div>
                <div class="summary-row">
                  <span>Agreement Date:</span>
                  <strong>${new Date(agreement.agreement_date).toLocaleDateString()}</strong>
                </div>
                <div class="summary-row">
                  <span>Contract Period:</span>
                  <strong>${new Date(agreement.contract_effective_from).toLocaleDateString()} - ${new Date(agreement.contract_effective_to).toLocaleDateString()}</strong>
                </div>
                <div class="summary-row">
                  <span>Number of Vehicles:</span>
                  <strong>${agreementItems.length}</strong>
                </div>
                <div class="summary-row">
                  <span>Monthly Subtotal:</span>
                  <strong>AED ${totalMonthlyRate.toFixed(2)}</strong>
                </div>
                <div class="summary-row">
                  <span>VAT (${agreement.vat_percentage}%):</span>
                  <strong>AED ${vatAmount.toFixed(2)}</strong>
                </div>
                <div class="summary-row">
                  <span>Total:</span>
                  <strong>AED ${grandTotal.toFixed(2)}</strong>
                </div>
              </div>
              
              <div style="text-align: center;">
                <a href="${customer_link}" class="button">Review & Sign Agreement</a>
              </div>
              
              <div class="expiry">
                <strong>⏰ Action Required:</strong> This link will expire on ${expires_at.toLocaleDateString()} (${expiration_days} days).
              </div>
              
              <p style="margin-top: 30px;">If you have any questions, please don't hesitate to contact us:</p>
              <p style="margin: 5px 0;">
                <strong>Autostrad Corporate Leasing</strong><br>
                leasing@autostrad.com
              </p>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                If you cannot click the button above, copy and paste this link into your browser:<br>
                <span style="word-break: break-all;">${customer_link}</span>
              </p>
            </div>
            
            <div class="footer">
              <p><strong>Autostrad Car Rental</strong></p>
              <p>This is an automated email. Please do not reply directly to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Autostrad Master Agreements <agreements@resend.dev>",
      to: [recipient_email],
      subject: `Master Agreement #${agreement.agreement_no} from Autostrad - Action Required`,
      html: emailHtml,
    });

    if (emailError) {
      console.error("❌ Email error:", emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    console.log("✅ Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({
        success: true,
        customer_link,
        expires_at: expires_at.toISOString(),
        email_id: emailData?.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("❌ Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
