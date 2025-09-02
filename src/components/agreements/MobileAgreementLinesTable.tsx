import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleExchangeModal } from './VehicleExchangeModal';
import { VehicleAssignmentModal } from './VehicleAssignmentModal';
import { format } from 'date-fns';
import { RefreshCw, Plus, Car, Calendar, MapPin } from 'lucide-react';
import { formatCurrency } from "@/lib/utils";

interface MobileAgreementLinesTableProps {
  agreementId: string;
  lines: any[];
  agreementStartDate: Date;
  agreementEndDate: Date;
  onExchangeComplete?: () => void;
}

export const MobileAgreementLinesTable: React.FC<MobileAgreementLinesTableProps> = ({
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
    const hasExchange = line.additions?.some((add: any) => add.type === 'vehicle_exchange');
    
    if (hasExchange) {
      return (
        <div className="flex gap-1">
          <Badge variant="outline" className="text-xs">
            Segment A
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Segment B
          </Badge>
        </div>
      );
    }
    
    return null;
  };

  if (lines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-card-foreground">Agreement Lines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-card-foreground/70">
            No agreement lines found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-card-foreground">Agreement Lines</h3>
        
        {lines.map((line, index) => (
          <Card key={line.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Vehicle Info Section */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium text-card-foreground">
                          {line.vehicle ? 
                            `${line.vehicle.make} ${line.vehicle.model} (${line.vehicle.year})` : 
                            'No Vehicle Assigned'
                          }
                        </p>
                        {line.vehicle?.license_plate && (
                          <p className="text-sm text-card-foreground/70 font-mono">
                            {line.vehicle.license_plate}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {!line.vehicle_id && (
                      <Badge variant="outline" className="text-xs">
                        Needs Assignment
                      </Badge>
                    )}
                  </div>
                  
                  {/* Segments */}
                  <div className="shrink-0">
                    {getSegmentBadges(line)}
                  </div>
                </div>

                {/* Dates Section */}
                <div className="grid grid-cols-2 gap-4 py-3 border-y border-border/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-green-600" />
                      <span className="text-xs font-medium text-card-foreground/70 uppercase tracking-wide">Check Out</span>
                    </div>
                    <p className="text-sm text-card-foreground">
                      {line.check_out_at ? format(new Date(line.check_out_at), 'MMM dd, yyyy\nHH:mm') : 'Not set'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-red-600" />
                      <span className="text-xs font-medium text-card-foreground/70 uppercase tracking-wide">Check In</span>
                    </div>
                    <p className="text-sm text-card-foreground">
                      {line.check_in_at ? format(new Date(line.check_in_at), 'MMM dd, yyyy\nHH:mm') : 'Not set'}
                    </p>
                  </div>
                </div>

                {/* Financial Section */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-card-foreground/70 uppercase tracking-wide">Net</span>
                    <p className="text-sm font-medium text-card-foreground">
                      {formatCurrency(line.line_net || 0)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-card-foreground/70 uppercase tracking-wide">Tax</span>
                    <p className="text-sm font-medium text-card-foreground">
                      {formatCurrency(line.tax_value || 0)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-card-foreground/70 uppercase tracking-wide">Total</span>
                    <p className="text-base font-bold text-primary">
                      {formatCurrency(line.line_total || 0)}
                    </p>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="pt-3 border-t border-border/50">
                  {!line.vehicle_id ? (
                    <Button 
                      size="sm" 
                      onClick={() => handleAssignClick(line)}
                      className="w-full"
                    >
                      <Plus className="h-3 w-3 mr-2" />
                      Assign Vehicle
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleExchangeClick(line)}
                      className="w-full"
                    >
                      <RefreshCw className="h-3 w-3 mr-2" />
                      Exchange Vehicle
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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