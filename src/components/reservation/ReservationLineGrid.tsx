import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Edit, Copy, Eye, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ReservationLine } from '@/types/reservation';
import { LineDetailsModal } from './LineDetailsModal';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useVehicles, useVehicleCategories, formatVehicleDisplay } from '@/hooks/useVehicles';

interface ReservationLineGridProps {
  lines: ReservationLine[];
  onLineUpdate: (lineId: string, updates: Partial<ReservationLine>) => void;
  onLineRemove: (lineId: string) => void;
  onLineDuplicate: (lineId: string) => void;
  onSelectionChange: (selectedIds: string[]) => void;
  selectedLines: string[];
}

export const ReservationLineGrid: React.FC<ReservationLineGridProps> = ({
  lines,
  onLineUpdate,
  onLineRemove,
  onLineDuplicate,
  onSelectionChange,
  selectedLines
}) => {
  const [editingCell, setEditingCell] = useState<{ lineId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showMoreModal, setShowMoreModal] = useState<ReservationLine | null>(null);
  
  // Fetch real vehicle and category data
  const { data: vehicles, isLoading: vehiclesLoading } = useVehicles();
  const { data: categories, isLoading: categoriesLoading } = useVehicleCategories();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(lines.map(line => line.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectLine = (lineId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedLines, lineId]);
    } else {
      onSelectionChange(selectedLines.filter(id => id !== lineId));
    }
  };

  const handleCellDoubleClick = (lineId: string, field: string, currentValue: any) => {
    setEditingCell({ lineId, field });
    setEditValue(String(currentValue || ''));
  };

  const handleCellBlur = () => {
    if (editingCell) {
      const { lineId, field } = editingCell;
      let value: any = editValue;
      
      // Convert value based on field type
      if (field === 'lineNetPrice' || field === 'lineTotal' || field === 'taxValue') {
        value = parseFloat(editValue) || 0;
      } else if (field === 'checkOutDate' || field === 'checkInDate') {
        value = editValue ? new Date(editValue) : null;
      }
      
      onLineUpdate(lineId, { [field]: value });
      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellBlur();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  };

  if (lines.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No reservation lines added yet. Fill out vehicle information and click "Add Line" to get started.
      </div>
    );
  }

  return (
    <div id="grid-reservation-lines" className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox 
                checked={selectedLines.length === lines.length && lines.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Line No.</TableHead>
            <TableHead>Reservation Type</TableHead>
            <TableHead>Vehicle Class</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Primary Driver</TableHead>
            <TableHead>Check Out</TableHead>
            <TableHead>Check In</TableHead>
            <TableHead>Line Net Price</TableHead>
            <TableHead>Tax Value</TableHead>
            <TableHead>Line Total</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.map((line) => {
            const isSelected = selectedLines.includes(line.id);
            return (
              <TableRow key={line.id} className={cn(isSelected && "bg-muted/50")} data-id={`row-${line.lineNo}`}>
                <TableCell>
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={(checked) => handleSelectLine(line.id, Boolean(checked))}
                  />
                </TableCell>
                <TableCell className="font-medium">{line.lineNo}</TableCell>
                <TableCell>
                  <Select 
                    value={line.reservationTypeId} 
                    onValueChange={(value) => onLineUpdate(line.id, { reservationTypeId: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select 
                    value={line.vehicleClassId} 
                    onValueChange={(value) => onLineUpdate(line.id, { vehicleClassId: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesLoading ? (
                        <SelectItem value="__loading__" disabled>Loading categories...</SelectItem>
                      ) : categories?.length === 0 ? (
                        <SelectItem value="__no_categories__" disabled>No categories available</SelectItem>
                      ) : (
                        categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select 
                    value={line.vehicleId} 
                    onValueChange={(value) => onLineUpdate(line.id, { vehicleId: value })}
                  >
                     <SelectTrigger className="w-40">
                       <SelectValue placeholder="Vehicle" />
                     </SelectTrigger>
                     <SelectContent>
                       {vehiclesLoading ? (
                         <SelectItem value="__loading__" disabled>Loading vehicles...</SelectItem>
                       ) : vehicles?.length === 0 ? (
                         <SelectItem value="__no_vehicles__" disabled>No vehicles available</SelectItem>
                       ) : (
                         vehicles?.map((vehicle) => (
                           <SelectItem key={vehicle.id} value={vehicle.id}>
                             {formatVehicleDisplay(vehicle)}
                           </SelectItem>
                         ))
                       )}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {line.drivers && line.drivers.length > 0 ? (
                      <>
                        <span className="text-sm">
                          {line.drivers.find(d => d.role === 'PRIMARY')?.driverId || 'None'}
                        </span>
                        {line.drivers.length > 1 && (
                          <Badge variant="secondary" className="text-xs">
                            +{line.drivers.length - 1} more
                          </Badge>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">No drivers</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {line.checkOutDate ? format(line.checkOutDate, 'MMM dd, yyyy HH:mm') : 'Not set'}
                </TableCell>
                <TableCell className="text-sm">
                  {line.checkInDate ? format(line.checkInDate, 'MMM dd, yyyy HH:mm') : 'Not set'}
                </TableCell>
                <TableCell>
                  {editingCell?.lineId === line.id && editingCell?.field === 'lineNetPrice' ? (
                    <Input 
                      type="number"
                      step="0.01"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleCellBlur}
                      onKeyDown={handleKeyDown}
                      className="w-24"
                      autoFocus
                    />
                  ) : (
                    <div 
                      className="min-h-[40px] flex items-center px-2 cursor-pointer hover:bg-muted/50 rounded font-mono"
                      onDoubleClick={() => handleCellDoubleClick(line.id, 'lineNetPrice', line.lineNetPrice)}
                    >
                      {line.lineNetPrice.toFixed(2)}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {editingCell?.lineId === line.id && editingCell?.field === 'taxValue' ? (
                    <Input 
                      type="number"
                      step="0.01"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleCellBlur}
                      onKeyDown={handleKeyDown}
                      className="w-24"
                      autoFocus
                    />
                  ) : (
                    <div 
                      className="min-h-[40px] flex items-center px-2 cursor-pointer hover:bg-muted/50 rounded font-mono"
                      onDoubleClick={() => handleCellDoubleClick(line.id, 'taxValue', line.taxValue)}
                    >
                      {line.taxValue.toFixed(2)}
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium font-mono">
                  {line.lineTotal.toFixed(2)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMoreModal(line)}
                      className="h-8 w-8 p-0"
                      id={`icon-show-more-${line.lineNo}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setShowMoreModal(line)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Edit inline
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onLineDuplicate(line.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onLineRemove(line.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      <LineDetailsModal
        line={showMoreModal}
        isOpen={!!showMoreModal}
        onClose={() => setShowMoreModal(null)}
        onSave={onLineUpdate}
        onDelete={onLineRemove}
      />
    </div>
  );
};
