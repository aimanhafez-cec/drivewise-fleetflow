import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react';
import { useDriverAssignmentStats } from '@/hooks/useCorporateDriverAssignment';
import { DriverLinesTable } from '@/components/corporate-leasing/DriverLinesTable';
import { DriverAssignmentDialog } from '@/components/corporate-leasing/DriverAssignmentDialog';
import type { DriverLine } from '@/lib/api/corporateDriverAssignment';
import { Progress } from '@/components/ui/progress';

const DriversAssignment: React.FC = () => {
  const [selectedLine, setSelectedLine] = useState<DriverLine | null>(null);
  const [dialogMode, setDialogMode] = useState<'assign' | 'manage'>('assign');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useDriverAssignmentStats();

  const handleAssignClick = (line: DriverLine) => {
    setSelectedLine(line);
    setDialogMode('assign');
    setDialogOpen(true);
  };

  const handleManageClick = (line: DriverLine) => {
    setSelectedLine(line);
    setDialogMode('manage');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedLine(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Corporate Drivers Assignment</h1>
        <p className="text-muted-foreground mt-2">
          Manage authorized drivers for corporate leasing agreements
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Lines */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicle Lines</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalLines || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  From signed agreements
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Assigned Lines */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lines with Drivers</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">{stats?.assignedLines || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Drivers assigned
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Unassigned Lines */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lines Without Drivers</CardTitle>
            <UserX className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold text-orange-600">{stats?.unassignedLines || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Awaiting assignment
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignment Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold text-purple-600">
                  {stats?.assignmentProgress || 0}%
                </div>
                <Progress value={stats?.assignmentProgress || 0} className="mt-2" />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Driver Lines Table */}
      <DriverLinesTable
        onAssignClick={handleAssignClick}
        onManageClick={handleManageClick}
      />

      {/* Driver Assignment Dialog */}
      {selectedLine && (
        <DriverAssignmentDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          line={selectedLine}
          mode={dialogMode}
        />
      )}
    </div>
  );
};

export default DriversAssignment;
