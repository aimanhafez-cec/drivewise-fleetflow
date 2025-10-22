import { memo, ReactNode } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';

interface DashboardSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Memoized wrapper for dashboard sections with error boundaries
 * and staggered fade-in animations
 */
export const DashboardSection = memo(function DashboardSection({
  children,
  className = '',
  delay = 0
}: DashboardSectionProps) {
  return (
    <ErrorBoundary>
      <section 
        className={`animate-fade-in ${className}`}
        style={{ animationDelay: `${delay}s` }}
      >
        {children}
      </section>
    </ErrorBoundary>
  );
});
