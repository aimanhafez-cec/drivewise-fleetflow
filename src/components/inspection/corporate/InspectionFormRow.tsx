import { cn } from '@/lib/utils';

interface InspectionFormRowProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

export function InspectionFormRow({ children, columns = 3, className }: InspectionFormRowProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        columns === 2 && 'grid-cols-1 md:grid-cols-2',
        columns === 1 && 'grid-cols-1',
        className
      )}
    >
      {children}
    </div>
  );
}
