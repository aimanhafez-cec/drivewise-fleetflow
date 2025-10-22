import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Send,
  FileText,
  CheckCircle,
  Clock,
  Share,
  Edit,
  Download,
  Mail,
  Printer,
  Car,
  Calendar,
  MapPin,
  Shield,
  Wrench,
  DollarSign,
  Building,
  User,
  Copy,
  ArrowRight,
  XCircle,
  AlertCircle,
  Link2,
  Paperclip,
  ChevronDown,
  Plus,
  Gauge,
  Package,
} from "lucide-react";
import { CustomerAcceptanceDialog } from "@/components/quotes/CustomerAcceptanceDialog";
import { CustomerRejectionDialog } from "@/components/quotes/CustomerRejectionDialog";
import { ConvertToMasterAgreementDialog } from "@/components/quotes/ConvertToMasterAgreementDialog";
import { SendQuoteToCustomerDialog } from "@/components/quotes/SendQuoteToCustomerDialog";
import { QuoteAttachments } from "@/components/quotes/QuoteAttachments";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils/currency";
import { format } from "date-fns";
import { formatDurationInMonthsAndDays } from "@/lib/utils/dateUtils";
import { useGenerateQuotePDF } from "@/hooks/useQuote";
import { useWinLossReasonById } from "@/hooks/useWinLossReasons";
import { QuoteHeaderInfo } from "@/components/quotes/details/QuoteHeaderInfo";
import { QuotePickupReturnInfo } from "@/components/quotes/details/QuotePickupReturnInfo";
import { QuoteInsuranceDetails } from "@/components/quotes/details/QuoteInsuranceDetails";
import { QuoteMaintenanceDetails } from "@/components/quotes/details/QuoteMaintenanceDetails";
import { QuoteAddOnsDisplay } from "@/components/quotes/details/QuoteAddOnsDisplay";
import { QuoteMileagePooling } from "@/components/quotes/details/QuoteMileagePooling";
import { QuoteTollsPolicy } from "@/components/quotes/details/QuoteTollsPolicy";
import { QuotePaymentPolicy } from "@/components/quotes/details/QuotePaymentPolicy";
import { QuoteFinancialBreakdown } from "@/components/quotes/details/QuoteFinancialBreakdown";
import { QuotePaymentSummary } from "@/components/quotes/details/QuotePaymentSummary";
import { QuoteInitialFees } from "@/components/quotes/details/QuoteInitialFees";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Quote {
  id: string;
  quote_number: string;
  status: string;
  customer_type?: string;
  created_at: string;
  valid_until: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  quote_type?: string;
  quote_description?: string;
  contract_effective_from?: string;
  contract_effective_to?: string;
  duration_days?: number;
  billing_start_date?: string;
  billing_plan?: string;
  payment_terms_id?: string;
  payment_method?: string;
  currency?: string;
  annual_escalation_percentage?: number;
  vat_percentage?: number;
  default_deposit_amount?: number;
  default_advance_rent_months?: number;
  deposit_type?: string;
  insurance_coverage_package?: string;
  insurance_coverage_summary?: string;
  insurance_excess_aed?: number;
  insurance_glass_tire_cover?: boolean;
  insurance_territorial_coverage?: string;
  maintenance_included?: boolean;
  maintenance_package_type?: string;
  monthly_maintenance_cost_per_vehicle?: number;
  maintenance_coverage_summary?: string;
  initial_fees?: any[];
  proration_rule?: string;
  invoice_format?: string;
  customer?: any;
  vehicle?: any;
  items: any[];
  quote_items?: any[];
  legal_entity_id?: string;
  business_unit_id?: string;
  sales_office_id?: string;
  sales_rep_id?: string;
  contact_person_id?: string;
  customer_bill_to?: string;
  account_name?: string;
  project?: string;
  opportunity_id?: string;
  customer_id: string;
  vehicle_id?: string;
  version?: number;
  customer_acceptance_status?: string;
  customer_rejection_reason?: string;
  win_loss_reason?: string;
  win_reason_id?: string;
  loss_reason_id?: string;
  win_loss_notes?: string;
  sent_to_customer_at?: string;
  sent_to_customer_by?: string;
  customer_signed_at?: string;
  approved_at?: string;
  approved_by?: string;
  submitted_at?: string;
  submitted_by?: string;
  profiles?: any;
  // Related data
  legalEntity?: any;
  businessUnit?: any;
  salesOffice?: any;
  salesRep?: any;
  opportunity?: any;
  contactPerson?: any;
  pickupLocation?: any;
  returnLocation?: any;
  pickupSite?: any;
  returnSite?: any;
  billToSite?: any;
  paymentTerms?: any;
  priceList?: any;
  pickup_type?: string;
  return_type?: string;
  pickup_customer_site_id?: string;
  return_customer_site_id?: string;
  pickup_location_id?: string;
  return_location_id?: string;
  mileage_pooling_enabled?: boolean;
  pooled_mileage_allowance_km?: number;
  pooled_excess_km_rate?: number;
  salik_darb_handling?: string;
  traffic_fines_handling?: string;
  admin_fee_per_fine_aed?: number;
  default_addons?: any[];
  insurance_damage_waiver?: boolean;
  insurance_theft_protection?: boolean;
  insurance_third_party_liability?: boolean;
  insurance_personal_accident?: boolean;
  insurance_additional_driver?: boolean;
  insurance_cross_border?: boolean;
  insurance_notes?: string;
  insurance_pai_enabled?: boolean;
  maintenance_plan_source?: string;
  show_maintenance_separate_line?: boolean;
  // Conversion tracking
  converted_to_agreement?: boolean;
  agreement_id?: string;
  agreement_no?: string;
  conversion_date?: string;
  converted_by?: string;
}

const statusConfig = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground" },
  sent: { label: "Sent", color: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200" },
  viewed: { label: "Viewed", color: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200" },
  accepted: { label: "Accepted", color: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" },
  declined: { label: "Declined", color: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200" },
  expired: { label: "Expired", color: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200" },
  converted: { label: "Converted", color: "bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200" },
  approved: { label: "Approved", color: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" },
};

const QuoteDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  
  const generatePDFMutation = useGenerateQuotePDF();

  useEffect(() => {
    document.title = "Quote Details | Core Car Rental";
  }, []);

  const { data: quote, isLoading } = useQuery({
    queryKey: ["quote", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Fetch all related data in parallel
      const [
        customerResult,
        vehicleResult,
        legalEntityResult,
        businessUnitResult,
        salesOfficeResult,
        salesRepResult,
        opportunityResult,
        contactPersonResult,
        pickupSiteResult,
        returnSiteResult,
        billToSiteResult,
      ] = await Promise.all([
        supabase.from("customers").select("full_name, email, phone").eq("id", data.customer_id).maybeSingle(),
        data.vehicle_id
          ? supabase.from("vehicles").select("make, model, year, license_plate").eq("id", data.vehicle_id).maybeSingle()
          : Promise.resolve({ data: null }),
        data.legal_entity_id
          ? supabase.from("legal_entities").select("name, code").eq("id", data.legal_entity_id).maybeSingle()
          : Promise.resolve({ data: null }),
        data.business_unit_id
          ? supabase.from("business_units").select("name, code").eq("id", data.business_unit_id).maybeSingle()
          : Promise.resolve({ data: null }),
        data.sales_office_id
          ? supabase.from("sales_offices").select("name, code").eq("id", data.sales_office_id).maybeSingle()
          : Promise.resolve({ data: null }),
        data.sales_rep_id
          ? supabase.from("sales_representatives").select("full_name, email").eq("id", data.sales_rep_id).maybeSingle()
          : Promise.resolve({ data: null }),
        data.opportunity_id
          ? supabase.from("opportunities").select("opportunity_no").eq("id", data.opportunity_id).maybeSingle()
          : Promise.resolve({ data: null }),
        data.contact_person_id
          ? supabase.from("contact_persons").select("full_name, email, phone").eq("id", data.contact_person_id).maybeSingle()
          : Promise.resolve({ data: null }),
        data.pickup_customer_site_id
          ? supabase.from("customer_sites").select("*").eq("id", data.pickup_customer_site_id).maybeSingle()
          : Promise.resolve({ data: null }),
        data.return_customer_site_id
          ? supabase.from("customer_sites").select("*").eq("id", data.return_customer_site_id).maybeSingle()
          : Promise.resolve({ data: null }),
        data.customer_bill_to
          ? supabase.from("customer_sites").select("*").eq("id", data.customer_bill_to).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      return {
        ...data,
        customer: customerResult.data,
        vehicle: vehicleResult.data,
        legalEntity: legalEntityResult.data,
        businessUnit: businessUnitResult.data,
        salesOffice: salesOfficeResult.data,
        salesRep: salesRepResult.data,
        opportunity: opportunityResult.data,
        contactPerson: contactPersonResult.data,
        pickupSite: pickupSiteResult.data,
        returnSite: returnSiteResult.data,
        billToSite: billToSiteResult.data,
      } as Quote;
    },
    enabled: !!id,
  });

  const { data: winReason } = useWinLossReasonById(quote?.win_reason_id);
  const { data: lossReason } = useWinLossReasonById(quote?.loss_reason_id);

  const sendQuoteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const { error } = await supabase.from("quotes").update({ status: "sent" }).eq("id", quoteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote", id] });
      toast({ title: "Success", description: "Quote sent successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send quote", variant: "destructive" });
    },
  });

  const convertToReservationMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const { data, error } = await supabase
        .from("reservations")
        .insert({
          customer_id: quote?.customer_id,
          vehicle_id: quote?.vehicle_id,
          start_datetime: new Date().toISOString(),
          end_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          total_amount: quote?.total_amount,
          pickup_location: "Main Office",
          return_location: "Main Office",
          status: "confirmed",
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from("quotes").update({ status: "converted" }).eq("id", quoteId);

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quote", id] });
      toast({ title: "Success", description: "Quote converted to reservation" });
      navigate(`/reservations/${data.id}`);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to convert quote", variant: "destructive" });
    },
  });

  // Helper to determine if a coverage item is included
  const isCoverageIncluded = (
    explicitValue: boolean | null | undefined,
    coverageItem: string,
    packageType: string
  ): boolean => {
    // If explicitly set, use that value
    if (explicitValue !== null && explicitValue !== undefined) {
      return explicitValue;
    }

    // Otherwise, infer from package type
    const packageDefaults: Record<string, Record<string, boolean>> = {
      basic: {
        damage_waiver: false,
        theft_protection: false,
        third_party_liability: true,
        additional_driver: false,
        glass_tire: false,
      },
      comprehensive: {
        damage_waiver: true,
        theft_protection: true,
        third_party_liability: true,
        additional_driver: false,
        glass_tire: true,
      },
      'full-zero-excess': {
        damage_waiver: true,
        theft_protection: true,
        third_party_liability: true,
        additional_driver: false,
        glass_tire: true,
      },
    };

    return packageDefaults[packageType]?.[coverageItem] ?? false;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <FileText className="h-16 w-16 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Quote not found</h3>
        <Button onClick={() => navigate("/manage-quotations")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Quotes
        </Button>
      </div>
    );
  }

  const statusInfo = statusConfig[quote.status as keyof typeof statusConfig] || statusConfig.draft;
  const displayItems = quote.quote_items && quote.quote_items.length > 0 ? quote.quote_items : quote.items;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{quote.quote_number}</h1>
              <Badge className={statusInfo.color}>
                {statusInfo.label}
                {quote.converted_to_agreement && " / Converted to Agreement"}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                {quote.customer_type === 'Company' ? (
                  <Building className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                {quote.customer?.full_name}
              </div>
              {((quote as any).validity_date_to || quote.valid_until) && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Valid until {format(new Date((quote as any).validity_date_to || quote.valid_until), "MMM d, yyyy")}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => navigate("/manage-quotations")}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button size="sm" onClick={() => navigate(`/quotes/view/${quote.id}`)}>
              <FileText className="h-4 w-4 mr-1" />
              View Quote
            </Button>
            <Button size="sm" onClick={() => navigate(`/quotes/${quote.id}/edit`)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit Quote
            </Button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEmailDialogOpen(true)}
            >
              <Mail className="h-4 w-4 mr-1" />
              Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generatePDFMutation.mutate({})}
              disabled={generatePDFMutation.isPending}
            >
              <Download className="h-4 w-4 mr-1" />
              {generatePDFMutation.isPending ? "Downloading..." : "Download"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast({ title: "Link copied to clipboard" });
                  }}
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEmailDialogOpen(true)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email Quote
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => generatePDFMutation.mutate({})}
                  disabled={generatePDFMutation.isPending}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download & Share
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={() => navigate(`/quotes/new?duplicate=${quote.id}`)}>
              <Copy className="h-4 w-4 mr-1" />
              Duplicate
            </Button>
            {quote.status === "draft" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendQuoteMutation.mutate(quote.id)}
                disabled={sendQuoteMutation.isPending}
              >
                <Send className="h-4 w-4 mr-1" />
                Send
              </Button>
            )}
            {(quote.status === "accepted" || quote.status === "sent") && !quote.converted_to_agreement && (
              <Button
                size="sm"
                onClick={() => convertToReservationMutation.mutate(quote.id)}
                disabled={convertToReservationMutation.isPending}
              >
                <ArrowRight className="h-4 w-4 mr-1" />
                Convert
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Customer Response Actions - Show for sent/viewed/approved quotes */}
      {['sent', 'viewed', 'approved'].includes(quote.status) && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Response</CardTitle>
            <CardDescription>
              Record customer acceptance or rejection of this quote
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setAcceptDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Customer Accepted
              </Button>
              <Button
                variant="destructive"
                onClick={() => setRejectDialogOpen(true)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Customer Rejected
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show acceptance status if accepted but not yet converted */}
      {quote.status === 'accepted' && !quote.converted_to_agreement && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-green-700 dark:text-green-300 mb-1">
                  Quote Accepted
                </h3>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Customer has accepted this quote. You can now convert it to a Master Agreement.
                </p>
                {winReason && (
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>Win Reason:</strong> {winReason.reason_label}
                    {quote.win_loss_notes && (
                      <p className="mt-1 text-muted-foreground">
                        <strong>Notes:</strong> {quote.win_loss_notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <Button
                onClick={() => setConvertDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 shrink-0"
              >
                <FileText className="mr-2 h-4 w-4" />
                Convert to Master Agreement
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show converted status if already converted to Master Agreement */}
      {quote.converted_to_agreement && quote.agreement_no && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">
                  Converted to Master Agreement
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  This quote has been converted to Master Agreement:{' '}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-blue-600 dark:text-blue-400 font-semibold underline"
                    onClick={() => navigate(`/master-agreements/${quote.agreement_id}`)}
                  >
                    {quote.agreement_no}
                  </Button>
                </p>
                {quote.conversion_date && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Converted on {format(new Date(quote.conversion_date), 'MMM dd, yyyy HH:mm')}
                  </p>
                )}
                {winReason && (
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>Win Reason:</strong> {winReason.reason_label}
                    {quote.win_loss_notes && (
                      <p className="mt-1">
                        <strong>Notes:</strong> {quote.win_loss_notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show rejection status if declined */}
      {quote.status === 'declined' && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-700 dark:text-red-300 mb-1">
                  Quote Declined
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Customer has declined this quote.
                </p>
                {lossReason && (
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>Loss Reason:</strong> {lossReason.reason_label}
                    {quote.win_loss_notes && (
                      <p className="mt-1">
                        <strong>Notes:</strong> {quote.win_loss_notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="customer">Customer & Sales</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6 mt-6">
          {/* Quote Header Information */}
          <QuoteHeaderInfo
            quote={quote}
            legalEntity={quote.legalEntity}
            businessUnit={quote.businessUnit}
            salesOffice={quote.salesOffice}
            salesRep={quote.salesRep}
            opportunity={quote.opportunity}
            contactPerson={quote.contactPerson}
            billToSite={quote.billToSite}
          />

          {/* Contract Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contract Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Quote Type</p>
                  <p className="font-medium">{quote.quote_type || "Corporate Lease"}</p>
                </div>
                {quote.quote_description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium">{quote.quote_description}</p>
                  </div>
                )}
                {quote.contract_effective_from && quote.contract_effective_to && (
                  <div>
                    <p className="text-sm text-muted-foreground">Contract Period</p>
                    <p className="font-medium">
                      {format(new Date(quote.contract_effective_from), "MMM d, yyyy")} -{" "}
                      {format(new Date(quote.contract_effective_to), "MMM d, yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ({formatDurationInMonthsAndDays(new Date(quote.contract_effective_from), new Date(quote.contract_effective_to))})
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {quote.billing_start_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Billing Start Date</p>
                    <p className="font-medium">{format(new Date(quote.billing_start_date), "MMM d, yyyy")}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Billing Plan</p>
                  <p className="font-medium">{quote.billing_plan || "Monthly"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Currency</p>
                  <p className="font-medium">{quote.currency || "AED"}</p>
                </div>
                {quote.annual_escalation_percentage && (
                  <div>
                    <p className="text-sm text-muted-foreground">Annual Escalation</p>
                    <p className="font-medium">{quote.annual_escalation_percentage}%</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Financial Terms & Breakdown */}
          <Collapsible defaultOpen>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="cursor-pointer">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Financial Terms & Breakdown
                    </div>
                    <ChevronDown className="h-5 w-5 transition-transform data-[state=open]:rotate-180" />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-0">
                  <QuotePaymentSummary quote={quote} />
                  <QuoteInitialFees quote={quote} />
                  <QuoteFinancialBreakdown quote={quote} />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Coverage & Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Coverage & Services
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion type="multiple" defaultValue={["insurance", "maintenance", "mileage", "services", "tolls", "addons"]}>
                {/* 1. Insurance Coverage */}
                <AccordionItem value="insurance" className="border-b">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold">Insurance Coverage</span>
                      <Badge variant="secondary" className="ml-2 text-xs">Default Settings</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Coverage Package</p>
                            <Badge variant="secondary" className="mt-1">
                              {(() => {
                                const labels: Record<string, string> = {
                                  cdw: "Collision Damage Waiver",
                                  basic: "Basic / Third Party Only",
                                  comprehensive: "Comprehensive Coverage",
                                  "full-zero-excess": "Full Coverage (Zero Excess)",
                                };
                                return labels[quote.insurance_coverage_package || "comprehensive"] || quote.insurance_coverage_package;
                              })()}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Excess Amount</p>
                            <p className="font-medium">
                              {quote.insurance_excess_aed === null || quote.insurance_excess_aed === undefined
                                ? "N/A (Customer fully liable)"
                                : formatCurrency(quote.insurance_excess_aed, quote.currency || "AED")}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Territorial Coverage</p>
                            <p className="font-medium">
                              {(() => {
                                const labels: Record<string, string> = {
                                  "uae-only": "UAE Only",
                                  gcc: "GCC Countries",
                                };
                                return labels[quote.insurance_territorial_coverage || "uae-only"] || quote.insurance_territorial_coverage;
                              })()}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-semibold">Included Coverage</p>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {isCoverageIncluded(
                                quote.insurance_glass_tire_cover,
                                'glass_tire',
                                quote.insurance_coverage_package || 'comprehensive'
                              ) ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm">Glass & Tire Cover</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isCoverageIncluded(
                                quote.insurance_pai_enabled,
                                'pai',
                                quote.insurance_coverage_package || 'comprehensive'
                              ) ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm">Personal Accident Insurance (PAI)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isCoverageIncluded(
                                quote.insurance_damage_waiver,
                                'damage_waiver',
                                quote.insurance_coverage_package || 'comprehensive'
                              ) ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm">Damage Waiver</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isCoverageIncluded(
                                quote.insurance_theft_protection,
                                'theft_protection',
                                quote.insurance_coverage_package || 'comprehensive'
                              ) ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm">Theft Protection</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isCoverageIncluded(
                                quote.insurance_third_party_liability,
                                'third_party_liability',
                                quote.insurance_coverage_package || 'comprehensive'
                              ) ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm">Third Party Liability</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isCoverageIncluded(
                                quote.insurance_additional_driver,
                                'additional_driver',
                                quote.insurance_coverage_package || 'comprehensive'
                              ) ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm">Additional Driver</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isCoverageIncluded(
                                quote.insurance_cross_border,
                                'cross_border',
                                quote.insurance_coverage_package || 'comprehensive'
                              ) ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm">Cross Border</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {quote.insurance_coverage_summary && (
                        <div className="pt-2">
                          <p className="text-sm text-muted-foreground mb-1">Coverage Summary</p>
                          <p className="text-sm">{quote.insurance_coverage_summary}</p>
                        </div>
                      )}

                      {quote.insurance_notes && (
                        <div className="pt-2">
                          <p className="text-sm text-muted-foreground mb-1">Insurance Notes</p>
                          <p className="text-sm">{quote.insurance_notes}</p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 2. Maintenance Coverage */}
                <AccordionItem value="maintenance" className="border-b">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-orange-600" />
                      <span className="font-semibold">Maintenance Coverage</span>
                      <Badge variant="secondary" className="ml-2 text-xs">Default Settings</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Maintenance Status</p>
                            <div className="flex items-center gap-2 mt-1">
                              {quote.maintenance_included ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="font-medium">
                                {quote.maintenance_included ? "Included" : "Not Included"}
                              </span>
                            </div>
                          </div>

                          {quote.maintenance_included && (
                            <>
                              <div>
                                <p className="text-sm text-muted-foreground">Package Type</p>
                                <Badge variant="secondary" className="mt-1">
                                  {(() => {
                                    const labels: Record<string, string> = {
                                      none: "Not Included",
                                      basic: "Basic Maintenance",
                                      standard: "Standard Maintenance",
                                      comprehensive: "Comprehensive Maintenance",
                                      full: "Full Maintenance & Wear",
                                    };
                                    return labels[quote.maintenance_package_type || "standard"] || quote.maintenance_package_type;
                                  })()}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Monthly Cost (per vehicle)</p>
                                <p className="font-medium">
                                  {formatCurrency(
                                    quote.monthly_maintenance_cost_per_vehicle || 250,
                                    quote.currency || "AED"
                                  )}
                                </p>
                              </div>
                            </>
                          )}
                        </div>

                        {quote.maintenance_included && (
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-muted-foreground">Plan Source</p>
                              <p className="font-medium">
                                {quote.maintenance_plan_source === "internal" ? "Internal" : "External Provider"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Billing Display</p>
                              <p className="font-medium">
                                {quote.show_maintenance_separate_line
                                  ? "Separate Line Item"
                                  : "Included in Rental Rate"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {quote.maintenance_coverage_summary && (
                        <div className="pt-2">
                          <p className="text-sm text-muted-foreground mb-1">Coverage Summary</p>
                          <p className="text-sm">{quote.maintenance_coverage_summary}</p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 3. Mileage Configuration */}
                <AccordionItem value="mileage" className="border-b">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-purple-600" />
                      <span className="font-semibold">Mileage Configuration</span>
                      <Badge variant="secondary" className="ml-2 text-xs">Default Settings</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Mileage Pooling</p>
                        <Badge variant={quote.mileage_pooling_enabled ? "default" : "secondary"}>
                          {quote.mileage_pooling_enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      {quote.mileage_pooling_enabled ? (
                        <>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Fleet Allowance</p>
                            <p className="font-medium">{quote.pooled_mileage_allowance_km?.toLocaleString() || 'N/A'} km/month</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Excess Rate</p>
                            <p className="font-medium">{formatCurrency(quote.pooled_excess_km_rate || 1.00, quote.currency || "AED")}/km</p>
                          </div>
                          <div className="pt-2 text-sm text-muted-foreground">
                            All vehicles share a common mileage pool. Excess kilometers from one vehicle can be offset by unused kilometers from another.
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Individual mileage limits apply per vehicle. Excess rates are calculated separately for each vehicle.
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 4. Additional Services */}
                <AccordionItem value="services" className="border-b">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      <span className="font-semibold">Additional Services</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="space-y-3">
                      {/* Roadside Assistance */}
                      <div className="flex items-center justify-between py-2 border-b">
                        <div>
                          <p className="font-medium">Roadside Assistance (24/7)</p>
                          <p className="text-xs text-muted-foreground">Emergency towing, flat tire, battery jump-start</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={(quote as any).roadside_assistance_included !== false ? "default" : "secondary"}>
                            {(quote as any).roadside_assistance_included !== false ? "Included" : "Not Included"}
                          </Badge>
                          {(quote as any).roadside_assistance_included !== false && (quote as any).roadside_assistance_cost_monthly && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatCurrency((quote as any).roadside_assistance_cost_monthly, quote.currency || "AED")}/mo per vehicle
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Replacement Vehicle */}
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-medium">Replacement Vehicle</p>
                          <p className="text-xs text-muted-foreground">
                            Courtesy car during repairs
                            {(quote as any).replacement_sla_hours && ` (${(quote as any).replacement_sla_hours}h SLA)`}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={(quote as any).replacement_vehicle_included !== false ? "default" : "secondary"}>
                            {(quote as any).replacement_vehicle_included !== false ? "Included" : "Not Included"}
                          </Badge>
                          {(quote as any).replacement_vehicle_included !== false && (quote as any).replacement_vehicle_cost_monthly && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatCurrency((quote as any).replacement_vehicle_cost_monthly, quote.currency || "AED")}/mo per vehicle
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 5. Toll & Fines Handling */}
                <AccordionItem value="tolls" className="border-b">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-semibold">Toll & Fines Handling</span>
                      <Badge variant="secondary" className="ml-2 text-xs">Default Settings</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Salik/Darb Handling</p>
                        <p className="font-medium">
                          {(() => {
                            const labels: Record<string, string> = {
                              "rebill-actual": "Rebill Actual Costs",
                              "included-capped": "Included (Capped)",
                              "customer-responsible": "Customer Responsible",
                              "lump-sum": "Lump Sum Monthly",
                            };
                            return labels[quote.salik_darb_handling || "rebill-actual"] || quote.salik_darb_handling || "Not specified";
                          })()}
                        </p>
                      </div>
                      {quote.salik_darb_handling === "included-capped" && (quote as any).salik_darb_allowance_cap && (
                        <div>
                          <p className="text-sm text-muted-foreground">Monthly Allowance Cap</p>
                          <p className="font-medium">{formatCurrency((quote as any).salik_darb_allowance_cap, quote.currency || "AED")}</p>
                        </div>
                      )}
                      {(quote as any).tolls_admin_fee_model && (
                        <div>
                          <p className="text-sm text-muted-foreground">Admin Fee Model</p>
                          <p className="font-medium">{(quote as any).tolls_admin_fee_model}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">Traffic Fines Handling</p>
                        <p className="font-medium">
                          {(() => {
                            const labels: Record<string, string> = {
                              "auto-rebill-admin": "Auto Rebill + Admin Fee",
                              "customer-direct": "Customer Pays Directly",
                              "monthly-invoice": "Monthly Invoice",
                            };
                            return labels[quote.traffic_fines_handling || "auto-rebill-admin"] || quote.traffic_fines_handling || "Not specified";
                          })()}
                        </p>
                      </div>
                      {quote.admin_fee_per_fine_aed && (
                        <div>
                          <p className="text-sm text-muted-foreground">Admin Fee per Fine</p>
                          <p className="font-medium">{formatCurrency(quote.admin_fee_per_fine_aed, quote.currency || "AED")}</p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 6. Default Add-Ons & Extras */}
                <AccordionItem value="addons">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span className="font-semibold">Default Add-Ons & Extras</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="space-y-3">
                      {quote.default_addons && quote.default_addons.length > 0 ? (
                        <div className="space-y-2">
                          {quote.default_addons.map((addon: any, index: number) => (
                            <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                              <div>
                                <p className="font-medium">{addon.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {addon.charge_type === "monthly" ? "Monthly charge" : "One-time charge"}
                                </p>
                              </div>
                              <p className="font-medium">
                                {formatCurrency(addon.cost, quote.currency || "AED")}
                                {addon.charge_type === "monthly" && "/month"}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No default add-ons configured</p>
                      )}

                      {(quote as any).addons_summary && (
                        <div className="pt-2 border-t">
                          <p className="text-sm text-muted-foreground mb-1">Add-Ons Summary</p>
                          <p className="text-sm">{(quote as any).addons_summary}</p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Operational Policies */}
          <Collapsible defaultOpen>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="cursor-pointer">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Operational Policies
                    </div>
                    <ChevronDown className="h-5 w-5 transition-transform data-[state=open]:rotate-180" />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-0">
                  <QuotePickupReturnInfo
                    quote={quote}
                    pickupSite={quote.pickupSite}
                    returnSite={quote.returnSite}
                  />
                  <QuoteMileagePooling quote={quote} />
                  <QuoteTollsPolicy quote={quote} />
                  <QuotePaymentPolicy quote={quote} />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Notes */}
          {quote.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{quote.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="attachments" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="h-5 w-5" />
                Quote Attachments
              </CardTitle>
              <CardDescription>Documents and files related to this quote</CardDescription>
            </CardHeader>
            <CardContent>
              <QuoteAttachments quoteId={quote.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicle Details
              </CardTitle>
              <CardDescription>{displayItems?.length || 0} vehicle(s) in this quote</CardDescription>
            </CardHeader>
            <CardContent>
              {displayItems && displayItems.length > 0 ? (
                <div className="space-y-4">
                  {displayItems.map((item: any, index: number) => {
                    const itemDurationMonths = item.duration_months && item.duration_months > 0
                      ? item.duration_months
                      : item.pickup_at && item.return_at
                        ? Math.max(1, Math.round((new Date(item.return_at).getTime() - new Date(item.pickup_at).getTime()) / (1000 * 60 * 60 * 24 * 30.44)))
                        : 0;
                    
                    return (
                      <div key={index} className="p-4 border rounded-lg space-y-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Line {item.line_no || index + 1}</Badge>
                            <h4 className="font-semibold">
                              {item._vehicleMeta
                                ? `${item._vehicleMeta.year} ${item._vehicleMeta.make} ${item._vehicleMeta.model}`
                                : "Vehicle Details"}
                            </h4>
                          </div>
                          {item._vehicleMeta && (
                            <p className="text-sm text-muted-foreground">
                              {item._vehicleMeta.color} • {item._vehicleMeta.category}
                            </p>
                          )}
                        </div>
                        {item.monthly_rate !== undefined && (
                          <div className="text-right">
                            <p className="text-lg font-bold">{formatCurrency(item.monthly_rate)}</p>
                            <p className="text-xs text-muted-foreground">per month</p>
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Rental Terms</p>
                          <div className="space-y-2 text-sm">
                            {itemDurationMonths > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Duration:</span>
                                <span className="font-medium">{itemDurationMonths} months</span>
                              </div>
                            )}
                            {item.monthly_km_allowance && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Mileage:</span>
                                <span className="font-medium">{item.monthly_km_allowance} km/month</span>
                              </div>
                            )}
                            {item.excess_km_rate && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Excess KM Rate:</span>
                                <span className="font-medium">{formatCurrency(item.excess_km_rate)}/km</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-2">Locations & Dates</p>
                          <div className="space-y-2 text-sm">
                            {item.pickup_location_name && (
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <p className="text-muted-foreground">Pickup:</p>
                                  <p className="font-medium">{item.pickup_location_name}</p>
                                </div>
                              </div>
                            )}
                            {item.return_location_name && (
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <p className="text-muted-foreground">Return:</p>
                                  <p className="font-medium">{item.return_location_name}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {item._vehicleMeta?.item_code && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            Item Code: <span className="font-mono">{item._vehicleMeta.item_code}</span>
                          </p>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Car className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No vehicles assigned yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customer" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer Type</p>
                    <p className="font-medium capitalize">{quote.customer?.customer_type || "Company"}</p>
                  </div>
                  {quote.account_name && (
                    <div>
                      <p className="text-sm text-muted-foreground">Account Name</p>
                      <p className="font-medium">{quote.account_name}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Customer Name</p>
                    <p className="font-medium">{quote.customer?.full_name || quote.account_name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{quote.customer?.email || "N/A"}</p>
                  </div>
                  {quote.customer?.phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{quote.customer.phone}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {quote.customer_bill_to && (
                    <div>
                      <p className="text-sm text-muted-foreground">Bill-To Site</p>
                      <p className="font-medium">{quote.billToSite?.site_name || quote.customer_bill_to}</p>
                    </div>
                  )}
                  {quote.project && (
                    <div>
                      <p className="text-sm text-muted-foreground">Project</p>
                      <p className="font-medium">{quote.project}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company & Sales Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {quote.legal_entity_id && (
                    <div>
                      <p className="text-sm text-muted-foreground">Legal Entity</p>
                      <p className="font-medium">{quote.legalEntity?.name || quote.legal_entity_id}</p>
                    </div>
                  )}
                  {quote.business_unit_id && (
                    <div>
                      <p className="text-sm text-muted-foreground">Business Unit</p>
                      <p className="font-medium">{quote.businessUnit?.name || quote.business_unit_id}</p>
                    </div>
                  )}
                  {quote.sales_office_id && (
                    <div>
                      <p className="text-sm text-muted-foreground">Sales Office</p>
                      <p className="font-medium">{quote.salesOffice?.name || quote.sales_office_id}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {quote.sales_rep_id && (
                    <div>
                      <p className="text-sm text-muted-foreground">Sales Representative</p>
                      <p className="font-medium">{quote.salesRep?.full_name || quote.sales_rep_id}</p>
                    </div>
                  )}
                  {quote.contact_person_id && (
                    <div>
                      <p className="text-sm text-muted-foreground">Contact Person</p>
                      <p className="font-medium">{quote.contactPerson?.full_name || quote.contact_person_id}</p>
                    </div>
                  )}
                  {quote.opportunity_id && (
                    <div>
                      <p className="text-sm text-muted-foreground">Related Opportunity</p>
                      <Button variant="link" className="h-auto p-0" onClick={() => navigate(`/opportunities/${quote.opportunity_id}`)}>
                        View Opportunity →
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Quote Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div className="h-full w-px bg-border mt-2"></div>
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold">Quote Created</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(quote.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">Quote {quote.quote_number} was created</p>
                  </div>
                </div>

                {quote.sent_to_customer_at && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white">
                        <Send className="h-5 w-5" />
                      </div>
                      <div className="h-full w-px bg-border mt-2"></div>
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold">Quote Sent</p>
                        <p className="text-sm text-muted-foreground">
                          {quote.sent_to_customer_at 
                            ? format(new Date(quote.sent_to_customer_at), "MMM d, yyyy 'at' h:mm a")
                            : "Date not available"}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">Quote was sent to customer</p>
                    </div>
                  </div>
                )}

                {quote.status === "accepted" && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold">Quote Accepted</p>
                        <p className="text-sm text-muted-foreground">
                          {quote.customer_signed_at 
                            ? format(new Date(quote.customer_signed_at), "MMM d, yyyy 'at' h:mm a")
                            : quote.approved_at 
                              ? format(new Date(quote.approved_at), "MMM d, yyyy 'at' h:mm a")
                              : "Date not available"}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">Customer accepted the quote</p>
                    </div>
                  </div>
                )}

                {quote.status === "draft" && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground italic">Awaiting further actions...</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CustomerAcceptanceDialog
        open={acceptDialogOpen}
        onOpenChange={setAcceptDialogOpen}
        quoteId={id!}
        quoteNumber={quote.quote_number}
      />

      <CustomerRejectionDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        quoteId={id!}
        quoteNumber={quote.quote_number}
      />

      <ConvertToMasterAgreementDialog
        open={convertDialogOpen}
        onOpenChange={setConvertDialogOpen}
        quote={quote}
      />

      <SendQuoteToCustomerDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        quoteId={quote.id}
        quoteNumber={quote.quote_number}
        customerName={quote.customer?.full_name || ""}
        customerEmail={quote.customer?.email || ""}
      />
    </div>
  );
};

export default QuoteDetails;