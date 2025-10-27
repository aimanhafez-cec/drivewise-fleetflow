import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  MessageSquare,
  Plus,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Lead } from '@/hooks/useLeadsRealtime';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';

interface LeadNotesTimelineProps {
  lead: Lead;
}

interface TimelineItem {
  id: string;
  type: 'note' | 'status_change' | 'contact' | 'system';
  icon: any;
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  color: string;
}

export const LeadNotesTimeline = ({ lead }: LeadNotesTimelineProps) => {
  const { toast } = useToast();
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Generate timeline from lead data
  const generateTimeline = (): TimelineItem[] => {
    const items: TimelineItem[] = [];

    // Lead created
    items.push({
      id: '1',
      type: 'system',
      icon: AlertCircle,
      title: 'Lead Created',
      description: `New lead received from ${lead.source_name}`,
      timestamp: lead.created_at,
      color: 'text-blue-600 dark:text-blue-400',
    });

    // First response
    if (lead.responded_at) {
      items.push({
        id: '2',
        type: 'contact',
        icon: Mail,
        title: 'Initial Response Sent',
        description: 'Customer contacted with initial information',
        timestamp: lead.responded_at,
        user: lead.assigned_to || 'System',
        color: 'text-purple-600 dark:text-purple-400',
      });
    }

    // Status changes
    if (lead.status === 'contacted' || lead.status === 'quoted' || lead.status === 'confirmed') {
      items.push({
        id: '3',
        type: 'status_change',
        icon: CheckCircle2,
        title: `Status Changed to ${lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}`,
        description: `Lead progressed to ${lead.status} stage`,
        timestamp: lead.updated_at,
        user: lead.assigned_to || 'System',
        color: 'text-green-600 dark:text-green-400',
      });
    }

    // Assignment
    if (lead.assigned_to && lead.assigned_at) {
      items.push({
        id: '4',
        type: 'system',
        icon: User,
        title: 'Lead Assigned',
        description: `Assigned to ${lead.assigned_to}`,
        timestamp: lead.assigned_at,
        color: 'text-amber-600 dark:text-amber-400',
      });
    }

    return items.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const timeline = generateTimeline();

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a note',
        variant: 'destructive',
      });
      return;
    }

    setIsAddingNote(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Note Added',
        description: 'Your note has been saved to the lead timeline',
      });
      setNewNote('');
      setIsAddingNote(false);
    }, 500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Note Section */}
        <div className="space-y-2">
          <Textarea
            placeholder="Add a note or comment about this lead..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="min-h-[80px]"
          />
          <Button
            onClick={handleAddNote}
            disabled={isAddingNote || !newNote.trim()}
            size="sm"
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            {isAddingNote ? 'Adding Note...' : 'Add Note'}
          </Button>
        </div>

        <Separator />

        {/* Timeline */}
        <div className="space-y-4">
          {timeline.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="relative">
                {/* Timeline line */}
                {index < timeline.length - 1 && (
                  <div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-border" />
                )}

                {/* Timeline item */}
                <div className="flex gap-3">
                  <div className={`p-2 rounded-full bg-muted ${item.color} shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {item.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</span>
                      {item.user && (
                        <>
                          <span>•</span>
                          <span>{item.user}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {timeline.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No activity yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
