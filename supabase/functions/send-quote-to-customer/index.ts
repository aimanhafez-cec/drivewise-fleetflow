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

interface SendQuoteRequest {
  quote_id: string;
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

    const { quote_id, recipient_email, custom_message, expiration_days = 30 } = await req.json() as SendQuoteRequest;

    console.log("📧 Sending quote to customer:", { quote_id, recipient_email, expiration_days });

    // Fetch quote details
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", quote_id)
      .single();

    if (quoteError || !quote) {
      console.error("❌ Quote fetch error:", quoteError);
      throw new Error("Quote not found");
    }

    // Fetch related data separately
    let customer = null;
    let contact_person = null;
    let sales_rep = null;

    if (quote.customer_id) {
      const { data } = await supabase
        .from("customers")
        .select("full_name, email")
        .eq("id", quote.customer_id)
        .single();
      customer = data;
    }

    if (quote.contact_person_id) {
      const { data } = await supabase
        .from("contact_persons")
        .select("full_name, email")
        .eq("id", quote.contact_person_id)
        .single();
      contact_person = data;
    }

    if (quote.sales_rep_id) {
      const { data } = await supabase
        .from("sales_representatives")
        .select("full_name, email")
        .eq("id", quote.sales_rep_id)
        .single();
      sales_rep = data;
    }

    // Attach the related data to the quote object
    quote.customer = customer;
    quote.contact_person = contact_person;
    quote.sales_rep = sales_rep;

    // Generate unique public token
    const public_token = crypto.randomUUID();
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + expiration_days);

    // Update quote with token and sent info
    const { error: updateError } = await supabase
      .from("quotes")
      .update({
        public_token,
        public_token_expires_at: expires_at.toISOString(),
        sent_to_customer_at: new Date().toISOString(),
        customer_acceptance_status: 'pending'
      })
      .eq("id", quote_id);

    if (updateError) {
      console.error("❌ Update error:", updateError);
      throw new Error("Failed to update quote");
    }

    // Generate customer review link
    const customer_link = `${supabaseUrl.replace('.supabase.co', '')}.lovableproject.com/quote-review/${public_token}`;

    // Calculate totals from quote_items
    const quoteItems = quote.quote_items || [];
    const totalMonthlyRate = quoteItems.reduce((sum: number, item: any) => 
      sum + (parseFloat(item.monthly_rate) || 0), 0
    );
    const vatAmount = totalMonthlyRate * (quote.vat_percentage || 5) / 100;
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
              <h1 style="margin: 0;">Quote Review Required</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Quote #${quote.quote_number}</p>
            </div>
            
            <div class="content">
              <p>Dear ${quote.customer?.full_name || 'Valued Customer'},</p>
              
              <p>${custom_message || 'We are pleased to present your quote for review. Please take a moment to review the details and provide your decision.'}</p>
              
              <div class="summary">
                <h3 style="margin-top: 0;">Quote Summary</h3>
                <div class="summary-row">
                  <span>Quote Number:</span>
                  <strong>${quote.quote_number}</strong>
                </div>
                <div class="summary-row">
                  <span>Quote Date:</span>
                  <strong>${new Date(quote.quote_date).toLocaleDateString()}</strong>
                </div>
                <div class="summary-row">
                  <span>Valid Until:</span>
                  <strong>${new Date(quote.validity_date_to).toLocaleDateString()}</strong>
                </div>
                <div class="summary-row">
                  <span>Number of Vehicles:</span>
                  <strong>${quoteItems.length}</strong>
                </div>
                <div class="summary-row">
                  <span>Monthly Subtotal:</span>
                  <strong>AED ${totalMonthlyRate.toFixed(2)}</strong>
                </div>
                <div class="summary-row">
                  <span>VAT (${quote.vat_percentage}%):</span>
                  <strong>AED ${vatAmount.toFixed(2)}</strong>
                </div>
                <div class="summary-row">
                  <span>Total:</span>
                  <strong>AED ${grandTotal.toFixed(2)}</strong>
                </div>
              </div>
              
              <div style="text-align: center;">
                <a href="${customer_link}" class="button">Review & Sign Quote</a>
              </div>
              
              <div class="expiry">
                <strong>⏰ Action Required:</strong> This link will expire on ${expires_at.toLocaleDateString()} (${expiration_days} days).
              </div>
              
              <p style="margin-top: 30px;">If you have any questions, please don't hesitate to contact us:</p>
              <p style="margin: 5px 0;">
                <strong>${quote.sales_rep?.full_name || 'Sales Team'}</strong><br>
                ${quote.sales_rep?.email || 'sales@autostrad.com'}
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
      from: "Autostrad Quotes <quotes@resend.dev>",
      to: [recipient_email],
      subject: `Quote #${quote.quote_number} from Autostrad - Action Required`,
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