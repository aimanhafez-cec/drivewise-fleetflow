import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleExchangeModal } from './VehicleExchangeModal';
import { VehicleAssignmentModal } from './VehicleAssignmentModal';
import { MobileAgreementLinesTable } from './MobileAgreementLinesTable';
import { format } from 'date-fns';
import { RefreshCw, Plus } from 'lucide-react';
import { formatCurrency } from "@/lib/utils";
import { calculateAgreementLinePricing } from "@/lib/utils/agreementPricing";

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
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState<any>(null);

  const handleExchangeClick = (line: any) => {
    setSelectedLine(line);
    setExchangeModalOpen(true);
  };

  const handleAssignClick = (line: any) => {
    setSelectedLine(line);
    setAssignmentModalOpen(true);
  };

  const handleExchangeComplete = () => {
    setExchangeModalOpen(false);
    setSelectedLine(null);
    if (onExchangeComplete) {
      onExchangeComplete();
    }
  };

  const handleAssignmentComplete = () => {
    setAssignmentModalOpen(false);
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
      {/* Mobile View */}
      <div className="block lg:hidden">
        <MobileAgreementLinesTable
          agreementId={agreementId}
          lines={lines}
          agreementStartDate={agreementStartDate}
          agreementEndDate={agreementEndDate}
          onExchangeComplete={onExchangeComplete}
        />
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block">
        <Card>
          <CardHeader>
            <CardTitle className="text-card-foreground">Agreement Lines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-card-foreground min-w-[200px]">Vehicle</TableHead>
                    <TableHead className="text-card-foreground min-w-[120px]">Check Out</TableHead>
                    <TableHead className="text-card-foreground min-w-[120px]">Check In</TableHead>
                    <TableHead className="text-card-foreground min-w-[100px]">Segments</TableHead>
                    <TableHead className="text-card-foreground min-w-[200px]">Pricing Breakdown</TableHead>
                    <TableHead className="text-card-foreground min-w-[100px]">Line Net</TableHead>
                    <TableHead className="text-card-foreground min-w-[80px]">Tax</TableHead>
                    <TableHead className="text-card-foreground min-w-[100px]">Line Total</TableHead>
                    <TableHead className="text-card-foreground min-w-[160px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.map((line) => {
                    const pricing = calculateAgreementLinePricing(line);
                    return (
                      <TableRow key={line.id}>
                        <TableCell className="text-card-foreground">
                          <div>
                            <div className="font-medium text-card-foreground">
                              {line.vehicle ? `${line.vehicle.make} ${line.vehicle.model}` : 
                                <span className="text-card-foreground">No Vehicle Assigned</span>
                              }
                            </div>
                            {line.vehicle?.license_plate && (
                              <div className="text-sm text-card-foreground/70">
                                {line.vehicle.license_plate}
                              </div>
                            )}
                            {!line.vehicle_id && (
                              <Badge variant="outline" className="text-xs mt-1">
                                Needs Assignment
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-card-foreground">
                          {line.check_out_at ? format(new Date(line.check_out_at), 'MMM dd, yyyy\nHH:mm') : '-'}
                        </TableCell>
                        <TableCell className="text-card-foreground">
                          {line.check_in_at ? format(new Date(line.check_in_at), 'MMM dd, yyyy\nHH:mm') : '-'}
                        </TableCell>
                        <TableCell className="text-card-foreground">
                          {getSegmentBadges(line)}
                        </TableCell>
                        <TableCell className="text-card-foreground">
                          {pricing.hasBreakdown ? (
                            <div className="text-xs space-y-1">
                              <div>Base: {formatCurrency(pricing.baseRate)}</div>
                              {pricing.insuranceCost > 0 && (
                                <div>Insurance ({pricing.insurancePackage}): +{formatCurrency(pricing.insuranceCost)}</div>
                              )}
                              {pricing.maintenanceCost > 0 && (
                                <div>Maintenance: +{formatCurrency(pricing.maintenanceCost)}</div>
                              )}
                              {pricing.roadsideCost > 0 && (
                                <div>Roadside: +{formatCurrency(pricing.roadsideCost)}</div>
                              )}
                              {pricing.replacementCost > 0 && (
                                <div>Replacement: +{formatCurrency(pricing.replacementCost)}</div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground italic">Legacy pricing</div>
                          )}
                        </TableCell>
                        <TableCell className="text-card-foreground">{formatCurrency(line.line_net || 0)}</TableCell>
                        <TableCell className="text-card-foreground">{formatCurrency(line.tax_value || 0)}</TableCell>
                        <TableCell className="font-medium text-card-foreground">
                          {formatCurrency(line.line_total || 0)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {!line.vehicle_id ? (
                              <Button 
                                id={`btn-assign-${line.id}`}
                                size="sm" 
                                variant="default"
                                onClick={() => handleAssignClick(line)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Assign Vehicle
                              </Button>
                            ) : (
                              <Button 
                                id={`btn-exchange-${line.id}`}
                                size="sm" 
                                variant="outline"
                                onClick={() => handleExchangeClick(line)}
                                className="text-muted-foreground"
                              >
                                <RefreshCw className="h-3 w-3 mr-1 text-muted-foreground" />
                                Exchange Vehicle
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {lines.length === 0 && (
              <div className="text-center py-8 text-card-foreground/70">
                No agreement lines found
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Exchange Modal */}
      {selectedLine && exchangeModalOpen && (
        <VehicleExchangeModal
          open={exchangeModalOpen}
          onOpenChange={setExchangeModalOpen}
          agreementId={agreementId}
          line={selectedLine}
          agreementStartDate={agreementStartDate}
          agreementEndDate={agreementEndDate}
        />
      )}

      {/* Vehicle Assignment Modal */}
      {selectedLine && assignmentModalOpen && (
        <VehicleAssignmentModal
          open={assignmentModalOpen}
          onOpenChange={setAssignmentModalOpen}
          agreementId={agreementId}
          line={selectedLine}
          agreementStartDate={agreementStartDate}
          agreementEndDate={agreementEndDate}
        />
      )}
    </>
  );
};