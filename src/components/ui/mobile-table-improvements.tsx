import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Mobile-optimized table row card
interface MobileRowCardProps {
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  };
  fields: Array<{
    label: string;
    value: React.ReactNode;
    hideOnMobile?: boolean;
  }>;
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const MobileRowCard: React.FC<MobileRowCardProps> = ({
  title,
  subtitle,
  badge,
  fields,
  actions,
  onClick,
  className
}) => {
  return (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-md transition-shadow",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base sm:text-lg truncate">{title}</CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
          {badge && (
            <Badge 
              variant={badge.variant || 'default'} 
              className={cn("ml-2 shrink-0", badge.className)}
            >
              {badge.text}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {fields.filter(field => !field.hideOnMobile).map((field, index) => (
            <div key={index} className="space-y-1">
              <span className="text-muted-foreground">{field.label}</span>
              <div className="font-medium">{field.value}</div>
            </div>
          ))}
        </div>
        
        {actions && (
          <div className="pt-2 border-t flex justify-end">
            {actions}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Wrapper for responsive table behavior
interface ResponsiveTableWrapperProps {
  children: React.ReactNode;
  mobileCards?: React.ReactNode;
  className?: string;
}

export const ResponsiveTableWrapper: React.FC<ResponsiveTableWrapperProps> = ({
  children,
  mobileCards,
  className
}) => {
  return (
    <div className={className}>
      {/* Desktop/Tablet Table */}
      <div className="hidden md:block overflow-x-auto">
        {children}
      </div>
      
      {/* Mobile Cards */}
      {mobileCards && (
        <div className="md:hidden space-y-4">
          {mobileCards}
        </div>
      )}
    </div>
  );
};

// Hook for mobile detection (already exists, but here for completeness)
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};