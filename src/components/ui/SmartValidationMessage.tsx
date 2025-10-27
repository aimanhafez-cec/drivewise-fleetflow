import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Lightbulb, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartValidationMessageProps {
  type?: 'error' | 'warning' | 'info' | 'success';
  message: string;
  suggestion?: string;
  field?: string;
  className?: string;
}

export const SmartValidationMessage: React.FC<SmartValidationMessageProps> = ({
  type = 'error',
  message,
  suggestion,
  field,
  className,
}) => {
  const icons = {
    error: <AlertCircle className="h-4 w-4" />,
    warning: <AlertCircle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
    success: <CheckCircle className="h-4 w-4" />,
  };

  const variants = {
    error: 'border-destructive/50 bg-destructive/5 text-destructive',
    warning: 'border-amber-500/50 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300',
    info: 'border-blue-500/50 bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300',
    success: 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300',
  };

  return (
    <Alert className={cn(variants[type], 'border', className)}>
      <div className="flex gap-2">
        {icons[type]}
        <div className="flex-1 space-y-1">
          <AlertDescription className="font-medium">
            {field && <span className="font-semibold">{field}: </span>}
            {message}
          </AlertDescription>
          {suggestion && (
            <div className="flex items-start gap-2 mt-2 pt-2 border-t border-current/20">
              <Lightbulb className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <p className="text-xs opacity-90">{suggestion}</p>
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
};

/**
 * Generate smart suggestions based on common validation errors
 */
export function getValidationSuggestion(field: string, error: string): string | undefined {
  const suggestions: Record<string, Record<string, string>> = {
    email: {
      invalid: 'Make sure to include @ and a domain (e.g., user@example.com)',
      required: 'Email is needed to send booking confirmations',
    },
    phone: {
      invalid: 'Use format: +971-XX-XXX-XXXX or 05X-XXX-XXXX',
      required: 'Phone number helps us contact you for pickup',
    },
    date: {
      past: 'Choose a future date for your reservation',
      invalid: 'Select a valid date from the calendar',
      required: 'Both pickup and return dates are required',
    },
    time: {
      invalid: 'Use 24-hour format (e.g., 14:30 for 2:30 PM)',
      required: 'Specify pickup and return times to calculate accurate pricing',
    },
    payment: {
      insufficient: 'Down payment must be at least 20% of total amount',
      invalid: 'Enter a valid payment amount',
      required: 'Payment information is required to confirm booking',
    },
    vehicle: {
      required: 'Select at least one vehicle to proceed',
      unavailable: 'Try selecting a different date range or vehicle class',
    },
    customer: {
      required: 'Search and select an existing customer or create a new one',
      invalid: 'Customer information appears incomplete',
    },
  };

  // Match field name and error type
  const fieldKey = Object.keys(suggestions).find(key => 
    field.toLowerCase().includes(key)
  );
  
  if (!fieldKey) return undefined;

  const errorKey = Object.keys(suggestions[fieldKey]).find(key =>
    error.toLowerCase().includes(key)
  );

  return errorKey ? suggestions[fieldKey][errorKey] : undefined;
}
