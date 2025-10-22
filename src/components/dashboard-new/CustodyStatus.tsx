import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Car,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CustodyStats {
  activeTransactions: number;
  pendingApprovals: number;
  slaComplianceRate: number;
  avgCustodyDuration: number;
  slaBreaches: number;
}

export function CustodyStatus() {
  const navigate = useNavigate();

  const { data: custodyStats, isLoading } = useQuery({
    queryKey: ['custody-stats'],
    queryFn: async (): Promise<CustodyStats> => {
      // Fetch custody transactions
      const { data: transactions } = await supabase
        .from('custody_transactions')
        .select('status, sla_breached, effective_from, actual_return_date, sla_target_approve_by');

      const activeTransactions = transactions?.filter(t => 
        t.status === 'active'
      ).length || 0;

      const pendingApprovals = transactions?.filter(t => 
        t.status === 'pending_approval'
      ).length || 0;

      const slaBreaches = transactions?.filter(t => 
        t.sla_breached === true
      ).length || 0;

      // Calculate SLA compliance rate
      const totalWithSLA = transactions?.filter(t => 
        t.sla_target_approve_by !== null
      ).length || 0;

      const slaCompliant = totalWithSLA - slaBreaches;
      const slaComplianceRate = totalWithSLA > 0 
        ? (slaCompliant / totalWithSLA) * 100 
        : 100;

      // Calculate average custody duration
      const completedTransactions = transactions?.filter(t => 
        t.status === 'closed' && t.effective_from && t.actual_return_date
      ) || [];

      const avgDuration = completedTransactions.length > 0
        ? completedTransactions.reduce((sum, t) => {
            const start = new Date(t.effective_from);
            const end = new Date(t.actual_return_date!);
            const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / completedTransactions.length
        : 0;

      return {
        activeTransactions,
        pendingApprovals,
        slaComplianceRate,
        avgCustodyDuration: avgDuration,
        slaBreaches
      };
    },
    staleTime: 2 * 60 * 1000 // 2 minutes
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </Card>
    );
  }

  if (!custodyStats) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <p>Unable to load custody data</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Car className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Custody Status</h3>
            <p className="text-sm text-muted-foreground">Replacement vehicles</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/operations/custody')}
        >
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Car className="h-4 w-4 text-blue-600" />
            <span className="text-xs text-muted-foreground">Active</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {custodyStats.activeTransactions}
          </p>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <span className="text-xs text-muted-foreground">Pending</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">
            {custodyStats.pendingApprovals}
          </p>
        </div>
      </div>

      {/* SLA Compliance */}
      <div className="mb-6 p-4 border rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <h4 className="font-semibold text-sm text-foreground">SLA Compliance Rate</h4>
              <p className="text-xs text-muted-foreground">Service level performance</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-foreground">
            {custodyStats.slaComplianceRate.toFixed(1)}%
          </span>
        </div>
        <Progress 
          value={custodyStats.slaComplianceRate} 
          className="h-2 mb-2"
        />
        {custodyStats.slaBreaches > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-xs text-muted-foreground">
              {custodyStats.slaBreaches} SLA breach{custodyStats.slaBreaches !== 1 ? 'es' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Average Duration */}
      <div className="p-4 border rounded-lg mb-6">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <h4 className="font-semibold text-sm text-foreground">Avg Custody Duration</h4>
              <p className="text-xs text-muted-foreground">Days in custody</p>
            </div>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">
            {custodyStats.avgCustodyDuration.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground">days</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        {custodyStats.pendingApprovals > 0 && (
          <Button 
            className="w-full justify-between"
            variant="outline"
            onClick={() => navigate('/operations/custody?status=pending_approval')}
          >
            <span>Review Pending Approvals</span>
            <Badge variant="secondary">{custodyStats.pendingApprovals}</Badge>
          </Button>
        )}
        <Button 
          className="w-full justify-between"
          variant="outline"
          onClick={() => navigate('/operations/custody?status=active')}
        >
          <span>Active Custody Transactions</span>
          <Badge variant="secondary">{custodyStats.activeTransactions}</Badge>
        </Button>
        <Button 
          className="w-full"
          onClick={() => navigate('/operations/custody/new')}
        >
          New Custody Request
        </Button>
      </div>
    </Card>
  );
}
