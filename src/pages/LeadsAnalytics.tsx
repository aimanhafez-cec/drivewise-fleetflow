import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Clock, DollarSign, Users, Target, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface LeadStatistics {
  total_leads: number;
  new_leads: number;
  contacted_leads: number;
  quoted_leads: number;
  confirmed_leads: number;
  rejected_leads: number;
  expired_leads: number;
  sla_breached_count: number;
  conversion_rate: number;
  avg_response_time_minutes: number;
  total_revenue: number;
  potential_revenue: number;
}

const LeadsAnalytics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<LeadStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const { data, error } = await supabase.rpc('get_lead_statistics');
      
      if (error) throw error;
      setStats(data as unknown as LeadStatistics);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading analytics...</div>
      </div>
    );
  }

  const conversionFunnelData = [
    { name: 'New Leads', value: stats.new_leads, fill: '#3b82f6' },
    { name: 'Contacted', value: stats.contacted_leads, fill: '#8b5cf6' },
    { name: 'Quoted', value: stats.quoted_leads, fill: '#f59e0b' },
    { name: 'Confirmed', value: stats.confirmed_leads, fill: '#10b981' },
  ];

  const statusDistributionData = [
    { name: 'New', value: stats.new_leads, fill: '#3b82f6' },
    { name: 'Contacted', value: stats.contacted_leads, fill: '#8b5cf6' },
    { name: 'Quoted', value: stats.quoted_leads, fill: '#f59e0b' },
    { name: 'Confirmed', value: stats.confirmed_leads, fill: '#10b981' },
    { name: 'Rejected', value: stats.rejected_leads, fill: '#ef4444' },
    { name: 'Expired', value: stats.expired_leads, fill: '#6b7280' },
  ];

  const revenueData = [
    { name: 'Total Revenue', value: stats.total_revenue },
    { name: 'Potential Revenue', value: stats.potential_revenue },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/leads-intake')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Leads Analytics & Reporting</h1>
          <p className="text-muted-foreground">Performance insights and conversion metrics</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_leads}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversion_rate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.confirmed_leads} of {stats.total_leads} converted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.avg_response_time_minutes)} min</div>
            <p className="text-xs text-muted-foreground">From lead creation to first contact</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {stats.total_revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From confirmed leads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">SLA Performance</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total_leads > 0
                ? Math.round(((stats.total_leads - stats.sla_breached_count) / stats.total_leads) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">{stats.sla_breached_count} breaches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Potential Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {stats.potential_revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All leads combined value</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={conversionFunnelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `AED ${value.toLocaleString()}`} />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pending Leads</span>
                <span className="font-medium">
                  {stats.new_leads + stats.contacted_leads + stats.quoted_leads}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Conversion Rate</span>
                <span className="font-medium text-green-600">{stats.conversion_rate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rejection Rate</span>
                <span className="font-medium text-red-600">
                  {stats.total_leads > 0
                    ? ((stats.rejected_leads / stats.total_leads) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SLA Compliance</span>
                <span className="font-medium">
                  {stats.total_leads > 0
                    ? Math.round(((stats.total_leads - stats.sla_breached_count) / stats.total_leads) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeadsAnalytics;
