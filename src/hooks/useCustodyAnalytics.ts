import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from 'react-day-picker';

export interface CustodyMetrics {
  totalCustody: number;
  activeCustody: number;
  pendingApproval: number;
  closedCustody: number;
  voidedCustody: number;
  totalCost: number;
  averageDuration: number;
  slaCompliance: number;
  avgCostPerDay: number;
}

export interface CustodyTrend {
  date: string;
  custody: number;
  cost: number;
}

export interface CustodianStats {
  custodian: string;
  count: number;
  totalCost: number;
}

export interface ReasonStats {
  reason: string;
  count: number;
}

export const useCustodyAnalytics = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: ['custody-analytics', dateRange],
    queryFn: async () => {
      let query = supabase
        .from('custody_transactions')
        .select('*');

      if (dateRange?.from) {
        query = query.gte('created_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('created_at', dateRange.to.toISOString());
      }

      const { data: custodyTransactions, error } = await query;
      if (error) throw error;

      // Calculate metrics
      const total = custodyTransactions?.length || 0;
      const active = custodyTransactions?.filter(c => c.status === 'active').length || 0;
      const pending = custodyTransactions?.filter(c => c.status === 'pending_approval').length || 0;
      const closed = custodyTransactions?.filter(c => c.status === 'closed').length || 0;
      const voided = custodyTransactions?.filter(c => c.status === 'voided').length || 0;

      // Calculate total cost from charges (placeholder - would need to join with custody_charges)
      const totalCost = 0;

      // Calculate average duration for closed custody
      const closedWithDuration = custodyTransactions?.filter(c => 
        c.status === 'closed' && c.actual_return_date && c.effective_from
      ) || [];
      
      const averageDuration = closedWithDuration.length > 0
        ? closedWithDuration.reduce((sum, c) => {
            const start = new Date(c.effective_from).getTime();
            const end = new Date(c.actual_return_date!).getTime();
            const days = (end - start) / (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / closedWithDuration.length
        : 0;

      // Calculate SLA compliance
      const activeAndClosed = custodyTransactions?.filter(c => 
        c.status === 'active' || c.status === 'closed'
      ) || [];
      
      const slaCompliant = activeAndClosed.filter(c => {
        if (!c.expected_return_date) return true;
        const expectedEnd = new Date(c.expected_return_date);
        const actualEnd = c.actual_return_date ? new Date(c.actual_return_date) : new Date();
        return actualEnd <= expectedEnd;
      }).length;
      
      const slaCompliance = activeAndClosed.length > 0 
        ? (slaCompliant / activeAndClosed.length) * 100 
        : 0;

      const avgCostPerDay = 0; // Would need to calculate from custody_charges

      const metrics: CustodyMetrics = {
        totalCustody: total,
        activeCustody: active,
        pendingApproval: pending,
        closedCustody: closed,
        voidedCustody: voided,
        totalCost,
        averageDuration,
        slaCompliance,
        avgCostPerDay
      };

      // Calculate daily trends
      const trends = custodyTransactions?.reduce((acc, c) => {
        const date = new Date(c.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        if (!acc[date]) {
          acc[date] = { date, custody: 0, cost: 0 };
        }
        acc[date].custody += 1;
        // Cost calculation would require joining with custody_charges
        return acc;
      }, {} as Record<string, CustodyTrend>) || {};

      const trendData = Object.values(trends).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Calculate custodian stats
      const custodianStats = custodyTransactions?.reduce((acc, c) => {
        const custodian = c.custodian_name || 'Unknown';
        if (!acc[custodian]) {
          acc[custodian] = { custodian, count: 0, totalCost: 0 };
        }
        acc[custodian].count += 1;
        // Cost calculation would require joining with custody_charges
        return acc;
      }, {} as Record<string, CustodianStats>) || {};

      const custodianData = Object.values(custodianStats)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Status distribution
      const statusDistribution = custodyTransactions?.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Custodian type distribution
      const custodianTypeDistribution = custodyTransactions?.reduce((acc, c) => {
        const type = c.custodian_type || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Reason distribution
      const reasonStats = custodyTransactions?.reduce((acc, c) => {
        const reason = c.reason_code || 'Not specified';
        if (!acc[reason]) {
          acc[reason] = { reason, count: 0 };
        }
        acc[reason].count += 1;
        return acc;
      }, {} as Record<string, ReasonStats>) || {};

      const reasonData = Object.values(reasonStats)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        metrics,
        trends: trendData,
        custodianStats: custodianData,
        statusDistribution,
        custodianTypeDistribution,
        reasonStats: reasonData,
        rawData: custodyTransactions
      };
    },
  });
};
