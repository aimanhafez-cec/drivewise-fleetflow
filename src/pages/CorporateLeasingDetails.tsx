import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ArrowLeft, FileText, Edit, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { formatCurrency } from "@/lib/utils";
import { 
  getBillingDayLabel, 
  getLineItemGranularityLabel, 
  getBillingStartTriggerLabel 
} from "@/lib/constants/billingOptions";

const CorporateLeasingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: agreement, isLoading } = useQuery({
    queryKey: ['corporate-leasing-agreement', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data: agreementData, error: agreementError } = await supabase
        .from('corporate_leasing_agreements')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (agreementError) throw agreementError;
      if (!agreementData) return null;

      // Fetch related data separately
      const [customerData, legalEntityData, siteData, linesData] = await Promise.all([
        agreementData.customer_id ? supabase
          .from('customers')
          .select('full_name, email, phone')
          .eq('id', agreementData.customer_id)
          .maybeSingle() : Promise.resolve({ data: null }),
        
        agreementData.legal_entity_id ? supabase
          .from('legal_entities')
          .select('name, code')
          .eq('id', agreementData.legal_entity_id)
          .maybeSingle() : Promise.resolve({ data: null }),
        
        agreementData.bill_to_site_id ? supabase
          .from('customer_sites')
          .select('site_name, address')
          .eq('id', agreementData.bill_to_site_id)
          .maybeSingle() : Promise.resolve({ data: null }),
        
        supabase
          .from('corporate_leasing_lines')
          .select('*')
          .eq('agreement_id', agreementData.id)
      ]);

      return {
        ...agreementData,
        customers: customerData.data,
        legal_entities: legalEntityData.data,
        customer_sites: siteData.data,
        corporate_leasing_lines: linesData.data || []
      };

    },
    enabled: !!id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'terminated':
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return 'Pending Approval';
      case 'active':
        return 'Active';
      case 'draft':
        return 'Draft';
      case 'suspended':
        return 'Suspended';
      case 'terminated':
        return 'Terminated';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-full max-w-sm" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <div className="flex space-x-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <FileText className="h-12 w-12 text-card-foreground" />
        <h3 className="mt-4 text-lg font-semibold text-card-foreground">Agreement not found</h3>
        <p className="text-card-foreground">
          The corporate leasing agreement you're looking for doesn't exist.
        </p>
        <Button 
          className="mt-4"
          onClick={() => navigate('/corporate-leasing')}
        >
          Back to Corporate Leasing
        </Button>
      </div>
    );
  }

  return (
    <div id="corporate-leasing-details-page" className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/corporate-leasing">Corporate Leasing</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {agreement.agreement_no || `Draft-${agreement.id.slice(0, 8)}`}
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/corporate-leasing')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-card-foreground">
              {agreement.agreement_no || `Draft Agreement #${agreement.id.slice(0, 8)}`}
            </h1>
            <div className="flex items-center gap-4 text-sm text-card-foreground">
              <span>Created on {format(new Date(agreement.created_at), 'MMMM dd, yyyy')}</span>
              {agreement.source_quote_no && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">From Quote:</span>
                  <Link 
                    to={`/quotes/${agreement.source_quote_id}`}
                    className="text-primary hover:underline font-mono inline-flex items-center gap-1"
                  >
                    {agreement.source_quote_no}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(agreement.status)}>
            {getStatusLabel(agreement.status)}
          </Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/corporate-leasing/${agreement.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Agreement
          </Button>
        </div>
      </div>

      {/* Details Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-card-foreground">Customer Name</p>
              <p className="font-medium text-card-foreground">
                {agreement.customers?.full_name || 'Unknown Customer'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">Email</p>
              <p className="text-card-foreground">{agreement.customers?.email || 'N/A'}</p>
            </div>
            {agreement.customers?.phone && (
              <div>
                <p className="text-sm font-medium text-card-foreground">Phone</p>
                <p className="text-card-foreground">{agreement.customers.phone}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-card-foreground">Customer Segment</p>
              <p className="text-card-foreground">{agreement.customer_segment || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Legal Entity & Billing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">Legal Entity & Billing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-card-foreground">Legal Entity</p>
              <p className="font-medium text-card-foreground">
                {agreement.legal_entities?.name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">Bill-to Site</p>
              <p className="text-card-foreground">
                {agreement.customer_sites?.site_name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">Credit Terms</p>
              <p className="text-card-foreground">{agreement.credit_terms}</p>
            </div>
            {agreement.credit_limit && (
              <div>
                <p className="text-sm font-medium text-card-foreground">Credit Limit</p>
                <p className="text-card-foreground">{formatCurrency(agreement.credit_limit)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contract Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">Contract Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-card-foreground">Framework Model</p>
              <p className="text-card-foreground">{agreement.framework_model}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">Master Term</p>
              <p className="text-card-foreground">{agreement.master_term}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">Contract Start</p>
              <p className="text-card-foreground">
                {agreement.contract_start_date 
                  ? format(new Date(agreement.contract_start_date), 'MMM dd, yyyy')
                  : 'Not set'
                }
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">Contract End</p>
              <p className="text-card-foreground">
                {agreement.contract_end_date 
                  ? format(new Date(agreement.contract_end_date), 'MMM dd, yyyy')
                  : 'Not set'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="lines">Lease Lines</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-card-foreground">Contract Scope</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-card-foreground">Cost Allocation Mode:</span>
                  <span className="text-card-foreground font-medium">{agreement.cost_allocation_mode}</span>
                </div>
                {agreement.committed_fleet_size && (
                  <div className="flex justify-between">
                    <span className="text-card-foreground">Committed Fleet Size:</span>
                    <span className="text-card-foreground font-medium">{agreement.committed_fleet_size} vehicles</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-card-foreground">Co-terminus Lines:</span>
                  <span className="text-card-foreground font-medium">{agreement.co_terminus_lines ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-card-foreground">Off-hire Notice:</span>
                  <span className="text-card-foreground font-medium">{agreement.off_hire_notice_period} days</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-card-foreground">Financial Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-card-foreground">Security Instrument:</span>
                  <span className="text-card-foreground font-medium">{agreement.security_instrument}</span>
                </div>
                {agreement.deposit_amount_aed && (
                  <div className="flex justify-between">
                    <span className="text-card-foreground">Deposit Amount:</span>
                    <span className="text-card-foreground font-medium">{formatCurrency(agreement.deposit_amount_aed)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-card-foreground">SLA Credits:</span>
                  <span className="text-card-foreground font-medium">{agreement.sla_credits_enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                {agreement.sla_credits_percentage && (
                  <div className="flex justify-between">
                    <span className="text-card-foreground">SLA Credits %:</span>
                    <span className="text-card-foreground font-medium">{agreement.sla_credits_percentage}%</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="policies">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-card-foreground">Responsibilities & Inclusions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-card-foreground">Insurance:</span>
                  <span className="text-card-foreground font-medium">{agreement.insurance_responsibility}</span>
                </div>
                {agreement.insurance_excess_aed && (
                  <div className="flex justify-between">
                    <span className="text-card-foreground">Insurance Excess:</span>
                    <span className="text-card-foreground font-medium">{formatCurrency(agreement.insurance_excess_aed)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-card-foreground">Maintenance:</span>
                  <span className="text-card-foreground font-medium">{agreement.maintenance_policy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-card-foreground">Roadside Assistance:</span>
                  <span className="text-card-foreground font-medium">{agreement.roadside_assistance_included ? 'Included' : 'Not Included'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-card-foreground">Replacement Vehicle:</span>
                  <span className="text-card-foreground font-medium">{agreement.replacement_vehicle_included ? 'Included' : 'Not Included'}</span>
                </div>
                {agreement.replacement_sla_hours && (
                  <div className="flex justify-between">
                    <span className="text-card-foreground">Replacement SLA:</span>
                    <span className="text-card-foreground font-medium">{agreement.replacement_sla_hours} hours</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-card-foreground">Operational Policies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-card-foreground">Salik/Darb Handling:</span>
                  <span className="text-card-foreground font-medium">{agreement.salik_darb_handling}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-card-foreground">Traffic Fines:</span>
                  <span className="text-card-foreground font-medium">{agreement.traffic_fines_handling}</span>
                </div>
                {agreement.admin_fee_per_fine_aed && (
                  <div className="flex justify-between">
                    <span className="text-card-foreground">Admin Fee per Fine:</span>
                    <span className="text-card-foreground font-medium">{formatCurrency(agreement.admin_fee_per_fine_aed)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-card-foreground">Fuel Handling:</span>
                  <span className="text-card-foreground font-medium">{agreement.fuel_handling}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="lines">
          <Card>
            <CardHeader>
              <CardTitle className="text-card-foreground">Lease Lines</CardTitle>
            </CardHeader>
            <CardContent>
              {agreement.corporate_leasing_lines && agreement.corporate_leasing_lines.length > 0 ? (
                <p className="text-card-foreground">
                  {agreement.corporate_leasing_lines.length} lease line(s) configured
                </p>
              ) : (
                <p className="text-card-foreground text-center py-8">
                  No lease lines configured yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="text-card-foreground">Billing Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-card-foreground">Billing Day Reference:</span>
                <span className="text-card-foreground font-medium">{getBillingDayLabel((agreement as any).billing_day)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-card-foreground">Billing Start Trigger:</span>
                <span className="text-card-foreground font-medium">{getBillingStartTriggerLabel((agreement as any).billing_start_trigger)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-card-foreground">Invoice Format:</span>
                <span className="text-card-foreground font-medium">{agreement.invoice_format}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-card-foreground">Line-Item Granularity:</span>
                <span className="text-card-foreground font-medium">{getLineItemGranularityLabel((agreement as any).line_item_granularity)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-card-foreground">Currency:</span>
                <span className="text-card-foreground font-medium">{agreement.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-card-foreground">VAT Code:</span>
                <span className="text-card-foreground font-medium">{agreement.vat_code}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle className="text-card-foreground">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {agreement.notes ? (
                <p className="whitespace-pre-wrap text-card-foreground">{agreement.notes}</p>
              ) : (
                <p className="text-card-foreground">No notes available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CorporateLeasingDetails;