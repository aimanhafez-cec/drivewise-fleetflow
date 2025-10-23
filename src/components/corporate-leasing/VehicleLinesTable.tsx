import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Car, Eye } from 'lucide-react';
import { useVehicleLines } from '@/hooks/useCorporateVinAssignment';
import { VehicleLine } from '@/lib/api/corporateVinAssignment';
import { format } from 'date-fns';

interface VehicleLinesTableProps {
  onAssignClick: (line: VehicleLine) => void;
  onViewClick: (line: VehicleLine) => void;
}

const VehicleLinesTable: React.FC<VehicleLinesTableProps> = ({ onAssignClick, onViewClick }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'assigned' | 'not_assigned'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data, isLoading } = useVehicleLines({
    search: search || undefined,
    status: statusFilter,
    page,
    pageSize,
  });

  const lines = data?.lines || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as 'all' | 'assigned' | 'not_assigned');
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Agreement No., Contract No., VIN..."
            value={search}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Lines</SelectItem>
            <SelectItem value="not_assigned">Not Assigned</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          variant="default" 
          className="whitespace-nowrap"
          onClick={() => {
            // Placeholder - will do nothing for now
            console.log('Auto-Assign clicked');
          }}
        >
          Auto-Assign
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agreement No.</TableHead>
              <TableHead>Contract No.</TableHead>
              <TableHead>Item Code</TableHead>
              <TableHead>Item Description</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Monthly Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned VIN</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : lines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No vehicle lines found
                </TableCell>
              </TableRow>
            ) : (
              lines.map((line) => (
                <TableRow key={`${line.agreementId}-${line.lineNo}`}>
                  <TableCell className="font-medium">{line.agreementNo}</TableCell>
                  <TableCell>{line.contractNo}</TableCell>
                  <TableCell>
                    <span className="font-mono text-sm font-medium">{line.itemCode}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{line.itemDescription}</span>
                  </TableCell>
                  <TableCell>
                    {line.startDate ? format(new Date(line.startDate), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  <TableCell>{line.durationMonths} months</TableCell>
                  <TableCell>AED {line.monthlyRate.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>
                    {line.isAssigned ? (
                      <Badge variant="default" className="bg-green-500">Assigned</Badge>
                    ) : (
                      <Badge variant="destructive">Not Assigned</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {line.assignedVin ? (
                      <div className="flex flex-col">
                        <span className="font-mono text-sm">{line.assignedVin}</span>
                        {line.assignedLicensePlate && (
                          <span className="text-xs text-muted-foreground">{line.assignedLicensePlate}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {line.isAssigned ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewClick(line)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onAssignClick(line)}
                      >
                        Assign VIN
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} results
          </div>
          <div className="flex items-center gap-2">
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleLinesTable;
