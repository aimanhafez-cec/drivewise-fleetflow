import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Car, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useVinAssignmentStats } from '@/hooks/useCorporateVinAssignment';
import VehicleLinesTable from '@/components/corporate-leasing/VehicleLinesTable';
import VinAssignmentDialog from '@/components/corporate-leasing/VinAssignmentDialog';
import { VehicleLine } from '@/lib/api/corporateVinAssignment';

const VinAssignment: React.FC = () => {
  const [selectedLine, setSelectedLine] = useState<VehicleLine | null>(null);
  const [dialogMode, setDialogMode] = useState<'assign' | 'view'>('assign');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useVinAssignmentStats();

  const handleAssignClick = (line: VehicleLine) => {
    setSelectedLine(line);
    setDialogMode('assign');
    setDialogOpen(true);
  };

  const handleViewClick = (line: VehicleLine) => {
    setSelectedLine(line);
    setDialogMode('view');
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agreement/Contract VIN Assignment</h1>
        <p className="text-muted-foreground mt-2">
          Assign specific vehicles (VINs) to corporate leasing agreements
        </p>
      </div>

      {/* Dashboard KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Awaiting VIN Assignment</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.awaitingCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">Lines pending assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIN Assigned</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.assignedCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">Lines with VIN assigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicle Lines</CardTitle>
            <Car className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.totalLines || 0}
            </div>
            <p className="text-xs text-muted-foreground">From signed agreements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignment Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {statsLoading ? '...' : `${stats?.progressPercent || 0}%`}
            </div>
            <Progress value={stats?.progressPercent || 0} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Lines Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Lines</CardTitle>
          <CardDescription>Manage VIN assignments for all contract lines</CardDescription>
        </CardHeader>
        <CardContent>
          <VehicleLinesTable
            onAssignClick={handleAssignClick}
            onViewClick={handleViewClick}
          />
        </CardContent>
      </Card>

      {/* VIN Assignment Dialog */}
      <VinAssignmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        line={selectedLine}
        mode={dialogMode}
      />
    </div>
  );
};

export default VinAssignment;
