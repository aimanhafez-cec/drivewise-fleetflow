import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { AlertCircle, Edit } from 'lucide-react';

interface PrefillData {
  reservationTypeId: string;
  vehicleClassId: string;
  vehicleId: string;
  checkOutDate: Date | null;
  checkOutLocationId: string;
  checkInDate: Date | null;
  checkInLocationId: string;
  priceListId: string;
  promotionCode?: string;
}

interface PrefillChipsProps {
  prefillData: PrefillData;
  onEditClick: () => void;
  isComplete: boolean;
}

const getVehicleClassName = (classId: string): string => {
  const classMap: Record<string, string> = {
    'economy': 'Economy',
    'compact': 'Compact',
    'midsize': 'Midsize',
    'fullsize': 'Full Size',
    'luxury': 'Luxury'
  };
  return classMap[classId] || classId;
};

const getVehicleName = (vehicleId: string): string => {
  const vehicleMap: Record<string, string> = {
    'car1': 'Toyota Camry',
    'car2': 'Honda Accord',
    'car3': 'Nissan Altima',
    'car4': 'BMW 3 Series'
  };
  return vehicleMap[vehicleId] || vehicleId;
};

const getLocationName = (locationId: string): string => {
  const locationMap: Record<string, string> = {
    'loc1': 'Downtown',
    'loc2': 'Airport Terminal 1',
    'loc3': 'Airport Terminal 2',
    'loc4': 'City Center'
  };
  return locationMap[locationId] || locationId;
};

export const PrefillChips: React.FC<PrefillChipsProps> = ({ 
  prefillData, 
  onEditClick, 
  isComplete 
}) => {
  if (!isComplete) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4" />
        <span>Complete Vehicle & dates to enable Add Line.</span>
        <Button variant="ghost" size="sm" onClick={onEditClick} className="h-6 px-2">
          <Edit className="h-3 w-3 mr-1" />
          Complete
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {prefillData.vehicleClassId && (
        <Badge variant="secondary" className="text-xs">
          {getVehicleClassName(prefillData.vehicleClassId)}
        </Badge>
      )}
      
      {prefillData.vehicleId && (
        <Badge variant="secondary" className="text-xs">
          {getVehicleName(prefillData.vehicleId)}
        </Badge>
      )}
      
      {prefillData.checkOutDate && (
        <Badge variant="outline" className="text-xs">
          Out: {format(prefillData.checkOutDate, 'dd/MM HH:mm')}
        </Badge>
      )}
      
      {prefillData.checkInDate && (
        <Badge variant="outline" className="text-xs">
          In: {format(prefillData.checkInDate, 'dd/MM HH:mm')}
        </Badge>
      )}
      
      {prefillData.checkOutLocationId && (
        <Badge variant="outline" className="text-xs">
          From: {getLocationName(prefillData.checkOutLocationId)}
        </Badge>
      )}
      
      {prefillData.checkInLocationId && prefillData.checkInLocationId !== prefillData.checkOutLocationId && (
        <Badge variant="outline" className="text-xs">
          To: {getLocationName(prefillData.checkInLocationId)}
        </Badge>
      )}
      
      {prefillData.promotionCode && (
        <Badge variant="default" className="text-xs bg-green-100 text-green-800 hover:bg-green-100">
          Promo: {prefillData.promotionCode}
        </Badge>
      )}
      
      <Button variant="ghost" size="sm" onClick={onEditClick} className="h-6 px-2 ml-2">
        <Edit className="h-3 w-3 mr-1" />
        Change
      </Button>
    </div>
  );
};