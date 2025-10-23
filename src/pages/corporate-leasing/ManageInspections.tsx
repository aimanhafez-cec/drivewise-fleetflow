import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { InspectionDashboardCards } from '@/components/inspection/InspectionDashboardCards';
import { InspectionSearchFilters } from '@/components/inspection/InspectionSearchFilters';
import { InspectionDataTable } from '@/components/inspection/InspectionDataTable';
import { useInspectionDashboard, useInspectionSearch, useDeleteInspection } from '@/hooks/useInspectionMaster';
import { toast } from 'sonner';

export default function ManageInspections() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: dashboardStats, isLoading: statsLoading } = useInspectionDashboard();
  const { data: searchResults, isLoading: searchLoading } = useInspectionSearch({
    q: searchQuery,
    type: selectedType === 'all' ? undefined : selectedType,
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    page: currentPage,
    pageSize: 20
  });

  const deleteMutation = useDeleteInspection();

  const handleCardClick = (type: string) => {
    setSelectedType(type);
    setSelectedStatus('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedStatus('all');
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this inspection?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Inspections</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage vehicle inspections for check-out, check-in, periodic, and random inspections
          </p>
        </div>
        <Button onClick={() => navigate('/corporate-leasing-operations/manage-inspections/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Inspection
        </Button>
      </div>

      {statsLoading ? (
        <div className="text-center py-8">Loading dashboard...</div>
      ) : (
        dashboardStats && <InspectionDashboardCards stats={dashboardStats} onCardClick={handleCardClick} />
      )}

      <div className="bg-card rounded-lg border p-6 space-y-4">
        <InspectionSearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          onClearFilters={handleClearFilters}
        />

        {searchLoading ? (
          <div className="text-center py-8">Loading inspections...</div>
        ) : (
          searchResults?.data && (
            <InspectionDataTable
              inspections={searchResults.data as any}
              onView={(id) => navigate(`/corporate-leasing-operations/manage-inspections/${id}`)}
              onEdit={(id) => navigate(`/corporate-leasing-operations/manage-inspections/edit/${id}`)}
              onDelete={handleDelete}
            />
          )
        )}
      </div>
    </div>
  );
}
