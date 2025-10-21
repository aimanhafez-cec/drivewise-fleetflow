import { useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface MobilePhotoCaptureProps {
  onCapture: (photo: string) => void;
  onRemove: (photo: string) => void;
  photos: string[];
  maxPhotos?: number;
  category?: string;
  disabled?: boolean;
}

export const MobilePhotoCapture = ({
  onCapture,
  onRemove,
  photos,
  maxPhotos = 10,
  category = 'photo',
  disabled = false,
}: MobilePhotoCaptureProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > maxPhotos) {
      toast.error(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    setIsProcessing(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 10MB)`);
          continue;
        }

        // Convert to base64 (in production, upload to storage)
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            onCapture(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      toast.error('Failed to process photos');
      console.error(error);
    } finally {
      setIsProcessing(false);
      // Reset input
      if (e.target) e.target.value = '';
    }
  };

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* Capture Controls */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={handleCameraCapture}
          disabled={disabled || isProcessing || photos.length >= maxPhotos}
        >
          <Camera className="h-4 w-4 mr-2" />
          Take Photo
        </Button>
        <Button
          variant="outline"
          onClick={handleFileUpload}
          disabled={disabled || isProcessing || photos.length >= maxPhotos}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Photos
        </Button>
        <div className="ml-auto text-sm text-muted-foreground">
          {photos.length} / {maxPhotos} photos
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        multiple
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        multiple
      />

      {/* Photo Grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((photo, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <img
                src={photo}
                alt={`${category} ${index + 1}`}
                className="w-full aspect-square object-cover"
              />
              {!disabled && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => onRemove(photo)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-xs text-white">
                  {category} {index + 1}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              No photos captured yet
            </p>
            <p className="text-xs text-muted-foreground">
              Use the buttons above to take or upload photos
            </p>
          </div>
        </Card>
      )}

      {isProcessing && (
        <div className="text-center text-sm text-muted-foreground">
          Processing photos...
        </div>
      )}
    </div>
  );
};
