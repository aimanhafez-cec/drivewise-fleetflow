import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Calendar, Filter, FileDown, Plus } from "lucide-react";
import { TollTransactionKPIs } from "@/components/toll-transactions/TollTransactionKPIs";
import { QuickFilterBar } from "@/components/toll-transactions/QuickFilterBar";
import { TollFilterPanel } from "@/components/toll-transactions/TollFilterPanel";
import { ViewToggle } from "@/components/toll-transactions/ViewToggle";
import { IntegrationView } from "@/components/toll-transactions/IntegrationView";
import { ContractView } from "@/components/toll-transactions/ContractView";
import { TransactionDetailsPanel } from "@/components/toll-transactions/TransactionDetailsPanel";
import { ScheduleIntegrationModal } from "@/components/toll-transactions/ScheduleIntegrationModal";
import {
  useTollTransactionsCorporate,
  useTollTransactionsStatistics,
  useSimulateTollIntegration,
} from "@/hooks/useTollTransactionsCorporate";
import { TollTransactionCorporateRecord } from "@/lib/api/tollTransactionsCorporate";
import { toast } from "sonner";

export default function TollTransactionsScreen() {
  const [currentView, setCurrentView] = useState<"integration" | "contract">("integration");
  const [showFilters, setShowFilters] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [selectedTransaction, setSelectedTransaction] = useState<TollTransactionCorporateRecord | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Fetch data
  const { data: transactions, isLoading } = useTollTransactionsCorporate(filters);
  const { data: statistics, isLoading: statsLoading } = useTollTransactionsStatistics(filters);
  const { mutate: runIntegration, isPending: isRunningIntegration } = useSimulateTollIntegration();

  const handleRunIntegration = () => {
    runIntegration();
  };

  const handleExport = () => {
    toast.info("Export functionality coming soon");
  };

  const handleRowClick = (transaction: TollTransactionCorporateRecord) => {
    setSelectedTransaction(transaction);
  };

  const activeFilterCount = Object.keys(filters).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-t-4 border-t-cyan-500 bg-gradient-to-br from-cyan-50/30 to-blue-50/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Toll Transactions
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor and reconcile toll crossings from Salik and Darb systems
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleRunIntegration}
              disabled={isRunningIntegration}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRunningIntegration ? "animate-spin" : ""}`} />
              Run Integration
            </Button>
            <Button variant="outline" onClick={() => setShowScheduleModal(true)}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            <Button
              variant={showSummary ? "default" : "outline"}
              onClick={() => setShowSummary(!showSummary)}
            >
              {showSummary ? "Hide" : "Show"} Summary
            </Button>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 bg-cyan-600">{activeFilterCount}</Badge>
              )}
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* KPIs */}
      {showSummary && (
        <TollTransactionKPIs statistics={statistics} isLoading={statsLoading} />
      )}

      {/* Quick Filters */}
      <QuickFilterBar onFilterChange={setFilters} activeFilters={filters} />

      {/* Advanced Filters */}
      {showFilters && (
        <TollFilterPanel
          filters={filters}
          onFilterChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* View Toggle & Data Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
          
          <div className="text-sm text-muted-foreground">
            {transactions?.length || 0} transactions found
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-cyan-600" />
            <span className="ml-2 text-muted-foreground">Loading transactions...</span>
          </div>
        ) : currentView === "integration" ? (
          <IntegrationView data={transactions || []} onRowClick={handleRowClick} />
        ) : (
          <ContractView data={transactions || []} onRowClick={handleRowClick} />
        )}
      </Card>

      {/* Transaction Details Panel */}
      <TransactionDetailsPanel
        transaction={selectedTransaction}
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />

      {/* Schedule Integration Modal */}
      <ScheduleIntegrationModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />
    </div>
  );
}
