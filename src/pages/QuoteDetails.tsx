import React, { useEffect } from "react";
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
} from "lucide-react";
import { CustomerAcceptanceDialog } from "@/components/quotes/CustomerAcceptanceDialog";
import { CustomerRejectionDialog } from "@/components/quotes/CustomerRejectionDialog";
import { ConvertToMasterAgreementDialog } from "@/components/quotes/ConvertToMasterAgreementDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils/currency";
import { format } from "date-fns";
import { formatDurationInMonthsAndDays } from "@/lib/utils/dateUtils";

interface Quote {
  id: string;
  quote_number: string;
  status: string;
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
  profiles?: any;
}

const statusConfig = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground" },
  sent: { label: "Sent", color: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200" },
  viewed: { label: "Viewed", color: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200" },
  accepted: { label: "Accepted", color: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" },
  declined: { label: "Declined", color: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200" },
  expired: { label: "Expired", color: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200" },
  converted: { label: "Converted", color: "bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200" },
};

const QuoteDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [acceptDialogOpen, setAcceptDialogOpen] = React.useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = React.useState(false);

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

      // Fetch related data
      const [customerResult, vehicleResult] = await Promise.all([
        supabase.from("customers").select("full_name, email, phone").eq("id", data.customer_id).maybeSingle(),
        data.vehicle_id
          ? supabase.from("vehicles").select("make, model, year, license_plate").eq("id", data.vehicle_id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      return {
        ...data,
        customer: customerResult.data,
        vehicle: vehicleResult.data,
      } as Quote;
    },
    enabled: !!id,
  });

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
        <Button onClick={() => navigate("/quotes")}>
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
              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {quote.customer?.full_name}
              </div>
              {quote.valid_until && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Valid until {format(new Date(quote.valid_until), "MMM d, yyyy")}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => navigate("/quotes")}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button size="sm" onClick={() => navigate(`/quotes/new?edit=true&id=${quote.id}`)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit Quote
            </Button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-1" />
              Email
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast({ title: "Link copied to clipboard" });
              }}
            >
              <Share className="h-4 w-4 mr-1" />
              Share
            </Button>
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
            {(quote.status === "accepted" || quote.status === "sent") && (
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

      {/* Show acceptance status if accepted */}
      {quote.status === 'accepted' && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-300">Quote Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-600 dark:text-green-400 mb-4">
              Customer has accepted this quote. You can now convert it to a Master Agreement.
            </p>
            {quote.win_loss_reason && (
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Win Reason:</strong> {quote.win_loss_reason}
              </p>
            )}
            <Button
              onClick={() => setConvertDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="mr-2 h-4 w-4" />
              Convert to Master Agreement
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Show rejection info if declined */}
      {quote.status === 'declined' && quote.customer_rejection_reason && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Quote Rejected</AlertTitle>
          <AlertDescription>
            <p className="mb-2">{quote.customer_rejection_reason}</p>
            <p className="text-xs">You can create a new version to revise terms.</p>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="customer">Customer</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6 mt-6">
          {/* Quote Header Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Quote Details
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
                <div>
                  <p className="text-sm text-muted-foreground">Valid Until</p>
                  <p className="font-medium">{quote.valid_until ? format(new Date(quote.valid_until), "MMM d, yyyy") : "N/A"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Payment Terms</p>
                  <p className="font-medium">{quote.payment_terms_id || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium">{quote.payment_method || "Bank Transfer"}</p>
                </div>
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

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Line Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {displayItems && displayItems.length > 0 ? (
                <div className="space-y-6">
                  {displayItems.map((item: any, index: number) => {
                    const lineTotal =
                      item.monthly_rate !== undefined
                        ? (item.monthly_rate || 0) * (item.duration_months || 0)
                        : (item.qty || 0) * (item.rate || 0);

                    return (
                      <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Line {item.line_no || index + 1}</Badge>
                              <h4 className="font-semibold text-lg">
                                {item._vehicleMeta
                                  ? `${item._vehicleMeta.year} ${item._vehicleMeta.make} ${item._vehicleMeta.model}`
                                  : item.description || `Item ${index + 1}`}
                              </h4>
                            </div>
                            {item._vehicleMeta && (
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{item._vehicleMeta.color}</span>
                                <span>•</span>
                                <span>{item._vehicleMeta.category}</span>
                                {item._vehicleMeta.item_code && (
                                  <>
                                    <span>•</span>
                                    <span className="font-mono">{item._vehicleMeta.item_code}</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            {item.monthly_rate !== undefined && (
                              <p className="text-sm text-muted-foreground">{formatCurrency(item.monthly_rate || 0)}/month</p>
                            )}
                            <p className="text-lg font-bold">{formatCurrency(lineTotal)}</p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 pt-2 border-t">
                          {item.duration_months !== undefined && (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Duration:</span>
                              <span className="font-medium">{item.duration_months} months</span>
                            </div>
                          )}
                          {item.monthly_km_allowance && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">Mileage:</span>
                              <span className="font-medium">{item.monthly_km_allowance} km/month</span>
                            </div>
                          )}
                          {item.pickup_location_name && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Pickup:</span>
                              <span className="font-medium">{item.pickup_location_name}</span>
                            </div>
                          )}
                          {item.return_location_name && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Return:</span>
                              <span className="font-medium">{item.return_location_name}</span>
                            </div>
                          )}
                        </div>

                        {(item.deposit_amount || quote.default_deposit_amount) && (
                          <div className="flex items-center gap-2 text-sm pt-2 border-t">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Deposit:</span>
                            <span className="font-medium">
                              {formatCurrency(item.deposit_amount || quote.default_deposit_amount || 0)}
                              {quote.deposit_type && ` (${quote.deposit_type})`}
                            </span>
                          </div>
                        )}

                        {(item.advance_rent_months || quote.default_advance_rent_months) && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Advance Rent:</span>
                            <span className="font-medium">{item.advance_rent_months || quote.default_advance_rent_months} month(s)</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No line items available</p>
              )}
            </CardContent>
          </Card>

          {/* Insurance Coverage */}
          {(quote.insurance_coverage_package || quote.insurance_coverage_summary) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Insurance Coverage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quote.insurance_coverage_package && (
                  <div>
                    <p className="text-sm text-muted-foreground">Package</p>
                    <p className="font-medium capitalize">{quote.insurance_coverage_package}</p>
                  </div>
                )}
                {quote.insurance_coverage_summary && (
                  <div>
                    <p className="text-sm text-muted-foreground">Coverage Summary</p>
                    <p className="font-medium">{quote.insurance_coverage_summary}</p>
                  </div>
                )}
                <div className="grid md:grid-cols-3 gap-4 pt-2">
                  {quote.insurance_excess_aed !== undefined && (
                    <div>
                      <p className="text-sm text-muted-foreground">Excess</p>
                      <p className="font-medium">{formatCurrency(quote.insurance_excess_aed)}</p>
                    </div>
                  )}
                  {quote.insurance_glass_tire_cover !== undefined && (
                    <div>
                      <p className="text-sm text-muted-foreground">Glass & Tire</p>
                      <Badge variant={quote.insurance_glass_tire_cover ? "default" : "secondary"}>
                        {quote.insurance_glass_tire_cover ? "Included" : "Not Included"}
                      </Badge>
                    </div>
                  )}
                  {quote.insurance_territorial_coverage && (
                    <div>
                      <p className="text-sm text-muted-foreground">Territory</p>
                      <p className="font-medium capitalize">{quote.insurance_territorial_coverage}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Maintenance Coverage */}
          {(quote.maintenance_included || quote.maintenance_coverage_summary) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Maintenance Coverage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Maintenance Included</p>
                  <Badge variant={quote.maintenance_included ? "default" : "secondary"}>
                    {quote.maintenance_included ? "Yes" : "No"}
                  </Badge>
                </div>
                {quote.maintenance_package_type && (
                  <div>
                    <p className="text-sm text-muted-foreground">Package Type</p>
                    <p className="font-medium capitalize">{quote.maintenance_package_type}</p>
                  </div>
                )}
                {quote.monthly_maintenance_cost_per_vehicle && (
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Cost per Vehicle</p>
                    <p className="font-medium">{formatCurrency(quote.monthly_maintenance_cost_per_vehicle)}</p>
                  </div>
                )}
                {quote.maintenance_coverage_summary && (
                  <div>
                    <p className="text-sm text-muted-foreground">Coverage Summary</p>
                    <p className="font-medium">{quote.maintenance_coverage_summary}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Initial Fees */}
          {quote.initial_fees && quote.initial_fees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Initial Fees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {quote.initial_fees.map((fee: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <span className="font-medium">{fee.name || fee.description}</span>
                      <span className="font-semibold">{formatCurrency(fee.amount || 0)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-lg">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatCurrency(quote.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax {quote.vat_percentage ? `(${quote.vat_percentage}%)` : ""}</span>
                <span className="font-medium">{formatCurrency(quote.tax_amount || 0)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>
                  {formatCurrency(quote.total_amount || 0)} {quote.currency || "AED"}
                </span>
              </div>

              {quote.proration_rule && (
                <div className="pt-3 border-t text-sm">
                  <span className="text-muted-foreground">Proration Rule: </span>
                  <span className="font-medium">{quote.proration_rule}</span>
                </div>
              )}
              {quote.invoice_format && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Invoice Format: </span>
                  <span className="font-medium">{quote.invoice_format}</span>
                </div>
              )}
            </CardContent>
          </Card>

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
                  {displayItems.map((item: any, index: number) => (
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
                            {item.duration_months !== undefined && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Duration:</span>
                                <span className="font-medium">{item.duration_months} months</span>
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
                  ))}
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
                    <p className="font-medium">{quote.customer?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{quote.customer?.email}</p>
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
                      <p className="font-medium">{quote.customer_bill_to}</p>
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
                Quote Metadata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {quote.legal_entity_id && (
                    <div>
                      <p className="text-sm text-muted-foreground">Legal Entity</p>
                      <p className="font-medium">{quote.legal_entity_id}</p>
                    </div>
                  )}
                  {quote.business_unit_id && (
                    <div>
                      <p className="text-sm text-muted-foreground">Business Unit</p>
                      <p className="font-medium">{quote.business_unit_id}</p>
                    </div>
                  )}
                  {quote.sales_office_id && (
                    <div>
                      <p className="text-sm text-muted-foreground">Sales Office</p>
                      <p className="font-medium">{quote.sales_office_id}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {quote.sales_rep_id && (
                    <div>
                      <p className="text-sm text-muted-foreground">Sales Representative</p>
                      <p className="font-medium">{quote.sales_rep_id}</p>
                    </div>
                  )}
                  {quote.contact_person_id && (
                    <div>
                      <p className="text-sm text-muted-foreground">Contact Person</p>
                      <p className="font-medium">{quote.contact_person_id}</p>
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

                {quote.status !== "draft" && (
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
                        <p className="text-sm text-muted-foreground">Status changed to {quote.status}</p>
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
    </div>
  );
};

export default QuoteDetails;