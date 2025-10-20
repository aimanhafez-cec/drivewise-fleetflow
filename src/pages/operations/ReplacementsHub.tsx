import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, AlertCircle, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { useReplacementStats } from '@/hooks/useReplacements';
import ReplacementsList from './components/ReplacementsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ReplacementsHub: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useReplacementStats();

  const kpis = [
    {
      title: 'Active Replacements',
      value: stats?.active_custodies || 0,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pending Approval',
      value: stats?.pending_approvals || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'SLA Breaches',
      value: stats?.sla_breaches || 0,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Closed (30 days)',
      value: stats?.closed_this_period || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicle Replacements</h1>
          <p className="text-muted-foreground mt-2">
            Manage temporary and permanent vehicle replacements
          </p>
        </div>
        <Button onClick={() => navigate('/operations/replacements/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Replacement
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold mt-1">
                    {statsLoading ? '...' : kpi.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${kpi.bgColor}`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Summary */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Avg Duration</p>
                <p className="text-xl font-semibold mt-1">
                  {stats.avg_duration_days.toFixed(1)} days
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">SLA Compliance</p>
                <p className="text-xl font-semibold mt-1">
                  {stats.sla_compliance_pct.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Closed</p>
                <p className="text-xl font-semibold mt-1">
                  {stats.closed_this_period}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Replacements List with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Replacement Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending Approval</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="sla_breach">SLA Breach</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <ReplacementsList />
            </TabsContent>
            
            <TabsContent value="pending" className="mt-4">
              <ReplacementsList filters={{ status: ['pending_approval'] }} />
            </TabsContent>
            
            <TabsContent value="active" className="mt-4">
              <ReplacementsList filters={{ status: ['approved', 'active'] }} />
            </TabsContent>
            
            <TabsContent value="sla_breach" className="mt-4">
              <ReplacementsList filters={{ sla_breached: true }} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReplacementsHub;
