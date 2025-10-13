import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CostSheetLine } from '@/hooks/useCostSheet';
import { formatCurrency } from '@/lib/utils/currency';

interface CostSheetVehicleTableProps {
  lines: CostSheetLine[];
  disabled?: boolean;
  onLineUpdate?: (lineId: string, field: string, value: number) => void;
}

export const CostSheetVehicleTable: React.FC<CostSheetVehicleTableProps> = ({
  lines,
  disabled = false,
  onLineUpdate,
}) => {
  const getMarginColor = (margin: number, target: number = 15) => {
    if (margin >= target) return 'text-green-600 dark:text-green-400';
    if (margin >= 10) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getMarginVariant = (margin: number, target: number = 15): { variant: 'default' | 'destructive' | 'outline' | 'secondary', className?: string } => {
    if (margin >= target) return { variant: 'default', className: 'bg-green-500 text-white hover:bg-green-600' };
    if (margin >= 10) return { variant: 'outline', className: 'border-yellow-500 text-yellow-700 dark:text-yellow-400' };
    return { variant: 'destructive' };
  };

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">Line</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead className="text-right">Acquisition Cost</TableHead>
            <TableHead className="text-right">Maintenance/mo</TableHead>
            <TableHead className="text-right">Insurance/mo</TableHead>
            <TableHead className="text-right">Reg/Admin/mo</TableHead>
            <TableHead className="text-right">Other/mo</TableHead>
            <TableHead className="text-right">Total Cost/mo</TableHead>
            <TableHead className="text-right">Suggested Rate</TableHead>
            <TableHead className="text-right">Quoted Rate</TableHead>
            <TableHead className="text-right">Margin</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.map((line) => (
            <TableRow key={line.id}>
              <TableCell className="font-medium">{line.line_no}</TableCell>
              <TableCell>
                <div className="text-sm">
                  {line.vehicle_id ? 'Specific Vehicle' : 'Vehicle Class'}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {disabled ? (
                  formatCurrency(line.acquisition_cost_aed, 'AED')
                ) : (
                  <Input
                    type="number"
                    value={line.acquisition_cost_aed}
                    onChange={(e) => onLineUpdate?.(line.id, 'acquisition_cost_aed', parseFloat(e.target.value))}
                    className="w-28 text-right"
                  />
                )}
              </TableCell>
              <TableCell className="text-right">
                {disabled ? (
                  formatCurrency(line.maintenance_per_month_aed, 'AED')
                ) : (
                  <Input
                    type="number"
                    value={line.maintenance_per_month_aed}
                    onChange={(e) => onLineUpdate?.(line.id, 'maintenance_per_month_aed', parseFloat(e.target.value))}
                    className="w-24 text-right"
                  />
                )}
              </TableCell>
              <TableCell className="text-right">
                {disabled ? (
                  formatCurrency(line.insurance_per_month_aed, 'AED')
                ) : (
                  <Input
                    type="number"
                    value={line.insurance_per_month_aed}
                    onChange={(e) => onLineUpdate?.(line.id, 'insurance_per_month_aed', parseFloat(e.target.value))}
                    className="w-24 text-right"
                  />
                )}
              </TableCell>
              <TableCell className="text-right">
                {disabled ? (
                  formatCurrency(line.registration_admin_per_month_aed, 'AED')
                ) : (
                  <Input
                    type="number"
                    value={line.registration_admin_per_month_aed}
                    onChange={(e) => onLineUpdate?.(line.id, 'registration_admin_per_month_aed', parseFloat(e.target.value))}
                    className="w-24 text-right"
                  />
                )}
              </TableCell>
              <TableCell className="text-right">
                {disabled ? (
                  formatCurrency(line.other_costs_per_month_aed, 'AED')
                ) : (
                  <Input
                    type="number"
                    value={line.other_costs_per_month_aed}
                    onChange={(e) => onLineUpdate?.(line.id, 'other_costs_per_month_aed', parseFloat(e.target.value))}
                    className="w-24 text-right"
                  />
                )}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(line.total_cost_per_month_aed, 'AED')}
              </TableCell>
              <TableCell className="text-right text-green-600 dark:text-green-400 font-semibold">
                {formatCurrency(line.suggested_rate_per_month_aed, 'AED')}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(line.quoted_rate_per_month_aed, 'AED')}
              </TableCell>
              <TableCell className="text-right">
                {(() => {
                  const config = getMarginVariant(line.actual_margin_percent);
                  return (
                    <Badge variant={config.variant} className={config.className}>
                      {line.actual_margin_percent.toFixed(1)}%
                    </Badge>
                  );
                })()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};