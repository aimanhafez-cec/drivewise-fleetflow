import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { ValidationErrors } from '@/hooks/useFormValidation';

interface ErrorSummaryProps {
  errors: ValidationErrors;
  fieldLabels: Record<string, string>;
  onFieldFocus: (fieldId: string) => void;
}

export const ErrorSummary: React.FC<ErrorSummaryProps> = ({
  errors,
  fieldLabels,
  onFieldFocus
}) => {
  if (Object.keys(errors).length === 0) return null;

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="font-medium">Please correct the following errors:</p>
          <ul className="space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>
                <Button
                  variant="link"
                  className="p-0 h-auto text-left text-red-700 hover:text-red-800"
                  onClick={() => onFieldFocus(field)}
                >
                  {fieldLabels[field] || field}: {error}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
};