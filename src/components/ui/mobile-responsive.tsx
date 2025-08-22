import React from 'react';
import { cn } from '@/lib/utils';

interface MobileResponsiveProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
}

export const MobileResponsive: React.FC<MobileResponsiveProps> = ({
  children,
  className,
  mobileClassName,
  tabletClassName,
  desktopClassName
}) => {
  return (
    <div
      className={cn(
        className,
        mobileClassName && `sm:hidden ${mobileClassName}`,
        tabletClassName && `hidden sm:block lg:hidden ${tabletClassName}`,
        desktopClassName && `hidden lg:block ${desktopClassName}`
      )}
    >
      {children}
    </div>
  );
};

// Hook for mobile detection
export const useMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// Responsive grid wrapper
interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: string;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'gap-4',
  className
}) => {
  const gridCols = cn(
    'grid',
    gap,
    cols.mobile && `grid-cols-${cols.mobile}`,
    cols.tablet && `sm:grid-cols-${cols.tablet}`,
    cols.desktop && `lg:grid-cols-${cols.desktop}`,
    className
  );

  return (
    <div className={gridCols}>
      {children}
    </div>
  );
};