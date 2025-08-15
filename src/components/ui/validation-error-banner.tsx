import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

interface ValidationErrorBannerProps {
  errors: Record<string, string>;
  onDismiss?: () => void;
  onFieldFocus?: (field: string) => void;
}

export const ValidationErrorBanner: React.FC<ValidationErrorBannerProps> = ({
  errors,
  onDismiss,
  onFieldFocus,
}) => {
  const errorCount = Object.keys(errors).length;
  
  if (errorCount === 0) return null;

  const handleFieldClick = (field: string) => {
    if (onFieldFocus) {
      onFieldFocus(field);
    }
  };

  return (
    <Alert className="border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <strong className="text-red-800">
            {errorCount} validation error{errorCount !== 1 ? 's' : ''} found:
          </strong>
          <div className="mt-2 space-y-1">
            {Object.entries(errors).map(([field, message]) => (
              <div key={field} className="text-sm">
                <button
                  type="button"
                  className="text-red-700 hover:text-red-900 underline cursor-pointer"
                  onClick={() => handleFieldClick(field)}
                >
                  {message}
                </button>
              </div>
            ))}
          </div>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-red-600 hover:text-red-800"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};