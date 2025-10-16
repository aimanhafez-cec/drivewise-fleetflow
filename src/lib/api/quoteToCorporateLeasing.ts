import { supabase } from "@/integrations/supabase/client";

export const convertQuoteToCorporateLease = async (quoteId: string) => {
  // 1. Fetch full quote with customer data
  const { data: quote, error: fetchError } = await supabase
    .from("quotes")
    .select("*, profiles(*)")
    .eq("id", quoteId)
    .single();

  if (fetchError) throw fetchError;

  // 2. Generate new agreement number
  const { data: agreementNo, error: agreementNoError } = await supabase.rpc(
    "generate_corporate_lease_no"
  );

  if (agreementNoError) throw agreementNoError;

  // 3. Map quote fields to corporate_leasing_agreements
  const agreementPayload = {
    agreement_no: agreementNo,
    rental_type: "Corporate Leasing" as any,
    customer_id: quote.customer_id,
    legal_entity_id: quote.legal_entity_id,
    business_unit_id: quote.business_unit_id,
    bill_to_site_id: quote.customer_bill_to,
    credit_terms: quote.payment_terms_id || ("Net 30" as any),
    contract_start_date: quote.contract_effective_from,
    contract_end_date: quote.contract_effective_to,
    billing_cycle: quote.billing_plan || ("Monthly" as any),
    billing_day: "Anniversary" as any,
    invoice_format: quote.invoice_format || ("Consolidated" as any),
    insurance_responsibility: "Included (Lessor)" as any,
    insurance_excess_aed: quote.insurance_excess_aed || 1500,
    maintenance_policy: quote.maintenance_included
      ? ("Full (PM+wear)" as any)
      : ("Customer" as any),
    roadside_assistance_included: true,
    replacement_vehicle_included: true,
    admin_fee_per_fine_aed: 25,
    security_instrument:
      quote.deposit_type === "refundable"
        ? ("Refundable Deposit" as any)
        : ("None" as any),
    deposit_amount_aed: quote.default_deposit_amount,
    currency: quote.currency || "AED",
    vat_code: "UAE 5%",
    status: "active" as any,
    signed_date: new Date().toISOString().split("T")[0],
    notes: quote.notes,
    created_by: quote.created_by,
    customer_po_no: quote.customer_po_number,
    // Required fields
    cost_allocation_mode: "Per Vehicle" as any,
    framework_model: "Fleet Replacement" as any,
    master_term: "12 months" as any,
  };

  // 4. Insert corporate leasing agreement
  const { data: agreement, error: insertError } = await supabase
    .from("corporate_leasing_agreements")
    .insert([agreementPayload])
    .select()
    .single();

  if (insertError) throw insertError;

  // 5. Create lines from quote_items
  const quoteItems = Array.isArray(quote.quote_items) ? quote.quote_items : [];
  if (quoteItems.length > 0) {
    const lines = quoteItems.map((item: any, index: number) => ({
      agreement_id: agreement.id,
      vehicle_class_id: item.vehicle_class_id,
      vehicle_id: item.vehicle_id,
      qty: item.quantity || 1,
      line_number: index + 1,
      lease_start_date: quote.contract_effective_from,
      monthly_rate_aed: item.monthly_rate,
      contract_months: quote.duration_days
        ? Math.ceil(quote.duration_days / 30)
        : 12,
      mileage_allowance_km_month: item.included_km_per_month,
      excess_km_rate_aed: item.excess_km_charge,
      status: "active" as any,
    }));

    const { error: linesError } = await supabase
      .from("corporate_leasing_lines")
      .insert(lines);

    if (linesError) throw linesError;
  }

  // 6. Update quote status to 'converted'
  const { error: updateError } = await supabase
    .from("quotes")
    .update({ status: "converted" })
    .eq("id", quoteId);

  if (updateError) throw updateError;

  // 7. Return agreement ID
  return agreement.id;
};
