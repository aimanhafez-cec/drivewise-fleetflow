import React from 'react';
import { cn } from '@/lib/utils';

interface FormErrorProps {
  message?: string;
  className?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ message, className }) => {
  if (!message) return null;
  
  return (
    <p className={cn("text-sm text-red-500 mt-1", className)}>
      {message}
    </p>
  );
};