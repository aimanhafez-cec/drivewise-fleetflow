import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, X, Eye } from 'lucide-react';

interface ComparePhoto {
  id: string;
  type: 'out' | 'in';
  imageUrl: string;
  timestamp: string;
}

interface CompareOutVsInStepProps {
  vehicleId: string;
  existingPhotos: ComparePhoto[];
  onUpdate: (data: { comparePhotos: ComparePhoto[] }) => void;
}

export const CompareOutVsInStep: React.FC<CompareOutVsInStepProps> = ({
  vehicleId,
  existingPhotos,
  onUpdate
}) => {
  const [photos, setPhotos] = useState<ComparePhoto[]>(existingPhotos || []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>, type: 'out' | 'in') => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      const newPhoto: ComparePhoto = {
        id: `photo-${type}-${Date.now()}`,
        type,
        imageUrl,
        timestamp: new Date().toISOString()
      };

      // Replace existing photo of same type or add new one
      const updatedPhotos = photos.filter(p => p.type !== type);
      updatedPhotos.push(newPhoto);
      
      setPhotos(updatedPhotos);
      onUpdate({ comparePhotos: updatedPhotos });
    };
    
    reader.readAsDataURL(file);
    // Reset input
    event.target.value = '';
  }, [photos, onUpdate]);

  const removePhoto = (photoId: string) => {
    const updatedPhotos = photos.filter(p => p.id !== photoId);
    setPhotos(updatedPhotos);
    onUpdate({ comparePhotos: updatedPhotos });
  };

  const getPhotoByType = (type: 'out' | 'in') => {
    return photos.find(p => p.type === type);
  };

  const outPhoto = getPhotoByType('out');
  const inPhoto = getPhotoByType('in');

  return (
    <div id="step-compare" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Compare Out vs In</h3>
        <p className="text-muted-foreground">
          Capture photos when the vehicle goes out and comes back in to compare condition changes.
        </p>
      </div>

      {/* Photo Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="font-medium">{photos.length}/2</span> photos captured
              </div>
              {outPhoto && (
                <Badge variant="outline" className="text-green-700 border-green-300">
                  Out photo ready
                </Badge>
              )}
              {inPhoto && (
                <Badge variant="outline" className="text-blue-700 border-blue-300">
                  In photo ready
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vehicle Going Out */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-green-600" />
              Vehicle Going Out
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {outPhoto ? (
              <div className="relative group">
                <img
                  src={outPhoto.imageUrl}
                  alt="Vehicle going out"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => removePhoto(outPhoto.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Captured: {new Date(outPhoto.timestamp).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Camera className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-4">
                  Capture photo when vehicle goes out
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'out')}
                  className="hidden"
                  id="upload-out"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('upload-out')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Coming In */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-600" />
              Vehicle Coming In
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {inPhoto ? (
              <div className="relative group">
                <img
                  src={inPhoto.imageUrl}
                  alt="Vehicle coming in"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => removePhoto(inPhoto.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Captured: {new Date(inPhoto.timestamp).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Camera className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-4">
                  Capture photo when vehicle returns
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'in')}
                  className="hidden"
                  id="upload-in"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('upload-in')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparison View */}
      {outPhoto && inPhoto && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Side-by-Side Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <img
                  src={outPhoto.imageUrl}
                  alt="Vehicle going out"
                  className="w-full h-40 object-cover rounded border"
                />
                <p className="text-sm font-medium mt-2">Going Out</p>
              </div>
              <div className="text-center">
                <img
                  src={inPhoto.imageUrl}
                  alt="Vehicle coming in"
                  className="w-full h-40 object-cover rounded border"
                />
                <p className="text-sm font-medium mt-2">Coming In</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Capture the "Out" photo when the vehicle is being rented out</li>
          <li>• Capture the "In" photo when the vehicle returns</li>
          <li>• Compare both photos to identify any new damage or changes</li>
          <li>• Photos help document the vehicle's condition throughout the rental period</li>
        </ul>
      </div>
    </div>
  );
};