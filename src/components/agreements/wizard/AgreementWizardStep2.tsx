import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RequiredLabel } from '@/components/ui/required-label';
import { FormError } from '@/components/ui/form-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Car } from 'lucide-react';

interface AgreementWizardStep2Props {
  data: {
    vehicles: Array<{
      vehicleId?: string;
      fuelLevel: string;
      odometerOut: number;
      existingDamage?: {
        photos: string[];
        notes: string;
      };
    }>;
  };
  reservation: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export const AgreementWizardStep2: React.FC<AgreementWizardStep2Props> = ({
  data,
  reservation,
  onChange,
  errors,
}) => {
  const [uploadingPhotos, setUploadingPhotos] = useState<boolean>(false);

  const updateVehicle = (index: number, field: string, value: any) => {
    const updatedVehicles = [...data.vehicles];
    updatedVehicles[index] = { ...updatedVehicles[index], [field]: value };
    onChange({ vehicles: updatedVehicles });
  };

  const updateDamage = (index: number, field: string, value: any) => {
    const updatedVehicles = [...data.vehicles];
    const existingDamage = updatedVehicles[index].existingDamage || { photos: [], notes: '' };
    updatedVehicles[index] = {
      ...updatedVehicles[index],
      existingDamage: { ...existingDamage, [field]: value }
    };
    onChange({ vehicles: updatedVehicles });
  };

  const handlePhotoUpload = async (index: number, files: FileList | null) => {
    if (!files) return;
    
    setUploadingPhotos(true);
    try {
      // Mock photo upload - in real app, upload to storage service
      const newPhotos: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Create mock URL - in production, upload to cloud storage
        const mockUrl = URL.createObjectURL(file);
        newPhotos.push(mockUrl);
      }
      
      const currentPhotos = data.vehicles[index].existingDamage?.photos || [];
      updateDamage(index, 'photos', [...currentPhotos, ...newPhotos]);
    } catch (error) {
      console.error('Failed to upload photos:', error);
    } finally {
      setUploadingPhotos(false);
    }
  };

  const removePhoto = (vehicleIndex: number, photoIndex: number) => {
    const currentPhotos = data.vehicles[vehicleIndex].existingDamage?.photos || [];
    const updatedPhotos = currentPhotos.filter((_, index) => index !== photoIndex);
    updateDamage(vehicleIndex, 'photos', updatedPhotos);
  };

  return (
    <div id="wiz-step-handover" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle Handover (Check Out)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.vehicles.map((vehicle, index) => (
            <Card key={index} className="border-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>
                    Vehicle {index + 1}
                    {reservation.vehicles && (
                      <span className="text-base font-normal text-muted-foreground ml-2">
                        - {reservation.vehicles.make} {reservation.vehicles.model}
                      </span>
                    )}
                  </span>
                  {reservation.vehicles && (
                    <Badge variant="outline">
                      {reservation.vehicles.license_plate}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Fuel & Odometer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <RequiredLabel htmlFor={`fuelLevel-${index}`}>Fuel Level</RequiredLabel>
                    <Select
                      value={vehicle.fuelLevel}
                      onValueChange={(value) => updateVehicle(index, 'fuelLevel', value)}
                    >
                      <SelectTrigger id={`fuelLevel-${index}`}>
                        <SelectValue placeholder="Select fuel level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Empty (0/4)</SelectItem>
                        <SelectItem value="0.25">1/4 Tank</SelectItem>
                        <SelectItem value="0.5">1/2 Tank</SelectItem>
                        <SelectItem value="0.75">3/4 Tank</SelectItem>
                        <SelectItem value="1">Full Tank</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormError message={errors[`vehicle_${index}_fuel`]} />
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel htmlFor={`odometerOut-${index}`}>Odometer Out</RequiredLabel>
                    <Input
                      id={`odometerOut-${index}`}
                      type="number"
                      min="0"
                      placeholder="Enter odometer reading"
                      value={vehicle.odometerOut || ''}
                      onChange={(e) => updateVehicle(index, 'odometerOut', parseFloat(e.target.value) || 0)}
                      aria-required="true"
                    />
                    <FormError message={errors[`vehicle_${index}_odometer`]} />
                  </div>
                </div>

                {/* Existing Damage */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Existing Damage Documentation</Label>
                  
                  {/* Photo Upload */}
                  <div className="space-y-3">
                    <Label htmlFor={`damagePhotos-${index}`}>Damage Photos</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id={`damagePhotos-${index}`}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(index, e.target.files)}
                        disabled={uploadingPhotos}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={uploadingPhotos}
                        onClick={() => document.getElementById(`damagePhotos-${index}`)?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingPhotos ? 'Uploading...' : 'Upload Photos'}
                      </Button>
                    </div>

                    {/* Photo Preview */}
                    {vehicle.existingDamage?.photos && vehicle.existingDamage.photos.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {vehicle.existingDamage.photos.map((photo, photoIndex) => (
                          <div key={photoIndex} className="relative">
                            <img
                              src={photo}
                              alt={`Damage photo ${photoIndex + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 p-0"
                              onClick={() => removePhoto(index, photoIndex)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Damage Notes */}
                  <div className="space-y-2">
                    <Label htmlFor={`damageNotes-${index}`}>Damage Notes</Label>
                    <Textarea
                      id={`damageNotes-${index}`}
                      placeholder="Describe any existing damage, scratches, or issues..."
                      rows={3}
                      value={vehicle.existingDamage?.notes || ''}
                      onChange={(e) => updateDamage(index, 'notes', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
