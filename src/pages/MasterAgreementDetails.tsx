import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ArrowLeft, FileText, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const MasterAgreementDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: agreement, isLoading } = useQuery({
    queryKey: ['master-agreement', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data: agreementData, error: agreementError } = await supabase
        .from('corporate_leasing_agreements')
        .select(`
          *,
          legal_entity:legal_entity_id (
            name,
            code
          ),
          bill_to_site:bill_to_site_id (
            site_name,
            site_code,
            contact_person,
            contact_email,
            contact_phone
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (agreementError) throw agreementError;
      if (!agreementData) return null;
      
      // Fetch customer data separately
      if (agreementData.customer_id) {
        const { data: customer } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone')
          .eq('id', agreementData.customer_id)
          .maybeSingle();
        
        return {
          ...agreementData,
          customer
        } as any;
      }
      
      return agreementData as any;
    },
    enabled: !!id,
  });

  const { data: lines } = useQuery({
    queryKey: ['master-agreement-lines', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('corporate_leasing_lines')
        .select('*')
        .eq('agreement_id', id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 font-medium';
      case 'draft':
        return 'text-gray-600';
      case 'suspended':
        return 'text-orange-600 font-medium';
      case 'expired':
        return 'text-gray-400';
      case 'terminated':
        return 'text-red-600 font-medium';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-full max-w-sm" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-9 w-20" />
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
        <FileText className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Master Agreement not found</h3>
        <p className="text-muted-foreground">
          The master agreement you're looking for doesn't exist.
        </p>
        <Button 
          className="mt-4"
          onClick={() => navigate('/master-agreements')}
        >
          Back to Master Agreements
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/master-agreements">Master Agreements</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {agreement.agreement_no || `CLA-${agreement.id.slice(0, 8)}`}
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-start space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/master-agreements')}
            className="p-2 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-words">
              Master Agreement {agreement.agreement_no || `#${agreement.id.slice(0, 8)}`}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Created on {format(new Date(agreement.created_at), 'MMMM dd, yyyy')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={cn("text-sm", getStatusColor(agreement.status))}>
            {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/master-agreements/${agreement.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Details Cards */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Customer Information */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Customer Name</p>
              <p className="font-medium text-sm sm:text-base break-words">
                {agreement.customer?.full_name || 'Unknown Customer'}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Email</p>
              <p className="text-sm sm:text-base break-all">{agreement.customer?.email || 'N/A'}</p>
            </div>
            {agreement.customer?.phone && (
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Phone</p>
                <p className="text-sm sm:text-base">{agreement.customer.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legal Entity & Billing */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Legal Entity & Billing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Legal Entity</p>
              <p className="font-medium text-sm sm:text-base">
                {agreement.legal_entity?.name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Bill To Site</p>
              <p className="text-sm sm:text-base">{agreement.bill_to_site?.site_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Billing Cycle</p>
              <p className="text-sm sm:text-base capitalize">{agreement.billing_cycle || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Contract Terms */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Contract Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Contract Period</p>
              <p className="text-sm sm:text-base">
                {agreement.contract_start_date && agreement.contract_end_date
                  ? `${format(new Date(agreement.contract_start_date), 'MMM dd, yyyy')} - ${format(new Date(agreement.contract_end_date), 'MMM dd, yyyy')}`
                  : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Credit Terms</p>
              <p className="text-sm sm:text-base">{agreement.credit_terms || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Status</p>
              <span className={cn("text-sm", getStatusColor(agreement.status))}>
                {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="flex w-max min-w-full sm:w-full">
            <TabsTrigger value="overview" className="flex-1 sm:flex-none">Overview</TabsTrigger>
            <TabsTrigger value="lines" className="flex-1 sm:flex-none">Contract Lines</TabsTrigger>
            <TabsTrigger value="policies" className="flex-1 sm:flex-none">Policies</TabsTrigger>
            <TabsTrigger value="billing" className="flex-1 sm:flex-none">Billing</TabsTrigger>
            <TabsTrigger value="notes" className="flex-1 sm:flex-none">Notes</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agreement Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Framework Model</p>
                  <p className="text-base">{agreement.framework_model || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Master Term</p>
                  <p className="text-base">{agreement.master_term || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Insurance Responsibility</p>
                  <p className="text-base">{agreement.insurance_responsibility || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Maintenance Policy</p>
                  <p className="text-base">{agreement.maintenance_policy || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lines">
          <Card>
            <CardHeader>
              <CardTitle>Contract Lines</CardTitle>
            </CardHeader>
            <CardContent>
              {lines && lines.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Line No.</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lines.map((line, index) => (
                        <TableRow key={line.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>Contract Line {index + 1}</TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">Active</span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">TBD</TableCell>
                          <TableCell className="text-sm text-muted-foreground">TBD</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No contract lines found
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>Policies & Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Off-Hire Notice Period</p>
                <p className="text-base">{agreement.off_hire_notice_period || 'N/A'} days</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Early Termination Allowed</p>
                <p className="text-base">{agreement.early_termination_allowed ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Salik/Darb Handling</p>
                <p className="text-base">{agreement.salik_darb_handling || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Traffic Fines Handling</p>
                <p className="text-base">{agreement.traffic_fines_handling || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                No billing records found
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {agreement.notes ? (
                <p className="whitespace-pre-wrap">{agreement.notes}</p>
              ) : (
                <p className="text-muted-foreground">No notes available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MasterAgreementDetails;
