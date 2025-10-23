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
import { Gauge, ParkingSquare, Smartphone, TrafficCone, AlertCircle, Link2Off } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ContractViewProps {
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

export function ContractView({ filters, onSelectFine }: ContractViewProps) {
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
            <TableHead>Contract No</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Violation</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fines.map((fine) => {
            const Icon = getViolationIcon(fine.violation_description);
            const isLinked = fine.agreement_id !== null;
            
            return (
              <TableRow 
                key={fine.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSelectFine(fine.id)}
              >
                <TableCell>
                  {isLinked ? (
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Link2Off className="h-5 w-5 text-orange-500" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{fine.fine_no}</TableCell>
                <TableCell>
                  {fine.contract?.agreement_no || fine.contract_no || (
                    <span className="text-muted-foreground italic text-sm">Not linked</span>
                  )}
                </TableCell>
                <TableCell>
                  {fine.customer?.full_name || (
                    <span className="text-muted-foreground italic text-sm">Unknown</span>
                  )}
                </TableCell>
                <TableCell>
                  {fine.driver?.full_name || (
                    <span className="text-muted-foreground italic text-sm">Unknown</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {fine.vehicle ? (
                    <div>
                      <div className="font-medium">{fine.vehicle.make} {fine.vehicle.model}</div>
                      <div className="text-xs text-muted-foreground">{fine.vehicle.license_plate}</div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic text-sm">Unknown</span>
                  )}
                </TableCell>
                <TableCell className="max-w-xs truncate text-sm">
                  {fine.violation_description}
                </TableCell>
                <TableCell className="font-medium">
                  AED {fine.final_amount?.toLocaleString() || '0'}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(fine.status)} className="capitalize">
                    {fine.status}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
