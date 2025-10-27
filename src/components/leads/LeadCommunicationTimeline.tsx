import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Mail, Phone, MessageCircle, User, Clock } from 'lucide-react';
import { Lead } from '@/hooks/useLeadsRealtime';
import { formatDistanceToNow, format } from 'date-fns';

interface LeadCommunicationTimelineProps {
  lead: Lead;
}

interface Communication {
  id: string;
  type: 'email' | 'sms' | 'whatsapp' | 'call' | 'note' | 'status_change';
  direction: 'inbound' | 'outbound' | 'system';
  subject?: string;
  content: string;
  timestamp: string;
  user?: string;
}

// Mock communication history
const generateMockCommunications = (lead: Lead): Communication[] => {
  const communications: Communication[] = [
    {
      id: '1',
      type: 'status_change',
      direction: 'system',
      content: `Lead created from ${lead.source_name}`,
      timestamp: lead.created_at,
    },
  ];

  if (lead.responded_at) {
    communications.push({
      id: '2',
      type: 'email',
      direction: 'outbound',
      subject: 'Your Rental Inquiry',
      content: 'Thank you for your interest. We have received your inquiry and will respond shortly.',
      timestamp: lead.responded_at,
      user: lead.assigned_to || 'System',
    });
  }

  if (lead.status === 'contacted') {
    communications.push({
      id: '3',
      type: 'call',
      direction: 'outbound',
      content: 'Called customer to discuss rental requirements and pricing options.',
      timestamp: lead.updated_at,
      user: lead.assigned_to || 'Agent',
    });
  }

  if (lead.status === 'quoted') {
    communications.push({
      id: '4',
      type: 'email',
      direction: 'outbound',
      subject: 'Your Custom Quote',
      content: `Sent detailed quote for ${lead.vehicle_category}. Quote expires in 48 hours.`,
      timestamp: lead.updated_at,
      user: lead.assigned_to || 'Agent',
    });
  }

  if (lead.status === 'confirmed') {
    communications.push({
      id: '5',
      type: 'whatsapp',
      direction: 'outbound',
      content: 'Booking confirmation sent with agreement number and pickup instructions.',
      timestamp: lead.updated_at,
      user: lead.assigned_to || 'Agent',
    });
  }

  return communications.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

const getIcon = (type: Communication['type']) => {
  switch (type) {
    case 'email': return Mail;
    case 'sms': return MessageSquare;
    case 'whatsapp': return MessageCircle;
    case 'call': return Phone;
    case 'note': return MessageSquare;
    case 'status_change': return Clock;
  }
};

const getTypeColor = (type: Communication['type']) => {
  switch (type) {
    case 'email': return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
    case 'sms': return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300';
    case 'whatsapp': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
    case 'call': return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300';
    case 'note': return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
    case 'status_change': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  }
};

export const LeadCommunicationTimeline = ({ lead }: LeadCommunicationTimelineProps) => {
  const communications = generateMockCommunications(lead);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Communication Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {communications.map((comm, index) => {
            const Icon = getIcon(comm.type);
            const isLast = index === communications.length - 1;

            return (
              <div key={comm.id} className="relative">
                {!isLast && (
                  <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-border" />
                )}
                
                <div className="flex gap-3">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${getTypeColor(comm.type)}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        {comm.subject && (
                          <p className="font-medium text-sm">{comm.subject}</p>
                        )}
                        <p className="text-sm text-muted-foreground">{comm.content}</p>
                      </div>
                      
                      <Badge variant="outline" className="text-xs">
                        {comm.type.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(comm.timestamp), { addSuffix: true })}
                      </span>
                      
                      {comm.user && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {comm.user}
                        </span>
                      )}
                      
                      <span className="text-xs">
                        {format(new Date(comm.timestamp), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
