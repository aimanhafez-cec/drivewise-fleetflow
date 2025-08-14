import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, X } from 'lucide-react';

interface RepriceBannerProps {
  show: boolean;
  onReprice: () => void;
  onDismiss: () => void;
}

export const RepriceBanner: React.FC<RepriceBannerProps> = ({ show, onReprice, onDismiss }) => {
  if (!show) return null;

  return (
    <Alert id="banner-reprice" className="mb-4 border-blue-200 bg-blue-50">
      <Info className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>Rates changed. Lines may need repricing to reflect current Rate & Taxes values.</span>
        <div className="flex gap-2 ml-4">
          <Button
            id="btn-reprice-lines"
            size="sm"
            onClick={onReprice}
          >
            Reprice Lines
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};