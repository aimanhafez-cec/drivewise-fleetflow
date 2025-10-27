import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { HelperTooltip } from './HelperTooltip';
import { cn } from '@/lib/utils';
import { Sparkles, AlertCircle } from 'lucide-react';

interface EnhancedFormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'number' | 'email' | 'tel' | 'datetime-local' | 'date' | 'textarea';
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  tooltip?: string;
  
  // Smart defaults
  hasSmartDefault?: boolean;
  smartDefaultValue?: string;
  
  // Validation
  pattern?: string;
  min?: number;
  max?: number;
  maxLength?: number;
  
  // Appearance
  disabled?: boolean;
  className?: string;
  rows?: number; // For textarea
}

export const EnhancedFormField: React.FC<EnhancedFormFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helperText,
  tooltip,
  hasSmartDefault = false,
  smartDefaultValue,
  pattern,
  min,
  max,
  maxLength,
  disabled = false,
  className,
  rows = 3,
}) => {
  const hasError = !!error;
  const showSmartBadge = hasSmartDefault && smartDefaultValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange(newValue);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor={id} className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-destructive')}>
            {label}
          </Label>
          {tooltip && <HelperTooltip content={tooltip} />}
        </div>
        {showSmartBadge && (
          <Badge variant="secondary" className="gap-1 text-xs">
            <Sparkles className="h-3 w-3" />
            Auto: {smartDefaultValue}
          </Badge>
        )}
      </div>

      {type === 'textarea' ? (
        <Textarea
          id={id}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          rows={rows}
          className={cn(
            hasError && 'border-destructive focus-visible:ring-destructive',
            'transition-all'
          )}
        />
      ) : (
        <Input
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          pattern={pattern}
          min={min}
          max={max}
          maxLength={maxLength}
          className={cn(
            hasError && 'border-destructive focus-visible:ring-destructive',
            'transition-all'
          )}
        />
      )}

      {/* Helper text or error */}
      {(helperText || error) && (
        <div className={cn(
          'flex items-start gap-1.5 text-sm animate-fade-in',
          error ? 'text-destructive' : 'text-muted-foreground'
        )}>
          {error && <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />}
          <p>{error || helperText}</p>
        </div>
      )}

      {/* Character count for textarea */}
      {type === 'textarea' && maxLength && (
        <div className="flex justify-end">
          <p className="text-xs text-muted-foreground">
            {String(value).length} / {maxLength}
          </p>
        </div>
      )}
    </div>
  );
};
