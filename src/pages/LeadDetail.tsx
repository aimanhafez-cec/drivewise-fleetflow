import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useLead } from '@/hooks/useLead';
import { LeadSourceBadge } from '@/components/leads/LeadSourceBadge';
import { LeadActionBar } from '@/components/leads/LeadActionBar';
import { LeadCustomerInfo } from '@/components/leads/LeadCustomerInfo';
import { LeadRequestDetails } from '@/components/leads/LeadRequestDetails';
import { LeadPricingEstimation } from '@/components/leads/LeadPricingEstimation';
import { LeadCommunicationTimeline } from '@/components/leads/LeadCommunicationTimeline';
import { LeadSourceData } from '@/components/leads/LeadSourceData';
import { useToast } from '@/hooks/use-toast';

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { lead, loading, error } = useLead(id);

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

  const getStatusBadge = (status: typeof lead.status) => {
    const statusConfig = {
      new: { label: 'New', className: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
      contacted: { label: 'Contacted', className: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
      quoted: { label: 'Quoted', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
      confirmed: { label: 'Confirmed', className: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
      expired: { label: 'Expired', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    };
    const config = statusConfig[status];
    return <Badge className={`${config.className} border-0`}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: typeof lead.priority) => {
    const priorityConfig = {
      high: { label: 'High Priority', className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
      medium: { label: 'Medium Priority', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' },
      low: { label: 'Low Priority', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    };
    const config = priorityConfig[priority];
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

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
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/leads-intake')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{lead.lead_no}</h1>
            {getStatusBadge(lead.status)}
            {getPriorityBadge(lead.priority)}
            <LeadSourceBadge sourceId={lead.source_name} />
          </div>
        </div>
      </div>

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
          <LeadCustomerInfo lead={lead} />
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
