import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTrafficFinesCorporate } from '@/hooks/useTrafficFinesCorporate';
import type { TrafficFineFilters } from '@/lib/api/trafficFinesCorporate';
import { Gauge, ParkingSquare, Smartphone, TrafficCone, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface IntegrationViewProps {
  filters?: TrafficFineFilters;
  onSelectFine: (id: string) => void;
}

const getViolationIcon = (description: string) => {
  if (description.toLowerCase().includes('speed')) return Gauge;
  if (description.toLowerCase().includes('parking')) return ParkingSquare;
  if (description.toLowerCase().includes('mobile') || description.toLowerCase().includes('phone')) return Smartphone;
  if (description.toLowerCase().includes('signal') || description.toLowerCase().includes('light')) return TrafficCone;
  return AlertCircle;
};

const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'paid': return 'default';
    case 'unpaid': return 'destructive';
    case 'disputed': return 'secondary';
    case 'cancelled': return 'outline';
    default: return 'outline';
  }
};

const getEmirateBadgeColor = (emirate: string) => {
  const colors: Record<string, string> = {
    'DXB': 'bg-blue-100 text-blue-800',
    'AUH': 'bg-green-100 text-green-800',
    'SHJ': 'bg-red-100 text-red-800',
    'AJM': 'bg-purple-100 text-purple-800',
    'RAK': 'bg-orange-100 text-orange-800',
    'UAQ': 'bg-teal-100 text-teal-800',
    'FUJ': 'bg-indigo-100 text-indigo-800',
  };
  return colors[emirate] || 'bg-gray-100 text-gray-800';
};

export function IntegrationView({ filters, onSelectFine }: IntegrationViewProps) {
  const { data: fines, isLoading } = useTrafficFinesCorporate(filters);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      </Card>
    );
  }

  if (!fines || fines.length === 0) {
    return (
      <Card className="p-12 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-lg font-medium">No traffic fines found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Try adjusting your filters or click "Run Integration" to load data
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Fine No</TableHead>
            <TableHead>Plate</TableHead>
            <TableHead>Emirate</TableHead>
            <TableHead>Authority</TableHead>
            <TableHead>Violation</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Confiscation</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Integration Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fines.map((fine) => {
            const Icon = getViolationIcon(fine.violation_description);
            return (
              <TableRow 
                key={fine.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSelectFine(fine.id)}
              >
                <TableCell>
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </TableCell>
                <TableCell className="font-medium">{fine.fine_no}</TableCell>
                <TableCell>
                  {fine.plate_code && <span className="font-semibold">{fine.plate_code} </span>}
                  {fine.plate_number}
                </TableCell>
                <TableCell>
                  <Badge className={getEmirateBadgeColor(fine.emirate)} variant="outline">
                    {fine.emirate}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{fine.authority_source}</TableCell>
                <TableCell className="max-w-xs truncate text-sm">
                  {fine.violation_description}
                </TableCell>
                <TableCell className="font-medium">
                  AED {fine.total_amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  {fine.confiscation_days > 0 ? (
                    <Badge variant="destructive">{fine.confiscation_days} days</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(fine.status)} className="capitalize">
                    {fine.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {fine.integration_timestamp 
                    ? format(new Date(fine.integration_timestamp), 'MMM dd, HH:mm')
                    : '-'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
