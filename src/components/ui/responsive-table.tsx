import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  children,
  className
}) => {
  return (
    <div className="overflow-x-auto">
      <Table className={cn("min-w-full", className)}>
        {children}
      </Table>
    </div>
  );
};

interface ResponsiveTableHeadProps {
  children: React.ReactNode;
  className?: string;
  hideOn?: 'sm' | 'md' | 'lg' | 'xl';
  minWidth?: string;
}

export const ResponsiveTableHead: React.FC<ResponsiveTableHeadProps> = ({
  children,
  className,
  hideOn,
  minWidth = '100px'
}) => {
  const hideClass = hideOn ? `hidden ${hideOn}:table-cell` : '';
  
  return (
    <TableHead 
      className={cn(
        `min-w-[${minWidth}]`,
        hideClass,
        className
      )}
    >
      {children}
    </TableHead>
  );
};

interface ResponsiveTableCellProps {
  children: React.ReactNode;
  className?: string;
  hideOn?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ResponsiveTableCell: React.FC<ResponsiveTableCellProps> = ({
  children,
  className,
  hideOn
}) => {
  const hideClass = hideOn ? `hidden ${hideOn}:table-cell` : '';
  
  return (
    <TableCell className={cn(hideClass, className)}>
      {children}
    </TableCell>
  );
};

// Mobile-first table card component for smaller screens
interface MobileTableCardProps {
  data: any[];
  renderCard: (item: any, index: number) => React.ReactNode;
  className?: string;
}

export const MobileTableCard: React.FC<MobileTableCardProps> = ({
  data,
  renderCard,
  className
}) => {
  return (
    <div className={cn("space-y-4 md:hidden", className)}>
      {data.map((item, index) => renderCard(item, index))}
    </div>
  );
};

// Hybrid table component that shows table on desktop and cards on mobile
interface HybridTableProps {
  data: any[];
  tableContent: React.ReactNode;
  renderMobileCard: (item: any, index: number) => React.ReactNode;
  className?: string;
}

export const HybridTable: React.FC<HybridTableProps> = ({
  data,
  tableContent,
  renderMobileCard,
  className
}) => {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block">
        <ResponsiveTable className={className}>
          {tableContent}
        </ResponsiveTable>
      </div>
      
      {/* Mobile Cards */}
      <MobileTableCard 
        data={data} 
        renderCard={renderMobileCard}
        className={className}
      />
    </>
  );
};