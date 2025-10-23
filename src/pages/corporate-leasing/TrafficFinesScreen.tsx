import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, Filter, Download, BarChart3 } from 'lucide-react';
import { TrafficFineKPIs } from '@/components/traffic-fines/TrafficFineKPIs';
import { TrafficFineFilterPanel } from '@/components/traffic-fines/TrafficFineFilterPanel';
import { QuickFilterBar } from '@/components/traffic-fines/QuickFilterBar';
import { IntegrationView } from '@/components/traffic-fines/IntegrationView';
import { ContractView } from '@/components/traffic-fines/ContractView';
import { ViewToggle } from '@/components/traffic-fines/ViewToggle';
import { FineDetailsPanel } from '@/components/traffic-fines/FineDetailsPanel';
import { ScheduleIntegrationModal } from '@/components/traffic-fines/ScheduleIntegrationModal';
import { useSimulateIntegration } from '@/hooks/useTrafficFinesCorporate';
import type { TrafficFineFilters } from '@/lib/api/trafficFinesCorporate';
import { toast } from 'sonner';

export default function TrafficFinesScreen() {
  const [currentView, setCurrentView] = useState<'integration' | 'contract'>('integration');
  const [filters, setFilters] = useState<TrafficFineFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showKPIs, setShowKPIs] = useState(true);
  const [selectedFineId, setSelectedFineId] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const simulateIntegration = useSimulateIntegration();

  const handleRunIntegration = () => {
    simulateIntegration.mutate();
  };

  const handleExport = () => {
    toast.success('Export feature - Coming soon');
  };

  // Count active filters
  const activeFilterCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof TrafficFineFilters];
    return value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true);
  }).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Traffic Fines - Corporate Fleet Monitoring</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and reconcile traffic fines from UAE authorities
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRunIntegration}
            disabled={simulateIntegration.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${simulateIntegration.isPending ? 'animate-spin' : ''}`} />
            Run Integration
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowScheduleModal(true)}
          >
            <Clock className="h-4 w-4 mr-2" />
            Schedule Integration
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowKPIs(!showKPIs)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {showKPIs ? 'Hide' : 'Show'} Summary
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 text-xs font-bold">({activeFilterCount})</span>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {showKPIs && (
        <TrafficFineKPIs filters={filters} />
      )}

      {/* Quick Filter Bar */}
      <QuickFilterBar 
        filters={filters} 
        onFiltersChange={setFilters}
      />

      {/* Filters */}
      {showFilters && (
        <TrafficFineFilterPanel 
          filters={filters} 
          onFiltersChange={setFilters}
        />
      )}

      {/* View Toggle */}
      <ViewToggle
        currentView={currentView} 
        onViewChange={setCurrentView}
      />

      {/* Data Views */}
      {currentView === 'integration' ? (
        <IntegrationView 
          filters={filters}
          onSelectFine={setSelectedFineId}
        />
      ) : (
        <ContractView 
          filters={filters}
          onSelectFine={setSelectedFineId}
        />
      )}

      {/* Side Panel */}
      {selectedFineId && (
        <FineDetailsPanel 
          fineId={selectedFineId}
          onClose={() => setSelectedFineId(null)}
        />
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <ScheduleIntegrationModal 
          open={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
        />
      )}
    </div>
  );
}
