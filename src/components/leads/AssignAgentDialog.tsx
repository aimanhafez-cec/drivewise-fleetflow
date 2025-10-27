import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Users, Zap, Brain, Scale } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AssignAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  onAssigned: () => void;
}

type AssignmentMethod = 'round_robin' | 'skill_based' | 'load_balanced' | 'manual';

export const AssignAgentDialog = ({ open, onOpenChange, leadId, onAssigned }: AssignAgentDialogProps) => {
  const [method, setMethod] = useState<AssignmentMethod>('round_robin');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const assignmentMethods = [
    {
      id: 'round_robin' as AssignmentMethod,
      name: 'Round Robin',
      description: 'Distribute leads evenly among available agents',
      icon: Zap,
    },
    {
      id: 'skill_based' as AssignmentMethod,
      name: 'Skill-Based Routing',
      description: 'Match based on language, region, and vehicle expertise',
      icon: Brain,
    },
    {
      id: 'load_balanced' as AssignmentMethod,
      name: 'Load Balanced',
      description: 'Assign to agent with lowest current workload',
      icon: Scale,
    },
  ];

  const handleAssign = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('assign_lead_round_robin', {
        p_lead_id: leadId,
      });

      if (error) throw error;

      toast({
        title: 'Agent Assigned',
        description: 'Lead has been successfully assigned to an agent',
      });

      onAssigned();
      onOpenChange(false);
    } catch (error) {
      console.error('Error assigning agent:', error);
      toast({
        title: 'Assignment Failed',
        description: error instanceof Error ? error.message : 'Failed to assign agent to lead',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assign Agent to Lead
          </DialogTitle>
          <DialogDescription>
            Choose an assignment method to automatically assign this lead to the most appropriate agent
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={method} onValueChange={(value) => setMethod(value as AssignmentMethod)}>
            {assignmentMethods.map((methodOption) => {
              const Icon = methodOption.icon;
              return (
                <div
                  key={methodOption.id}
                  className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    method === methodOption.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setMethod(methodOption.id)}
                >
                  <RadioGroupItem value={methodOption.id} id={methodOption.id} className="mt-1" />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor={methodOption.id}
                      className="text-base font-medium cursor-pointer flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {methodOption.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">{methodOption.description}</p>
                  </div>
                </div>
              );
            })}
          </RadioGroup>

          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> The system will find the most suitable available agent based on current
              workload, skills, and availability status.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={loading}>
            {loading ? 'Assigning...' : 'Assign Agent'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
