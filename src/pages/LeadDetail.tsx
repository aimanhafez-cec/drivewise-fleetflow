import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useLead } from '@/hooks/useLead';
import { LeadHeader } from '@/components/leads/LeadHeader';
import { LeadActionBar } from '@/components/leads/LeadActionBar';
import { LeadCustomerInfo } from '@/components/leads/LeadCustomerInfo';
import { LeadVehicleCard } from '@/components/leads/LeadVehicleCard';
import { LeadRequestDetails } from '@/components/leads/LeadRequestDetails';
import { LeadPricingEstimation } from '@/components/leads/LeadPricingEstimation';
import { LeadCommunicationTimeline } from '@/components/leads/LeadCommunicationTimeline';
import { LeadSourceData } from '@/components/leads/LeadSourceData';
import { useToast } from '@/hooks/use-toast';

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { lead, loading, error, refetch } = useLead(id);

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <Card className="p-12 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading lead details...</p>
        </Card>
      </div>
    );
  }

  // Error or not found state
  if (error || !lead) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Lead Not Found</h2>
          <p className="text-muted-foreground mb-4">The lead you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/leads-intake')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Leads
          </Button>
        </div>
      </div>
    );
  }

  const handleConfirm = () => {
    toast({
      title: 'Lead Confirmed',
      description: 'Lead has been converted to a reservation. Redirecting to reservation details...',
    });
    // TODO: Implement actual confirmation logic
  };

  const handleSendQuote = () => {
    toast({
      title: 'Quote Sent',
      description: 'Custom quote has been sent to the customer via email.',
    });
    // TODO: Implement quote sending logic
  };

  const handleReject = () => {
    toast({
      title: 'Lead Rejected',
      description: 'Lead has been marked as rejected.',
      variant: 'destructive',
    });
    // TODO: Implement rejection logic
  };

  const handleAssign = () => {
    toast({
      title: 'Agent Assigned',
      description: 'Lead has been assigned to an available agent.',
    });
    // TODO: Implement assignment logic
  };

  const handleContact = (method: 'email' | 'phone' | 'whatsapp') => {
    toast({
      title: `Contacting via ${method}`,
      description: `Opening ${method} to contact ${lead.customer_name}...`,
    });
    // TODO: Implement contact logic
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with Status Management */}
      <LeadHeader lead={lead} onUpdate={refetch} />

      {/* Action Bar */}
      <LeadActionBar
        lead={lead}
        onConfirm={handleConfirm}
        onSendQuote={handleSendQuote}
        onReject={handleReject}
        onAssign={handleAssign}
        onContact={handleContact}
      />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LeadCustomerInfo lead={lead} />
            <LeadVehicleCard lead={lead} />
          </div>
          <LeadRequestDetails lead={lead} />
          <LeadPricingEstimation lead={lead} />
        </div>

        {/* Right Column - Timeline & Source Data */}
        <div className="space-y-6">
          <LeadCommunicationTimeline lead={lead} />
          <LeadSourceData lead={lead} />
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
