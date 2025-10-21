import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  FileText,
  Printer,
  Mail,
  Edit,
  MoreHorizontal,
  Clock,
  DollarSign,
  ClipboardCheck,
  AlertTriangle,
  Car,
  FileStack,
  History,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { AgreementOverviewTab } from '@/components/agreements/details/AgreementOverviewTab';
import { AgreementFinancialTab } from '@/components/agreements/details/AgreementFinancialTab';
import { AgreementInspectionTab } from '@/components/agreements/details/AgreementInspectionTab';
import { AgreementTollsFinesTab } from '@/components/agreements/details/AgreementTollsFinesTab';
import { AgreementVehicleHistoryTab } from '@/components/agreements/details/AgreementVehicleHistoryTab';
import { AgreementDocumentsTab } from '@/components/agreements/details/AgreementDocumentsTab';
import { AgreementActivityLogTab } from '@/components/agreements/details/AgreementActivityLogTab';

const AgreementDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: agreement, isLoading } = useQuery({
    queryKey: ['agreement:details', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agreements')
        .select(`
          *,
          profiles:customer_id (
            id,
            full_name,
            email,
            phone
          ),
          vehicles (
            id,
            make,
            model,
            year,
            license_plate,
            vin,
            color,
            status
          ),
          agreement_lines (
            *,
            vehicles (
              make,
              model,
              license_plate
            )
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Agreement not found');
      return data;
    },
    enabled: !!id,
  });

  const getStatusVariant = (status: string) => {
    const variants: Record<string, any> = {
      draft: 'secondary',
      active: 'default',
      pending_return: 'outline',
      completed: 'secondary',
      terminated: 'destructive',
    };
    return variants[status] || 'default';
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <FileText className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">Agreement Not Found</h2>
        <Button onClick={() => navigate('/agreements')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Agreements
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/agreements')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">
                {agreement.agreement_no || `AGR-${agreement.id.slice(0, 8)}`}
              </h1>
              <Badge variant={getStatusVariant(agreement.status)}>
                {agreement.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Created {format(new Date(agreement.created_at), 'MMM dd, yyyy HH:mm')}
              {agreement.updated_at !== agreement.created_at && (
                <> · Last updated {format(new Date(agreement.updated_at), 'MMM dd, yyyy HH:mm')}</>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/agreements/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>More Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {agreement.status === 'active' && (
                <>
                  <DropdownMenuItem>
                    <Clock className="mr-2 h-4 w-4" />
                    Extend Agreement
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Car className="mr-2 h-4 w-4" />
                    Exchange Vehicle
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Process Return
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem className="text-destructive">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Terminate Agreement
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Financial</span>
          </TabsTrigger>
          <TabsTrigger value="inspection" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Inspection</span>
          </TabsTrigger>
          <TabsTrigger value="tolls-fines" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Tolls & Fines</span>
          </TabsTrigger>
          <TabsTrigger value="vehicle-history" className="gap-2">
            <Car className="h-4 w-4" />
            <span className="hidden sm:inline">Vehicle</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileStack className="h-4 w-4" />
            <span className="hidden sm:inline">Documents</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AgreementOverviewTab agreement={agreement} />
        </TabsContent>

        <TabsContent value="financial">
          <AgreementFinancialTab agreement={agreement} />
        </TabsContent>

        <TabsContent value="inspection">
          <AgreementInspectionTab agreement={agreement} />
        </TabsContent>

        <TabsContent value="tolls-fines">
          <AgreementTollsFinesTab agreement={agreement} />
        </TabsContent>

        <TabsContent value="vehicle-history">
          <AgreementVehicleHistoryTab agreement={agreement} />
        </TabsContent>

        <TabsContent value="documents">
          <AgreementDocumentsTab agreement={agreement} />
        </TabsContent>

        <TabsContent value="activity">
          <AgreementActivityLogTab agreement={agreement} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgreementDetails;
