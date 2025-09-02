import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Enhanced mobile table card component
interface MobileTableCardProps {
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
    className?: string;
    fullWidth?: boolean;
  }>;
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  headerIcon?: React.ReactNode;
}

export const MobileTableCard: React.FC<MobileTableCardProps> = ({
  title,
  subtitle,
  badge,
  fields,
  actions,
  onClick,
  className,
  headerIcon
}) => {
  return (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-md transition-all duration-200 border-border",
        "bg-card text-card-foreground",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              {headerIcon && <span className="shrink-0">{headerIcon}</span>}
              <h3 className="text-base sm:text-lg font-semibold truncate text-card-foreground">
                {title}
              </h3>
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
          {badge && (
            <Badge 
              variant={badge.variant || 'default'} 
              className={cn("ml-2 shrink-0 text-xs", badge.className)}
            >
              {badge.text}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3 text-sm">
          {fields.map((field, index) => (
            <div 
              key={index} 
              className={cn(
                field.fullWidth ? "col-span-full" : "",
                "space-y-1",
                field.className
              )}
            >
              <span className="text-muted-foreground font-medium text-xs uppercase tracking-wide">
                {field.label}
              </span>
              <div className="font-medium text-card-foreground leading-snug">
                {field.value}
              </div>
            </div>
          ))}
        </div>
        
        {actions && (
          <div className="pt-3 border-t border-border flex flex-wrap gap-2 justify-end">
            {actions}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Responsive wrapper that shows table on desktop and cards on mobile
interface ResponsiveTableViewProps {
  data: any[];
  tableContent: React.ReactNode;
  renderMobileCard: (item: any, index: number) => React.ReactNode;
  className?: string;
  emptyState?: React.ReactNode;
}

export const ResponsiveTableView: React.FC<ResponsiveTableViewProps> = ({
  data,
  tableContent,
  renderMobileCard,
  className,
  emptyState
}) => {
  if (data.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>;
  }

  return (
    <div className={className}>
      {/* Desktop Table */}
      <div className="hidden md:block">
        {tableContent}
      </div>
      
      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data.map((item, index) => renderMobileCard(item, index))}
      </div>
    </div>
  );
};