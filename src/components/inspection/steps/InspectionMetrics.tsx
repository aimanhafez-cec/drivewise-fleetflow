import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { RequiredLabel } from '@/components/ui/required-label';
import { Badge } from '@/components/ui/badge';
import { Gauge, Fuel, Package, Camera, CheckCircle, AlertTriangle } from 'lucide-react';

const FUEL_LEVELS = [
  { value: 'E', label: 'Empty' },
  { value: 'Q1', label: '1/4' },
  { value: 'H', label: '1/2' },
  { value: 'Q3', label: '3/4' },
  { value: 'F', label: 'Full' },
];

const EXTRA_ITEMS = [
  { code: 'BABY_SEAT', name: 'Baby Seat', maxQty: 3 },
  { code: 'WIFI_UNIT', name: 'Wi-Fi Unit', maxQty: 1 },
  { code: 'GPS', name: 'GPS Device', maxQty: 1 },
  { code: 'PHONE_MOUNT', name: 'Phone Mount', maxQty: 1 },
  { code: 'CHARGER', name: 'Phone Charger', maxQty: 2 },
];

interface MetricsData {
  odometerOut?: number;
  fuelLevelOut?: 'E' | 'Q1' | 'H' | 'Q3' | 'F';
  extrasIssued?: Array<{code: string; qty: number}>;
}

interface InspectionMetricsProps {
  data: MetricsData;
  onUpdate: (data: MetricsData) => void;
}

export const InspectionMetrics: React.FC<InspectionMetricsProps> = ({
  data,
  onUpdate
}) => {
  const [metrics, setMetrics] = useState<MetricsData>(data);
  const [fuelPhotoTaken, setFuelPhotoTaken] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMetrics(data);
  }, [data]);

  const handleOdometerChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      const newMetrics = { ...metrics, odometerOut: numValue };
      setMetrics(newMetrics);
      onUpdate(newMetrics);
      setErrors(prev => ({ ...prev, odometer: '' }));
    } else if (value === '') {
      const newMetrics = { ...metrics, odometerOut: undefined };
      setMetrics(newMetrics);
      onUpdate(newMetrics);
    } else {
      setErrors(prev => ({ ...prev, odometer: 'Please enter a valid number' }));
    }
  };

  const handleFuelLevelChange = (value: 'E' | 'Q1' | 'H' | 'Q3' | 'F') => {
    const newMetrics = { ...metrics, fuelLevelOut: value };
    setMetrics(newMetrics);
    onUpdate(newMetrics);
    setErrors(prev => ({ ...prev, fuel: '' }));
  };

  const handleExtraChange = (code: string, checked: boolean, qty: number = 1) => {
    const currentExtras = metrics.extrasIssued || [];
    let newExtras;
    
    if (checked) {
      const existingIndex = currentExtras.findIndex(e => e.code === code);
      if (existingIndex >= 0) {
        newExtras = [...currentExtras];
        newExtras[existingIndex] = { code, qty };
      } else {
        newExtras = [...currentExtras, { code, qty }];
      }
    } else {
      newExtras = currentExtras.filter(e => e.code !== code);
    }
    
    const newMetrics = { ...metrics, extrasIssued: newExtras };
    setMetrics(newMetrics);
    onUpdate(newMetrics);
  };

  const getExtraQty = (code: string) => {
    return metrics.extrasIssued?.find(e => e.code === code)?.qty || 1;
  };

  const isExtraSelected = (code: string) => {
    return metrics.extrasIssued?.some(e => e.code === code) || false;
  };

  const takeFuelPhoto = () => {
    // Mock photo taking functionality
    setFuelPhotoTaken(true);
  };

  const validateRequiredFields = () => {
    const newErrors: Record<string, string> = {};
    
    if (!metrics.odometerOut) {
      newErrors.odometer = 'Odometer reading is required';
    }
    
    if (!metrics.fuelLevelOut) {
      newErrors.fuel = 'Fuel level is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isComplete = metrics.odometerOut && metrics.fuelLevelOut;

  return (
    <div id="step-metrics" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Vehicle Metrics</h3>
        <p className="text-muted-foreground">
          Record the current vehicle condition and any extras being issued.
        </p>
      </div>

      {/* Completion Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {isComplete ? (
              <Badge variant="default">
                <CheckCircle className="mr-1 h-3 w-3" />
                Required metrics complete
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Missing required information
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Odometer Reading */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Odometer Reading
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <RequiredLabel htmlFor="odo-out">Odometer (Out) *</RequiredLabel>
            <Input
              id="odo-out"
              type="number"
              min="0"
              placeholder="Enter current odometer reading"
              value={metrics.odometerOut || ''}
              onChange={(e) => handleOdometerChange(e.target.value)}
              className={errors.odometer ? 'border-red-500' : ''}
              aria-required="true"
            />
            {errors.odometer && (
              <p className="text-sm text-red-600 mt-1">{errors.odometer}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fuel Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5" />
            Fuel Level
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <RequiredLabel htmlFor="fuel-out">Fuel Level (Out) *</RequiredLabel>
            <Select
              value={metrics.fuelLevelOut || ''}
              onValueChange={handleFuelLevelChange}
            >
              <SelectTrigger id="fuel-out" className={errors.fuel ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select fuel level" />
              </SelectTrigger>
              <SelectContent>
                {FUEL_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.fuel && (
              <p className="text-sm text-red-600 mt-1">{errors.fuel}</p>
            )}
          </div>

          <div>
            <Label>Fuel Gauge Photo (Optional)</Label>
            <div className="flex items-center gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={takeFuelPhoto}
                disabled={fuelPhotoTaken}
              >
                <Camera className="mr-2 h-3 w-3" />
                {fuelPhotoTaken ? 'Photo Taken' : 'Take Photo'}
              </Button>
              {fuelPhotoTaken && (
                <Badge variant="secondary">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Documented
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extras Issued */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Extras Issued
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div id="extras-issued" className="space-y-4">
            {EXTRA_ITEMS.map((item) => (
              <div key={item.code} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={`extra-${item.code}`}
                    checked={isExtraSelected(item.code)}
                    onCheckedChange={(checked) => 
                      handleExtraChange(item.code, checked as boolean, getExtraQty(item.code))
                    }
                  />
                  <Label htmlFor={`extra-${item.code}`} className="font-medium">
                    {item.name}
                  </Label>
                </div>
                
                {isExtraSelected(item.code) && item.maxQty > 1 && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`qty-${item.code}`} className="text-sm">
                      Qty:
                    </Label>
                    <Select
                      value={getExtraQty(item.code).toString()}
                      onValueChange={(value) => 
                        handleExtraChange(item.code, true, parseInt(value))
                      }
                    >
                      <SelectTrigger id={`qty-${item.code}`} className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: item.maxQty }, (_, i) => i + 1).map((qty) => (
                          <SelectItem key={qty} value={qty.toString()}>
                            {qty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Button */}
      <div className="flex justify-end pt-4">
        <Button 
          onClick={() => {
            const nextStepEvent = new CustomEvent('proceedToNextStep');
            window.dispatchEvent(nextStepEvent);
          }}
          className="min-w-[100px]"
        >
          Next
        </Button>
      </div>
    </div>
  );
};