import React, { useState } from 'react';
import { useReservationWizard } from './ReservationWizardContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ReservationLineTable } from './ReservationLineTable';
import { LineEditorModal } from './LineEditorModal';
import { Plus, AlertCircle, Package } from 'lucide-react';
import type { ReservationLine } from './ReservationWizardContext';
import { usePricingContext, calculateLinePrice } from '@/hooks/usePricingContext';

export const Step4MultiLineBuilder: React.FC = () => {
  const { wizardData, updateWizardData } = useReservationWizard();
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const lines = wizardData.reservationLines || [];

  const handleAddLine = () => {
    setIsAddingNew(true);
  };

  const handleSaveLine = (line: ReservationLine) => {
    // Calculate pricing for this line before saving
    const pricingContext = usePricingContext({
      priceListId: wizardData.priceListId,
      promotionCode: '',
      hourlyRate: wizardData.hourlyRate,
      dailyRate: wizardData.dailyRate,
      weeklyRate: wizardData.weeklyRate,
      monthlyRate: wizardData.monthlyRate,
      kilometerCharge: wizardData.kilometerCharge,
      dailyKilometerAllowed: wizardData.dailyKilometerAllowed,
    });
    
    const checkOutDate = new Date(`${line.checkOutDate}T${line.checkOutTime}`);
    const checkInDate = new Date(`${line.checkInDate}T${line.checkInTime}`);
    
    const { lineNetPrice } = calculateLinePrice(pricingContext, checkOutDate, checkInDate);
    
    // Calculate add-ons and driver fees
    const lineAddOns = Object.values(line.addOnPrices).reduce((sum, price) => sum + price, 0);
    const lineDriverFees = line.drivers.reduce((sum, driver) => sum + (driver.fee || 0), 0);
    
    // Update line with calculated totals
    const lineWithPricing: ReservationLine = {
      ...line,
      baseRate: lineNetPrice,
      lineNet: lineNetPrice + lineAddOns + lineDriverFees,
      taxValue: 0, // VAT calculated at total level, not per line
      lineTotal: lineNetPrice + lineAddOns + lineDriverFees,
    };
    
    console.log('💰 Line Pricing Calculated:', {
      lineNo: line.lineNo || 'new',
      baseRate: lineNetPrice,
      addOns: lineAddOns,
      driverFees: lineDriverFees,
      lineTotal: lineNetPrice + lineAddOns + lineDriverFees,
      dates: { checkOut: line.checkOutDate, checkIn: line.checkInDate },
    });
    
    if (isAddingNew) {
      // Add new line
      const newLine: ReservationLine = {
        ...lineWithPricing,
        id: crypto.randomUUID(),
        lineNo: lines.length + 1,
      };
      updateWizardData({
        reservationLines: [...lines, newLine],
      });
      setIsAddingNew(false);
    } else {
      // Update existing line
      updateWizardData({
        reservationLines: lines.map((l) => (l.id === line.id ? lineWithPricing : l)),
      });
      setEditingLineId(null);
    }
  };

  const handleEditLine = (lineId: string) => {
    setEditingLineId(lineId);
  };

  const handleDeleteLine = (lineId: string) => {
    const updatedLines = lines
      .filter((l) => l.id !== lineId)
      .map((l, index) => ({ ...l, lineNo: index + 1 }));
    updateWizardData({
      reservationLines: updatedLines,
    });
  };

  const handleDuplicateLine = (lineId: string) => {
    const lineToDuplicate = lines.find((l) => l.id === lineId);
    if (!lineToDuplicate) return;

    const newLine: ReservationLine = {
      ...lineToDuplicate,
      id: crypto.randomUUID(),
      lineNo: lines.length + 1,
      vehicleId: undefined, // Clear vehicle selection
      vehicleData: undefined,
      drivers: [], // Clear drivers
    };

    updateWizardData({
      reservationLines: [...lines, newLine],
    });
  };

  const handleCloseModal = () => {
    setIsAddingNew(false);
    setEditingLineId(null);
  };

  const editingLine = editingLineId ? lines.find((l) => l.id === editingLineId) : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Vehicle Selection</h2>
        <p className="text-muted-foreground">
          Add one or more vehicles to this reservation. Each line can have its own dates, locations, and add-ons.
        </p>
      </div>

      {lines.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No vehicles added yet. Click "Add Vehicle" to start building your reservation.
          </AlertDescription>
        </Alert>
      )}

      {lines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Reservation Lines ({lines.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReservationLineTable
              lines={lines}
              reservationType={wizardData.reservationType}
              onEdit={handleEditLine}
              onDelete={handleDeleteLine}
              onDuplicate={handleDuplicateLine}
            />
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        <Button onClick={handleAddLine} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add {lines.length > 0 ? 'Another' : ''} Vehicle
        </Button>
        
        {lines.length > 0 && (
          <Button 
            variant="outline" 
            onClick={() => {
              if (lines.length > 0) {
                handleDuplicateLine(lines[lines.length - 1].id);
              }
            }}
          >
            Duplicate Last Line
          </Button>
        )}
      </div>

      {/* Line Editor Modal */}
      {(isAddingNew || editingLine) && (
        <LineEditorModal
          isOpen={true}
          onClose={handleCloseModal}
          onSave={handleSaveLine}
          line={editingLine || undefined}
          reservationType={wizardData.reservationType}
          defaultDates={{
            checkOutDate: wizardData.pickupDate,
            checkOutTime: wizardData.pickupTime,
            checkInDate: wizardData.returnDate,
            checkInTime: wizardData.returnTime,
          }}
          defaultLocations={{
            checkOutLocationId: wizardData.pickupLocation,
            checkInLocationId: wizardData.returnLocation,
          }}
        />
      )}
    </div>
  );
};
