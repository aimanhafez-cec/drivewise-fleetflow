import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Copy, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { format } from 'date-fns';
import type { ReservationLine } from './ReservationWizardContext';

interface ReservationLineTableProps {
  lines: ReservationLine[];
  reservationType: 'vehicle_class' | 'specific_vehicle' | null;
  onEdit: (lineId: string) => void;
  onDelete: (lineId: string) => void;
  onDuplicate: (lineId: string) => void;
}

export const ReservationLineTable: React.FC<ReservationLineTableProps> = ({
  lines,
  reservationType,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  const getVehicleDisplay = (line: ReservationLine) => {
    if (reservationType === 'vehicle_class' && line.vehicleClassId) {
      return line.vehicleData?.name || `Class: ${line.vehicleClassId}`;
    } else if (reservationType === 'specific_vehicle') {
      if (line.vehicleId) {
        const vehicle = line.vehicleData;
        return vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.license_plate})` : 'Vehicle';
      }
      return line.vehicleData?.makeModel || 'Make/Model';
    }
    return 'Not Selected';
  };

  const getDatesDisplay = (line: ReservationLine) => {
    if (!line.checkOutDate || !line.checkInDate) return 'Not Set';
    try {
      const checkOut = format(new Date(line.checkOutDate), 'MMM dd');
      const checkIn = format(new Date(line.checkInDate), 'MMM dd');
      return `${checkOut} → ${checkIn}`;
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Drivers</TableHead>
            <TableHead>Add-ons</TableHead>
            <TableHead className="text-right">Line Total</TableHead>
            <TableHead className="w-32 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.map((line) => (
            <TableRow key={line.id}>
              <TableCell className="font-medium">{line.lineNo}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{getVehicleDisplay(line)}</div>
                  {!line.vehicleId && !line.vehicleClassId && reservationType === 'specific_vehicle' && !line.vehicleData?.makeModel && (
                    <Badge variant="outline" className="text-xs">
                      Not Selected
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{getDatesDisplay(line)}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary">
                    {line.drivers?.length || 0}
                  </Badge>
                  {line.drivers?.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      driver{line.drivers.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {line.selectedAddOns?.length || 0}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {line.lineTotal && line.lineTotal > 0 ? (
                  <div className="space-y-1">
                    <div className="font-semibold font-mono text-base">
                      {formatCurrency(line.lineTotal)}
                    </div>
                    {line.baseRate && (
                      <div className="text-xs text-muted-foreground">
                        Base: {formatCurrency(line.baseRate)}
                      </div>
                    )}
                  </div>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                    <Clock className="h-3 w-3 mr-1" />
                    Pricing Pending
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(line.id)}
                    title="Edit line"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDuplicate(line.id)}
                    title="Duplicate line"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(line.id)}
                    className="text-destructive hover:text-destructive"
                    title="Delete line"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
