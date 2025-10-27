import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { Lead } from '@/hooks/useLeadsRealtime';

interface LeadStatsProps {
  leads: Lead[];
}

export const LeadStats = ({ leads }: LeadStatsProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayLeads = leads.filter(lead => {
    const leadDate = new Date(lead.created_at);
    leadDate.setHours(0, 0, 0, 0);
    return leadDate.getTime() === today.getTime();
  });

  const pendingLeads = leads.filter(lead => 
    lead.status === 'new' || lead.status === 'contacted' || lead.status === 'quoted'
  );

  const confirmedToday = todayLeads.filter(lead => lead.status === 'confirmed');
  
  const totalLeads = leads.length;
  const confirmedLeads = leads.filter(lead => lead.status === 'confirmed').length;
  const conversionRate = totalLeads > 0 ? ((confirmedLeads / totalLeads) * 100).toFixed(1) : '0.0';

  const stats = [
    {
      title: 'Total Leads Today',
      value: todayLeads.length,
      change: '+12%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Pending Confirmation',
      value: pendingLeads.length,
      change: 'Needs attention',
      trend: 'neutral',
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400'
    },
    {
      title: 'Confirmed Today',
      value: confirmedToday.length,
      change: '+8%',
      trend: 'up',
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Conversion Rate',
      value: `${conversionRate}%`,
      change: '+2.3%',
      trend: 'up',
      icon: ArrowUp,
      color: 'text-purple-600 dark:text-purple-400'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">
                    {stat.value}
                  </p>
                  <p className={`text-xs flex items-center gap-1 ${
                    stat.trend === 'up' ? 'text-green-600' : 
                    stat.trend === 'down' ? 'text-red-600' : 
                    'text-muted-foreground'
                  }`}>
                    {stat.trend === 'up' && <ArrowUp className="h-3 w-3" />}
                    {stat.trend === 'down' && <ArrowDown className="h-3 w-3" />}
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
