import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleExchangeModal } from './VehicleExchangeModal';
import { format } from 'date-fns';
import { RefreshCw } from 'lucide-react';

interface AgreementLinesTableProps {
  agreementId: string;
  lines: any[];
  agreementStartDate: Date;
  agreementEndDate: Date;
  onExchangeComplete?: () => void;
}

export const AgreementLinesTable: React.FC<AgreementLinesTableProps> = ({
  agreementId,
  lines,
  agreementStartDate,
  agreementEndDate,
  onExchangeComplete
}) => {
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState<any>(null);

  const handleExchangeClick = (line: any) => {
    setSelectedLine(line);
    setExchangeModalOpen(true);
  };

  const handleExchangeComplete = () => {
    setExchangeModalOpen(false);
    setSelectedLine(null);
    if (onExchangeComplete) {
      onExchangeComplete();
    }
  };

  const getSegmentBadges = (line: any) => {
    // Check if this line has been exchanged
    const hasExchange = line.additions?.some((add: any) => add.type === 'vehicle_exchange');
    
    if (hasExchange) {
      return (
        <div className="flex gap-1">
          <Badge id={`segment-badge-${line.id}-A`} variant="outline" className="text-xs">
            Segment A
          </Badge>
          <Badge id={`segment-badge-${line.id}-B`} variant="secondary" className="text-xs">
            Segment B
          </Badge>
        </div>
      );
    }
    
    return null;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Agreement Lines</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Segments</TableHead>
                <TableHead>Line Net</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead>Line Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {line.vehicle ? `${line.vehicle.make} ${line.vehicle.model}` : 'No Vehicle'}
                      </div>
                      {line.vehicle?.license_plate && (
                        <div className="text-sm text-muted-foreground">
                          {line.vehicle.license_plate}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {line.check_out_at ? format(new Date(line.check_out_at), 'MMM dd, yyyy\nHH:mm') : '-'}
                  </TableCell>
                  <TableCell>
                    {line.check_in_at ? format(new Date(line.check_in_at), 'MMM dd, yyyy\nHH:mm') : '-'}
                  </TableCell>
                  <TableCell>
                    {getSegmentBadges(line)}
                  </TableCell>
                  <TableCell>${line.line_net?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>${line.tax_value?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell className="font-medium">
                    ${line.line_total?.toFixed(2) || '0.00'}
                  </TableCell>
                  <TableCell>
                    <Button 
                      id={`btn-exchange-${line.id}`}
                      size="sm" 
                      variant="outline"
                      onClick={() => handleExchangeClick(line)}
                      disabled={!line.vehicle_id} // Can't exchange if no vehicle assigned
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Exchange Vehicle
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {lines.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No agreement lines found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Exchange Modal */}
      {selectedLine && (
        <VehicleExchangeModal
          open={exchangeModalOpen}
          onOpenChange={setExchangeModalOpen}
          agreementId={agreementId}
          line={selectedLine}
          agreementStartDate={agreementStartDate}
          agreementEndDate={agreementEndDate}
        />
      )}
    </>
  );
};