import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Eye } from 'lucide-react';
import { useDriverLines } from '@/hooks/useCorporateDriverAssignment';
import type { DriverLine } from '@/lib/api/corporateDriverAssignment';

interface DriverLinesTableProps {
  onAssignClick: (line: DriverLine) => void;
  onManageClick: (line: DriverLine) => void;
}

export const DriverLinesTable: React.FC<DriverLinesTableProps> = ({
  onAssignClick,
  onManageClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'assigned' | 'not_assigned'>('all');

  const { data, isLoading } = useDriverLines({
    search: searchTerm,
    status: statusFilter,
    page: 1,
    pageSize: 100,
  });

  const lines = data?.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Vehicle Lines
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by vehicle code or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Lines</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="not_assigned">Not Assigned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : lines.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold mb-2">No Vehicle Lines Found</h3>
            <p className="text-sm text-muted-foreground">
              {statusFilter === 'assigned'
                ? 'No lines with assigned drivers found'
                : statusFilter === 'not_assigned'
                ? 'No lines without drivers found'
                : 'No signed agreements with vehicle lines available'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Line #</TableHead>
                  <TableHead className="min-w-[200px]">Vehicle Details</TableHead>
                  <TableHead className="min-w-[180px]">Agreement Info</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="min-w-[250px]">Assigned Drivers</TableHead>
                  <TableHead className="w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line) => (
                  <TableRow key={line.lineId}>
                    <TableCell className="font-medium">{line.lineNumber}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-sm font-semibold">{line.itemCode}</span>
                        <span className="text-sm text-muted-foreground">{line.itemDescription}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{line.agreementNumber}</span>
                        <span className="text-sm text-muted-foreground">{line.customerName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {line.isAssigned ? (
                        <Badge variant="default" className="gap-1">
                          <Users className="h-3 w-3" />
                          {line.driverCount} Driver{line.driverCount !== 1 ? 's' : ''}
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Not Assigned</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {line.assignedDrivers.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {line.assignedDrivers.map((driver) => (
                            <Badge
                              key={driver.id}
                              variant={driver.isPrimary ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {driver.driverName}
                              {driver.isPrimary && ' (Primary)'}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No drivers assigned</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {line.isAssigned ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onManageClick(line)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onAssignClick(line)}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          Assign
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
