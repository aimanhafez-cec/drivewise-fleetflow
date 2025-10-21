import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  FileText, 
  Zap, 
  AlertCircle, 
  Download,
  RefreshCw,
  Calendar,
  Sparkles
} from 'lucide-react';

export const AgreementQuickActions: React.FC = () => {
  const navigate = useNavigate();

  // Fetch reservations ready for conversion
  const { data: readyReservations } = useQuery({
    queryKey: ['reservations:ready-for-conversion'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('id, reservation_no, customer_id, start_datetime, profiles!inner(full_name)')
        .eq('status', 'confirmed')
        .is('converted_agreement_id', null)
        .order('start_datetime', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  // Fetch overdue agreements
  const { data: overdueAgreements } = useQuery({
    queryKey: ['agreements:overdue'],
    queryFn: async () => {
      const today = new Date().toISOString();
      const { data, error } = await supabase
        .from('agreements')
        .select('id, agreement_no, profiles!inner(full_name)')
        .eq('status', 'active')
        .lt('return_datetime', today)
        .order('return_datetime', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const quickActions = [
    {
      title: 'Enhanced Wizard',
      description: '9-step wizard with inspection & verification',
      icon: Sparkles,
      variant: 'default' as const,
      onClick: () => navigate('/agreements/new-enhanced'),
    },
    {
      title: 'Quick Agreement',
      description: 'Simple wizard for basic agreements',
      icon: Plus,
      variant: 'outline' as const,
      onClick: () => navigate('/agreements/new'),
    },
    {
      title: 'Convert Reservation',
      description: `${readyReservations?.length || 0} reservations ready`,
      icon: FileText,
      variant: 'outline' as const,
      onClick: () => navigate('/reservations?filter=confirmed'),
      badge: readyReservations?.length || 0,
    },
    {
      title: 'Convert Instant Booking',
      description: 'Process paid instant bookings',
      icon: Zap,
      variant: 'outline' as const,
      onClick: () => navigate('/instant-booking'),
    },
    {
      title: 'Overdue Follow-ups',
      description: `${overdueAgreements?.length || 0} agreements overdue`,
      icon: AlertCircle,
      variant: overdueAgreements && overdueAgreements.length > 0 ? 'destructive' as const : 'outline' as const,
      onClick: () => navigate('/agreements?filter=overdue'),
      badge: overdueAgreements?.length || 0,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {quickActions.map((action) => {
        const Icon = action.icon;
        return (
          <Card 
            key={action.title}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={action.onClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium">
                  {action.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {action.description}
                </CardDescription>
              </div>
              {action.badge !== undefined && action.badge > 0 && (
                <Badge variant={action.variant === 'destructive' ? 'destructive' : 'secondary'}>
                  {action.badge}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <Button 
                variant={action.variant}
                size="sm" 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
              >
                <Icon className="mr-2 h-4 w-4" />
                {action.title}
              </Button>
            </CardContent>
          </Card>
        );
      })}

      {/* Export Reports Card */}
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">
              Export Reports
            </CardTitle>
            <CardDescription className="text-xs">
              Download agreements data
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
