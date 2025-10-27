import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, Edit2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineEditableFieldProps {
  value: string | number;
  onSave: (value: string) => Promise<void> | void;
  className?: string;
  displayClassName?: string;
  inputClassName?: string;
  type?: 'text' | 'number' | 'email' | 'tel' | 'date';
  placeholder?: string;
  disabled?: boolean;
  formatter?: (value: string | number) => string;
  validator?: (value: string) => boolean | string;
}

export const InlineEditableField: React.FC<InlineEditableFieldProps> = ({
  value,
  onSave,
  className,
  displayClassName,
  inputClassName,
  type = 'text',
  placeholder,
  disabled = false,
  formatter,
  validator,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (!disabled) {
      setEditValue(String(value));
      setError(null);
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setEditValue(String(value));
    setError(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    // Validation
    if (validator) {
      const validationResult = validator(editValue);
      if (validationResult !== true) {
        setError(typeof validationResult === 'string' ? validationResult : 'Invalid value');
        return;
      }
    }

    // Check if value changed
    if (editValue === String(value)) {
      setIsEditing(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onSave(editValue);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const displayValue = formatter ? formatter(value) : value;

  if (!isEditing) {
    return (
      <div className={cn('group relative inline-flex items-center gap-2', className)}>
        <span className={cn('cursor-pointer', displayClassName)} onClick={handleEdit}>
          {displayValue}
        </span>
        {!disabled && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleEdit}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1">
        <Input
          ref={inputRef}
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className={cn('h-8', inputClassName, error && 'border-destructive')}
        />
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
          onClick={handleCancel}
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
