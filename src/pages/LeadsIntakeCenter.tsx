import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { LeadStats } from '@/components/leads/LeadStats';
import { LeadFilters, LeadFiltersState } from '@/components/leads/LeadFilters';
import { LeadDataTable } from '@/components/leads/LeadDataTable';
import { mockLeads, Lead } from '@/data/mockLeads';
import { leadSources } from '@/data/leadSources';

const LeadsIntakeCenter = () => {
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
    // TODO: Implement refresh logic
    console.log('Refreshing data...');
  };

  const filteredLeads = mockLeads.filter((lead) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        lead.lead_no.toLowerCase().includes(searchLower) ||
        lead.customer_name.toLowerCase().includes(searchLower) ||
        lead.customer_email.toLowerCase().includes(searchLower) ||
        lead.customer_phone.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Source type filter
    if (filters.sourceType !== 'all') {
      const source = leadSources[lead.source_id];
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leads Intake Center</h1>
            <p className="text-muted-foreground">
              Centralized inquiry management from all channels
            </p>
          </div>
          <Button onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export to Excel
          </Button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <LeadStats leads={mockLeads} />

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
          <span className="font-medium">{mockLeads.length}</span> leads
        </p>
      </div>

      {/* Data Table */}
      <LeadDataTable leads={filteredLeads} />
    </div>
  );
};

export default LeadsIntakeCenter;
