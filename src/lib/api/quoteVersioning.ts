import { supabase } from "@/integrations/supabase/client";

export const createQuoteVersion = async (originalQuoteId: string) => {
  // 1. Fetch original quote
  const { data: originalQuote, error: fetchError } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", originalQuoteId)
    .single();

  if (fetchError) throw fetchError;

  // 2. Create new quote with incremented version
  const newVersion = (originalQuote.version || 1) + 1;

  const newQuotePayload = {
    // Copy all fields from original
    ...originalQuote,
    // Remove/reset specific fields
    id: undefined, // Let Supabase generate new ID
    quote_number: `${originalQuote.quote_number}-V${newVersion}`,
    version: newVersion,
    status: "draft",
    quote_entry_date: new Date().toISOString().split("T")[0],
    customer_acceptance_status: null,
    customer_rejection_reason: null,
    win_loss_reason: null,
    approved_at: null,
    approved_by: null,
    sent_to_customer_at: null,
    sent_to_customer_by: null,
    customer_signed_at: null,
    customer_signature: null,
    public_token: null,
    public_token_expires_at: null,
    created_at: undefined, // Let Supabase set this
    updated_at: undefined,
  };

  // 3. Insert new quote
  const { data: newQuote, error: insertError } = await supabase
    .from("quotes")
    .insert(newQuotePayload)
    .select()
    .single();

  if (insertError) throw insertError;

  // 4. Copy attachments if any
  const { data: attachments } = await supabase
    .from("quote_attachments")
    .select("*")
    .eq("quote_id", originalQuoteId);

  if (attachments && attachments.length > 0) {
    const newAttachments = attachments.map((att) => ({
      ...att,
      id: undefined,
      quote_id: newQuote.id,
      created_at: undefined,
    }));

    await supabase.from("quote_attachments").insert(newAttachments);
  }

  return newQuote.id;
};
