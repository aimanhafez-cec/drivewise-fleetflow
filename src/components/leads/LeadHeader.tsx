import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Clock, DollarSign, Calendar } from 'lucide-react';
import { Lead } from '@/hooks/useLeadsRealtime';
import { LeadSourceBadge } from './LeadSourceBadge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';

interface LeadHeaderProps {
  lead: Lead;
  onUpdate?: () => void;
}

export const LeadHeader = ({ lead, onUpdate }: LeadHeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusBadge = (status: Lead['status']) => {
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

  const getPriorityBadge = (priority: Lead['priority']) => {
    const priorityConfig = {
      high: { label: 'High Priority', className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
      medium: { label: 'Medium Priority', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' },
      low: { label: 'Low Priority', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    };

    const config = priorityConfig[priority];
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const handleStatusChange = async (newStatus: Lead['status']) => {
    setIsUpdating(true);
    try {
      const updates: any = { 
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      // Update responded_at if moving from new to contacted
      if (lead.status === 'new' && newStatus === 'contacted' && !lead.responded_at) {
        updates.responded_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', lead.id);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `Lead status changed to ${newStatus}`,
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update lead status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePriorityChange = async (newPriority: Lead['priority']) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          priority: newPriority,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lead.id);

      if (error) throw error;

      toast({
        title: 'Priority Updated',
        description: `Lead priority changed to ${newPriority}`,
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error updating priority:', error);
      toast({
        title: 'Error',
        description: 'Failed to update lead priority',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Back Button & Title */}
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
            <LeadSourceBadge sourceId={lead.source_name} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Created {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Status & Priority Management Card */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Status Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={lead.status}
              onValueChange={handleStatusChange}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue>{getStatusBadge(lead.status)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">
                  <span className="flex items-center gap-2">
                    {getStatusBadge('new')}
                  </span>
                </SelectItem>
                <SelectItem value="contacted">
                  <span className="flex items-center gap-2">
                    {getStatusBadge('contacted')}
                  </span>
                </SelectItem>
                <SelectItem value="quoted">
                  <span className="flex items-center gap-2">
                    {getStatusBadge('quoted')}
                  </span>
                </SelectItem>
                <SelectItem value="confirmed">
                  <span className="flex items-center gap-2">
                    {getStatusBadge('confirmed')}
                  </span>
                </SelectItem>
                <SelectItem value="rejected">
                  <span className="flex items-center gap-2">
                    {getStatusBadge('rejected')}
                  </span>
                </SelectItem>
                <SelectItem value="expired">
                  <span className="flex items-center gap-2">
                    {getStatusBadge('expired')}
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select
              value={lead.priority}
              onValueChange={handlePriorityChange}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue>{getPriorityBadge(lead.priority)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">
                  <span className="flex items-center gap-2">
                    {getPriorityBadge('high')}
                  </span>
                </SelectItem>
                <SelectItem value="medium">
                  <span className="flex items-center gap-2">
                    {getPriorityBadge('medium')}
                  </span>
                </SelectItem>
                <SelectItem value="low">
                  <span className="flex items-center gap-2">
                    {getPriorityBadge('low')}
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Key Metrics */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Estimated Value
            </label>
            <p className="text-2xl font-bold">
              AED {lead.estimated_value.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {lead.duration_days} days rental
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Pickup Date
            </label>
            <p className="text-lg font-semibold">
              {format(new Date(lead.pickup_datetime), 'MMM dd, yyyy')}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(lead.pickup_datetime), 'HH:mm')}
            </p>
          </div>
        </div>

        {/* SLA Warning */}
        {lead.sla_breached && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 text-destructive">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">SLA Response Time Breached</span>
            </div>
            {lead.sla_response_deadline && (
              <p className="text-xs text-muted-foreground mt-1">
                Deadline was {format(new Date(lead.sla_response_deadline), 'MMM dd, HH:mm')}
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
