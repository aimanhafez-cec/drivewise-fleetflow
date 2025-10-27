import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, BarChart } from 'lucide-react';
import { LeadStats } from '@/components/leads/LeadStats';
import { LeadFilters, LeadFiltersState } from '@/components/leads/LeadFilters';
import { LeadDataTable } from '@/components/leads/LeadDataTable';
import { useLeadsRealtime } from '@/hooks/useLeadsRealtime';
import { leadSources } from '@/data/leadSources';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const LeadsIntakeCenter = () => {
  const navigate = useNavigate();
  const { leads, loading, newLeadCount, resetNewLeadCount, refetch } = useLeadsRealtime({
    autoRefresh: true,
    refreshInterval: 30000,
    enableNotifications: true,
    enableSoundAlerts: true,
  });
  
  const [filters, setFilters] = useState<LeadFiltersState>({
    search: '',
    sourceType: 'all',
    status: [],
    priority: 'all',
  });

  const handleReset = () => {
    setFilters({
      search: '',
      sourceType: 'all',
      status: [],
      priority: 'all',
    });
  };

  const handleRefresh = () => {
    refetch();
    resetNewLeadCount();
  };

  const filteredLeads = leads.filter((lead) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        lead.lead_no.toLowerCase().includes(searchLower) ||
        lead.customer_name.toLowerCase().includes(searchLower) ||
        (lead.customer_email && lead.customer_email.toLowerCase().includes(searchLower)) ||
        (lead.customer_phone && lead.customer_phone.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // Source type filter
    if (filters.sourceType !== 'all') {
      const source = leadSources[lead.source_name];
      if (source?.type !== filters.sourceType) return false;
    }

    // Status filter
    if (filters.status.length > 0) {
      if (!filters.status.includes(lead.status)) return false;
    }

    // Priority filter
    if (filters.priority !== 'all') {
      if (lead.priority !== filters.priority) return false;
    }

    return true;
  });

  const handleExport = () => {
    // TODO: Implement export to Excel logic
    console.log('Exporting to Excel...');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Leads Intake Center</h1>
              {newLeadCount > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  +{newLeadCount} New
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Centralized inquiry management from all channels
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/leads-intake/analytics')} variant="outline" className="gap-2">
              <BarChart className="h-4 w-4" />
              Analytics
            </Button>
            <Button onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <LeadStats leads={leads} />

      {/* Filters */}
      <LeadFilters
        filters={filters}
        onFiltersChange={setFilters}
        onReset={handleReset}
        onRefresh={handleRefresh}
      />

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{filteredLeads.length}</span> of{' '}
          <span className="font-medium">{leads.length}</span> leads
        </p>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading leads...</div>
      ) : (
        <LeadDataTable leads={filteredLeads} />
      )}
    </div>
  );
};

export default LeadsIntakeCenter;
