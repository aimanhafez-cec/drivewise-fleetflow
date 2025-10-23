import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { SendMasterAgreementToCustomerDialog } from "@/components/master-agreements/SendMasterAgreementToCustomerDialog";
import { CustomerAcceptanceMasterAgreementDialog } from "@/components/master-agreements/CustomerAcceptanceMasterAgreementDialog";
import { CustomerRejectionMasterAgreementDialog } from "@/components/master-agreements/CustomerRejectionMasterAgreementDialog";
import {
  ArrowLeft,
  FileText,
  Edit,
  Download,
  Mail,
  Printer,
  Car,
  Calendar,
  Shield,
  Wrench,
  DollarSign,
  Building,
  User,
  Copy,
  Share,
  Link2,
  Paperclip,
  CheckCircle,
  MapPin,
  XCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { format } from "date-fns";
import { MasterAgreementHeaderInfo } from "@/components/master-agreements/details/MasterAgreementHeaderInfo";
import { MasterAgreementFinancials } from "@/components/master-agreements/details/MasterAgreementFinancials";
import { MasterAgreementLines } from "@/components/master-agreements/details/MasterAgreementLines";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  getBillingDayLabel, 
  getLineItemGranularityLabel, 
  getBillingStartTriggerLabel 
} from "@/lib/constants/billingOptions";

const statusConfig = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground" },
  approved: { label: "Approved", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  sent_to_customer: { label: "Sent to Customer", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  customer_accepted: { label: "Customer Accepted", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  customer_rejected: { label: "Customer Rejected", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  active: { label: "Active", color: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" },
  suspended: { label: "Suspended", color: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200" },
  expired: { label: "Expired", color: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200" },
  terminated: { label: "Terminated", color: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200" },
};

const MasterAgreementDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [acceptanceDialogOpen, setAcceptanceDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);

  useEffect(() => {
    document.title = "Master Agreement Details | Core Car Rental";
  }, []);

  const { data: agreement, isLoading } = useQuery({
    queryKey: ["master-agreement", id],
    queryFn: async () => {
      if (!id) return null;

      const { data: agreementData, error: agreementError } = await supabase
        .from("corporate_leasing_agreements")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (agreementError) throw agreementError;
      if (!agreementData) return null;

      // Fetch all related data in parallel
      const [
        customerResult,
        legalEntityResult,
        billToSiteResult,
      ] = await Promise.all([
        agreementData.customer_id
          ? supabase.from("customers").select("full_name, email, phone").eq("id", agreementData.customer_id).maybeSingle()
          : Promise.resolve({ data: null }),
        agreementData.legal_entity_id
          ? supabase.from("legal_entities").select("name, code").eq("id", agreementData.legal_entity_id).maybeSingle()
          : Promise.resolve({ data: null }),
        agreementData.bill_to_site_id
          ? supabase.from("customer_sites").select("*").eq("id", agreementData.bill_to_site_id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      return {
        ...agreementData,
        customer: customerResult.data,
        legal_entity: legalEntityResult.data,
        bill_to_site: billToSiteResult.data,
      };
    },
    enabled: !!id,
  });

  const { data: lines } = useQuery({
    queryKey: ["master-agreement-lines", id],
    queryFn: async () => {
      if (!id) return [];

      const { data, error } = await supabase
        .from("corporate_leasing_lines")
        .select("*")
        .eq("agreement_id", id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <FileText className="h-16 w-16 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Master Agreement not found</h3>
        <Button onClick={() => navigate("/corporate-leasing/master-agreements")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Master Agreements
        </Button>
      </div>
    );
  }

  const statusInfo = statusConfig[agreement.status as keyof typeof statusConfig] || statusConfig.draft;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{agreement.agreement_no}</h1>
              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                {agreement.customer_segment ? (
                  <Building className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                {agreement.customer?.full_name || "Unknown Customer"}
              </div>
              {agreement.contract_end_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Valid until {format(new Date(agreement.contract_end_date), "MMM d, yyyy")}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => navigate("/corporate-leasing/master-agreements")}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button size="sm" onClick={() => navigate(`/corporate-leasing/master-agreements/view/${agreement.id}`)}>
              <FileText className="h-4 w-4 mr-1" />
              View Master Agreement
            </Button>
            <Button size="sm" onClick={() => navigate(`/corporate-leasing/master-agreements/${agreement.id}/edit`)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit Master Agreement
            </Button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {agreement.status === 'approved' && (
              <Button size="sm" onClick={() => setSendDialogOpen(true)}>
                <Mail className="h-4 w-4 mr-1" />
                Send to Customer
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Download PDF
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
                <DropdownMenuItem>
                  <Mail className="h-4 w-4 mr-2" />
                  Email Agreement
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Download & Share
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-1" />
              Duplicate
            </Button>
          </div>
        </div>
      </div>

      {/* Customer Acceptance Status */}
      {agreement.status === 'customer_accepted' && agreement.customer_signature_data && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <div className="flex justify-between items-start">
              <div>
                <strong>Customer Accepted & Signed</strong>
                {agreement.customer_signed_at && (
                  <p className="text-sm mt-1">
                    Signed on {format(new Date(agreement.customer_signed_at), 'MMM dd, yyyy')}
                    {typeof agreement.customer_signature_data === 'object' && agreement.customer_signature_data && 'signer_name' in agreement.customer_signature_data && ` by ${String(agreement.customer_signature_data.signer_name)}`}
                  </p>
                )}
                {typeof agreement.customer_signature_data === 'object' && agreement.customer_signature_data && 'signer_title' in agreement.customer_signature_data && agreement.customer_signature_data.signer_title && (
                  <p className="text-sm">Title: {String(agreement.customer_signature_data.signer_title)}</p>
                )}
              </div>
              {typeof agreement.customer_signature_data === 'object' && agreement.customer_signature_data && 'signature_image' in agreement.customer_signature_data && agreement.customer_signature_data.signature_image && (
                <img 
                  src={agreement.customer_signature_data.signature_image as string} 
                  alt="Customer Signature" 
                  className="h-16 border rounded bg-white"
                />
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {agreement.status === 'customer_rejected' && (
        <Alert variant="destructive">
          <AlertDescription>
            <strong>Customer Rejected</strong>
            {agreement.customer_rejection_reason && (
              <p className="text-sm mt-2">Reason: {agreement.customer_rejection_reason}</p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Customer Response Actions - Show for approved/sent_to_customer agreements */}
      {['approved', 'sent_to_customer'].includes(agreement.status) && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Response</CardTitle>
            <CardDescription>
              Record customer signature or rejection of this master agreement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setAcceptanceDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Customer Signed
              </Button>
              <Button
                variant="destructive"
                onClick={() => setRejectionDialogOpen(true)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Customer Rejected
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header Info Card */}
      <MasterAgreementHeaderInfo
        agreement={agreement}
        legalEntity={agreement.legal_entity}
        customer={agreement.customer}
        billToSite={agreement.bill_to_site}
      />

      {/* Dialogs */}
      {sendDialogOpen && (
        <SendMasterAgreementToCustomerDialog
          open={sendDialogOpen}
          onOpenChange={setSendDialogOpen}
          agreementId={agreement.id}
          agreementNumber={agreement.agreement_no || ''}
          customerName={agreement.customer?.full_name || 'Customer'}
          customerEmail={agreement.customer?.email || ''}
        />
      )}

      {acceptanceDialogOpen && (
        <CustomerAcceptanceMasterAgreementDialog
          open={acceptanceDialogOpen}
          onOpenChange={setAcceptanceDialogOpen}
          agreementId={agreement.id}
          agreementNumber={agreement.agreement_no || ''}
        />
      )}

      {rejectionDialogOpen && (
        <CustomerRejectionMasterAgreementDialog
          open={rejectionDialogOpen}
          onOpenChange={setRejectionDialogOpen}
          agreementId={agreement.id}
          agreementNumber={agreement.agreement_no || ''}
        />
      )}

      {/* Financial Summary */}
      <MasterAgreementFinancials agreement={agreement} lines={lines} />

      {/* Tabs */}
      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="lines">Contract Lines</TabsTrigger>
          <TabsTrigger value="customer-sales">Customer & Sales</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Master Agreement Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Agreement Number</p>
                  <p className="text-base font-semibold">{agreement.agreement_no}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Legal Entity</p>
                  <p className="text-base">{agreement.legal_entity?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Framework Model</p>
                  <p className="text-base">{agreement.framework_model || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Master Term</p>
                  <p className="text-base">{agreement.master_term || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Billing Cycle</p>
                  <p className="text-base capitalize">{agreement.billing_cycle || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Invoice Format</p>
                  <p className="text-base">{agreement.invoice_format || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contract Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Start Date</p>
                  <p className="text-base">
                    {agreement.contract_start_date
                      ? format(new Date(agreement.contract_start_date), "MMM dd, yyyy")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">End Date</p>
                  <p className="text-base">
                    {agreement.contract_end_date
                      ? format(new Date(agreement.contract_end_date), "MMM dd, yyyy")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Lines ({lines?.length || 0})</CardTitle>
              <CardDescription>Detailed vehicle information for all contract lines</CardDescription>
            </CardHeader>
            <CardContent>
              {lines && lines.length > 0 ? (
                <div className="space-y-4">
                  {lines.map((line: any) => (
                    <Card key={line.id} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            Line {line.line_number}: {line.make} {line.model} {line.model_year}
                          </CardTitle>
                          <Badge>{line.line_status}</Badge>
                        </div>
                        <CardDescription>{line.contract_no}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Vehicle Details</p>
                            <div className="space-y-1">
                              <p className="text-sm">
                                <span className="font-medium">Make/Model:</span> {line.make} {line.model}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Year:</span> {line.model_year}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Color:</span> {line.exterior_color || "N/A"}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Category:</span> {line.category_name || "N/A"}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Pricing Breakdown</p>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Base Rate:</span>
                                <span className="font-medium">{formatCurrency((line as any).base_vehicle_rate_per_month || 0, 'AED')}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Insurance:</span>
                                <span className="font-medium">+{formatCurrency((line as any).monthly_insurance_cost_per_vehicle || 300, 'AED')}</span>
                              </div>
                              {(line as any).monthly_maintenance_cost_per_vehicle && (
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground">Maintenance:</span>
                                  <span className="font-medium">+{formatCurrency((line as any).monthly_maintenance_cost_per_vehicle, 'AED')}</span>
                                </div>
                              )}
                              {(line as any).roadside_assistance_cost_monthly && (
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground">Roadside:</span>
                                  <span className="font-medium">+{formatCurrency((line as any).roadside_assistance_cost_monthly, 'AED')}</span>
                                </div>
                              )}
                              {(line as any).replacement_vehicle_cost_monthly && (
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground">Replacement:</span>
                                  <span className="font-medium">+{formatCurrency((line as any).replacement_vehicle_cost_monthly, 'AED')}</span>
                                </div>
                              )}
                              <div className="border-t pt-1 mt-2">
                                <div className="flex justify-between items-center text-sm font-bold">
                                  <span>Monthly Total:</span>
                                  <span>{formatCurrency((line as any).monthly_rate_aed || 0, 'AED')}</span>
                                </div>
                              </div>
                              <div className="mt-2 pt-2 border-t">
                                <p className="text-sm">
                                  <span className="font-medium">Setup Fee:</span>{" "}
                                  {formatCurrency((line as any).setup_fee_aed || 0, 'AED')}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Contract Months:</span> {(line as any).contract_months || "N/A"}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Total Value:</span>{" "}
                                  {formatCurrency(((line as any).monthly_rate_aed || 0) * ((line as any).contract_months || 0), 'AED')}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Mileage & Terms</p>
                            <div className="space-y-1">
                              <p className="text-sm">
                                <span className="font-medium">Allowance:</span>{" "}
                                {line.mileage_allowance_km_month?.toLocaleString() || 0} km/month
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Excess Rate:</span> {line.excess_km_rate_aed || 0} AED/km
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Lease Start:</span>{" "}
                                {line.lease_start_date
                                  ? format(new Date(line.lease_start_date), "MMM dd, yyyy")
                                  : "N/A"}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Lease End:</span>{" "}
                                {line.lease_end_date ? format(new Date(line.lease_end_date), "MMM dd, yyyy") : "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {line.item_description && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Item Code:</span> {line.item_code} | {line.item_description}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No vehicles found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contract Lines Tab */}
        <TabsContent value="lines">
          <MasterAgreementLines lines={lines} />
        </TabsContent>

        {/* Customer & Sales Tab */}
        <TabsContent value="customer-sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Customer Name</p>
                  <p className="font-medium">{agreement.customer?.full_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                  <p>{agreement.customer?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Phone</p>
                  <p>{agreement.customer?.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Customer Segment</p>
                  <p className="capitalize">{agreement.customer_segment || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Legal Entity & Business Unit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Legal Entity</p>
                  <p className="font-medium">{agreement.legal_entity?.name || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">{agreement.legal_entity?.code || ""}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Bill To Site</p>
                  <p className="font-medium">{agreement.bill_to_site?.site_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Contact Person</p>
                  <p>{agreement.bill_to_site?.contact_person || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Contact Email</p>
                  <p>{agreement.bill_to_site?.contact_email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Contact Phone</p>
                  <p>{agreement.bill_to_site?.contact_phone || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            {agreement.source_quote_id && (
              <Card>
                <CardHeader>
                  <CardTitle>Source Quote</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Quote Number</p>
                      <Button
                        variant="link"
                        className="p-0 h-auto font-normal"
                        onClick={() => navigate(`/quotes/${agreement.source_quote_id}`)}
                      >
                        {agreement.source_quote_no}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Insurance Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Insurance Responsibility</p>
                  <p>{agreement.insurance_responsibility || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Insurance Excess</p>
                  <p>{formatCurrency(agreement.insurance_excess_aed || 0)} AED</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Monthly Insurance Cost / Vehicle</p>
                  <p className="font-semibold text-lg">{formatCurrency((agreement as any).monthly_insurance_cost_per_vehicle || 300, 'AED')}</p>
                  <p className="text-xs text-muted-foreground">Included in vehicle monthly rate</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Maintenance Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Maintenance Policy</p>
                  <p>{agreement.maintenance_policy || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Workshop Preference</p>
                  <p>{agreement.workshop_preference || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Tyres Policy</p>
                  <p>{agreement.tyres_policy || "As per maintenance policy"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Monthly Maintenance Cost / Vehicle</p>
                  <p className="font-semibold text-lg">{formatCurrency((agreement as any).monthly_maintenance_cost_per_vehicle || 250, 'AED')}</p>
                  <p className="text-xs text-muted-foreground">
                    {(agreement as any).show_maintenance_separate_line ? "Shown as separate line" : "Included in vehicle rate"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Roadside Assistance</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={(agreement as any).roadside_assistance_included ? "default" : "secondary"}>
                      {(agreement as any).roadside_assistance_included ? "Included" : "Not Included"}
                    </Badge>
                    {(agreement as any).roadside_assistance_included && (agreement as any).roadside_assistance_cost_monthly && (
                      <span className="text-sm font-semibold">{formatCurrency((agreement as any).roadside_assistance_cost_monthly, 'AED')}/month</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Replacement Vehicle</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={(agreement as any).replacement_vehicle_included ? "default" : "secondary"}>
                      {(agreement as any).replacement_vehicle_included ? "Included" : "Not Included"}
                    </Badge>
                    {(agreement as any).replacement_vehicle_included && (
                      <>
                        {(agreement as any).replacement_vehicle_cost_monthly && (
                          <span className="text-sm font-semibold">{formatCurrency((agreement as any).replacement_vehicle_cost_monthly, 'AED')}/month</span>
                        )}
                        {agreement.replacement_sla_hours && (
                          <Badge variant="outline" className="text-xs">
                            {agreement.replacement_sla_hours}h SLA
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {agreement.replacement_sla_hours && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Replacement SLA</p>
                    <p>{agreement.replacement_sla_hours} hours</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tolls & Fines Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Salik/Darb Handling</p>
                  <p>{agreement.salik_darb_handling || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Traffic Fines Handling</p>
                  <p>{agreement.traffic_fines_handling || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Admin Fee per Fine</p>
                  <p>{formatCurrency(agreement.admin_fee_per_fine_aed || 0)} AED</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Tolls Admin Fee Model</p>
                  <p>{agreement.tolls_admin_fee_model || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fuel & Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Fuel Handling</p>
                  <p>{agreement.fuel_handling || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Registration Responsibility</p>
                  <p>{agreement.registration_responsibility || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contract Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Off-Hire Notice Period</p>
                  <p>{agreement.off_hire_notice_period || "N/A"} days</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Early Termination Allowed</p>
                  <p>{agreement.early_termination_allowed ? "Yes" : "No"}</p>
                </div>
                {agreement.early_termination_rule && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Early Termination Rule</p>
                    <p>{agreement.early_termination_rule}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Co-Terminus Lines</p>
                  <p>{agreement.co_terminus_lines ? "Yes" : "No"}</p>
                </div>
                {agreement.renewal_option && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Renewal Option</p>
                    <p>{agreement.renewal_option}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Security & Deposit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Security Instrument</p>
                  <p>{agreement.security_instrument || "N/A"}</p>
                </div>
                {agreement.deposit_amount_aed && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Deposit Amount</p>
                    <p className="font-semibold">{formatCurrency(agreement.deposit_amount_aed)} AED</p>
                  </div>
                )}
                {agreement.credit_limit && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Credit Limit</p>
                    <p>{formatCurrency(agreement.credit_limit)} AED</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Billing Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Billing Cycle</p>
                  <p className="capitalize">{agreement.billing_cycle || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Billing Day Reference</p>
                  <p>{getBillingDayLabel((agreement as any).billing_day)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Billing Start Trigger</p>
                  <p>{getBillingStartTriggerLabel((agreement as any).billing_start_trigger)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Invoice Format</p>
                  <p>{agreement.invoice_format || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Line-Item Granularity</p>
                  <p>{getLineItemGranularityLabel((agreement as any).line_item_granularity)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Credit Terms</p>
                  <p>{agreement.credit_terms || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Currency</p>
                  <p>{agreement.currency || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">VAT Code</p>
                  <p>{agreement.vat_code || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Allocation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Cost Allocation Mode</p>
                  <p>{agreement.cost_allocation_mode || "N/A"}</p>
                </div>
                {agreement.customer_po_no && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Customer PO Number</p>
                    <p>{agreement.customer_po_no}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">No billing records found</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attachments Tab */}
        <TabsContent value="attachments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="h-5 w-5" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">No attachments found</p>
              <Button variant="outline" className="w-full">
                <Paperclip className="h-4 w-4 mr-2" />
                Upload Attachment
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-primary/10 p-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div className="h-full w-px bg-border" />
                  </div>
                  <div className="flex-1 pb-8">
                    <p className="font-medium">Agreement Created</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(agreement.created_at), "MMM dd, yyyy HH:mm")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Internal Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {agreement.notes ? (
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-sm">{agreement.notes}</p>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No notes available</p>
              )}
              <Button variant="outline" className="w-full">
                Add Note
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MasterAgreementDetails;
