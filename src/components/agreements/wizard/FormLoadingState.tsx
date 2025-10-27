import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface FormLoadingStateProps {
  message?: string;
  fields?: number;
}

export const FormLoadingState: React.FC<FormLoadingStateProps> = ({
  message = 'Loading...',
  fields = 4,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <Skeleton className="h-6 w-48" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <div className="flex justify-center py-4">
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
};
