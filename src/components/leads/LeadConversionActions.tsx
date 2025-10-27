import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  FileText,
  Send,
  X,
  Calendar,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Lead } from '@/hooks/useLeadsRealtime';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface LeadConversionActionsProps {
  lead: Lead;
  onUpdate?: () => void;
}

export const LeadConversionActions = ({ lead, onUpdate }: LeadConversionActionsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isConverting, setIsConverting] = useState(false);
  const [isSendingQuote, setIsSendingQuote] = useState(false);

  const canConvert = ['new', 'contacted', 'quoted'].includes(lead.status);
  const canSendQuote = lead.status !== 'confirmed' && lead.status !== 'rejected';
  const canReject = lead.status !== 'rejected' && lead.status !== 'confirmed';

  const handleConvertToReservation = async () => {
    setIsConverting(true);
    try {
      // Update lead status to confirmed
      const { error } = await supabase
        .from('leads')
        .update({
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', lead.id);

      if (error) throw error;

      toast({
        title: 'Lead Confirmed',
        description: 'Lead has been marked as confirmed. You can now create a reservation.',
      });

      onUpdate?.();

      // Navigate to new reservation with pre-filled data
      setTimeout(() => {
        navigate(`/reservations/new?leadId=${lead.id}`);
      }, 1500);
    } catch (error) {
      console.error('Error converting lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to convert lead to reservation',
        variant: 'destructive',
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleSendQuote = async () => {
    setIsSendingQuote(true);
    try {
      // Update lead status to quoted
      const { error } = await supabase
        .from('leads')
        .update({
          status: 'quoted',
          updated_at: new Date().toISOString(),
          responded_at: lead.responded_at || new Date().toISOString(),
        })
        .eq('id', lead.id);

      if (error) throw error;

      toast({
        title: 'Quote Sent',
        description: `Custom quote has been sent to ${lead.customer_email}`,
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error sending quote:', error);
      toast({
        title: 'Error',
        description: 'Failed to send quote',
        variant: 'destructive',
      });
    } finally {
      setIsSendingQuote(false);
    }
  };

  const handleReject = async () => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', lead.id);

      if (error) throw error;

      toast({
        title: 'Lead Rejected',
        description: 'Lead has been marked as rejected.',
        variant: 'destructive',
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error rejecting lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject lead',
        variant: 'destructive',
      });
    }
  };

  const getStatusInfo = () => {
    switch (lead.status) {
      case 'new':
        return {
          icon: AlertCircle,
          text: 'New lead - Awaiting first contact',
          color: 'text-blue-600 dark:text-blue-400',
        };
      case 'contacted':
        return {
          icon: Clock,
          text: 'Customer contacted - Awaiting quote or confirmation',
          color: 'text-purple-600 dark:text-purple-400',
        };
      case 'quoted':
        return {
          icon: FileText,
          text: 'Quote sent - Awaiting customer response',
          color: 'text-amber-600 dark:text-amber-400',
        };
      case 'confirmed':
        return {
          icon: CheckCircle2,
          text: 'Lead confirmed - Ready to create reservation',
          color: 'text-green-600 dark:text-green-400',
        };
      case 'rejected':
        return {
          icon: X,
          text: 'Lead rejected',
          color: 'text-red-600 dark:text-red-400',
        };
      case 'expired':
        return {
          icon: Clock,
          text: 'Lead expired',
          color: 'text-gray-600 dark:text-gray-400',
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Lead Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Info */}
        <div className={`flex items-start gap-3 p-3 rounded-lg bg-muted/50 ${statusInfo.color}`}>
          <StatusIcon className="h-5 w-5 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">{statusInfo.text}</p>
            {lead.responded_at && (
              <p className="text-xs opacity-75 mt-1">
                Last responded {formatDistanceToNow(new Date(lead.responded_at), { addSuffix: true })}
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Primary Actions */}
        <div className="space-y-3">
          {canConvert && (
            <Button
              onClick={handleConvertToReservation}
              disabled={isConverting}
              className="w-full gap-2 h-12"
              size="lg"
            >
              <CheckCircle2 className="h-5 w-5" />
              {isConverting ? 'Converting...' : 'Convert to Reservation'}
            </Button>
          )}

          {canSendQuote && (
            <Button
              onClick={handleSendQuote}
              disabled={isSendingQuote}
              variant="outline"
              className="w-full gap-2"
            >
              <Send className="h-4 w-4" />
              {isSendingQuote ? 'Sending...' : 'Send Custom Quote'}
            </Button>
          )}

          {canReject && (
            <Button
              onClick={handleReject}
              variant="outline"
              className="w-full gap-2 text-destructive hover:bg-destructive/10"
            >
              <X className="h-4 w-4" />
              Reject Lead
            </Button>
          )}
        </div>

        {/* SLA Information */}
        {lead.sla_response_deadline && (
          <div className="space-y-2 pt-2">
            <Separator />
            <div className="space-y-1">
              <p className="text-sm font-medium">Response SLA</p>
              {lead.sla_breached ? (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  SLA Breached
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3" />
                  Within SLA
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Assignment Info */}
        {lead.assigned_to && (
          <div className="space-y-1 pt-2">
            <p className="text-xs text-muted-foreground">Assigned To</p>
            <Badge variant="outline">{lead.assigned_to}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
