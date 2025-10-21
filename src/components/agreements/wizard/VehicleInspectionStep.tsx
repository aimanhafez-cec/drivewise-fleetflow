import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { VehicleDiagramInteractive } from '@/components/agreements/shared/VehicleDiagramInteractive';
import { MobilePhotoCapture } from '@/components/agreements/shared/MobilePhotoCapture';
import type { EnhancedWizardData } from '@/types/agreement-wizard';

interface VehicleInspectionStepProps {
  data: EnhancedWizardData['step2'];
  onChange: (field: keyof EnhancedWizardData['step2'], value: any) => void;
  errors?: string[];
}

export const VehicleInspectionStep: React.FC<VehicleInspectionStepProps> = ({
  data,
  onChange,
  errors = [],
}) => {
  const updateChecklist = (key: keyof EnhancedWizardData['step2']['preHandoverChecklist'], value: boolean) => {
    onChange('preHandoverChecklist', {
      ...data.preHandoverChecklist,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pre-Handover Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="vehicleCleaned"
              checked={data.preHandoverChecklist.vehicleCleaned}
              onCheckedChange={(checked) => updateChecklist('vehicleCleaned', checked as boolean)}
            />
            <Label htmlFor="vehicleCleaned">Vehicle cleaned and ready</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="vehicleFueled"
              checked={data.preHandoverChecklist.vehicleFueled}
              onCheckedChange={(checked) => updateChecklist('vehicleFueled', checked as boolean)}
            />
            <Label htmlFor="vehicleFueled">Vehicle fueled to required level</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="documentsReady"
              checked={data.preHandoverChecklist.documentsReady}
              onCheckedChange={(checked) => updateChecklist('documentsReady', checked as boolean)}
            />
            <Label htmlFor="documentsReady">All documents ready</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="keysAvailable"
              checked={data.preHandoverChecklist.keysAvailable}
              onCheckedChange={(checked) => updateChecklist('keysAvailable', checked as boolean)}
            />
            <Label htmlFor="keysAvailable">Keys available (main + spare)</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="warningLightsOk"
              checked={data.preHandoverChecklist.warningLightsOk}
              onCheckedChange={(checked) => updateChecklist('warningLightsOk', checked as boolean)}
            />
            <Label htmlFor="warningLightsOk">No warning lights on dashboard</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Condition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fuelLevel" className="required">
                Fuel Level (%) *
              </Label>
              <Input
                id="fuelLevel"
                type="number"
                min="0"
                max="100"
                value={data.fuelLevel}
                onChange={(e) => onChange('fuelLevel', parseInt(e.target.value))}
                required
                aria-required="true"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="odometerReading" className="required">
                Odometer Reading (KM) *
              </Label>
              <Input
                id="odometerReading"
                type="number"
                min="0"
                value={data.odometerReading}
                onChange={(e) => onChange('odometerReading', parseInt(e.target.value))}
                required
                aria-required="true"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Odometer Photo *</Label>
              <MobilePhotoCapture
                photos={data.odometerPhoto ? [data.odometerPhoto] : []}
                onPhotosChange={(photos) => onChange('odometerPhoto', photos[0])}
                maxPhotos={1}
                label="Capture odometer reading"
              />
            </div>

            <div className="space-y-2">
              <Label>Fuel Gauge Photo *</Label>
              <MobilePhotoCapture
                photos={data.fuelGaugePhoto ? [data.fuelGaugePhoto] : []}
                onPhotosChange={(photos) => onChange('fuelGaugePhoto', photos[0])}
                maxPhotos={1}
                label="Capture fuel gauge"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Damage Inspection</CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleDiagramInteractive
            damageMarkers={data.damageMarkers}
            onMarkersChange={(markers) => onChange('damageMarkers', markers)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Photos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Exterior Photos</Label>
            <MobilePhotoCapture
              photos={data.photos.exterior}
              onPhotosChange={(photos) =>
                onChange('photos', { ...data.photos, exterior: photos })
              }
              maxPhotos={8}
              label="Capture exterior photos (all 4 sides)"
            />
          </div>

          <div className="space-y-2">
            <Label>Interior Photos</Label>
            <MobilePhotoCapture
              photos={data.photos.interior}
              onPhotosChange={(photos) =>
                onChange('photos', { ...data.photos, interior: photos })
              }
              maxPhotos={6}
              label="Capture interior photos"
            />
          </div>

          <div className="space-y-2">
            <Label>Document Photos</Label>
            <MobilePhotoCapture
              photos={data.photos.documents}
              onPhotosChange={(photos) =>
                onChange('photos', { ...data.photos, documents: photos })
              }
              maxPhotos={4}
              label="Capture registration, insurance documents"
            />
          </div>

          {data.damageMarkers.length > 0 && (
            <div className="space-y-2">
              <Label>Damage Photos</Label>
              <MobilePhotoCapture
                photos={data.photos.damages}
                onPhotosChange={(photos) =>
                  onChange('photos', { ...data.photos, damages: photos })
                }
                maxPhotos={10}
                label="Capture detailed damage photos"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <div className="text-sm text-destructive">
          {errors.map((error, i) => (
            <div key={i}>{error}</div>
          ))}
        </div>
      )}
    </div>
  );
};
