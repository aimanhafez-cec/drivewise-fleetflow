import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { VehicleLineDetails } from "./VehicleLineDetails";
import { format } from "date-fns";

interface VehicleLineTableProps {
  lines: any[];
  onUpdate: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
  errors: Record<string, string>;
  depositType: string;
  selectedLines: number[];
  onSelectLine: (lineNo: number) => void;
  onSelectAll: () => void;
  headerDefaults?: {
    deposit_amount?: number;
    advance_rent_months?: number;
    insurance_coverage_package?: string;
    insurance_excess_aed?: number;
    insurance_glass_tire_cover?: boolean;
    insurance_pai_enabled?: boolean;
    insurance_territorial_coverage?: string;
    pickup_type?: string;
    pickup_location_id?: string;
    pickup_customer_site_id?: string;
    return_type?: string;
    return_location_id?: string;
    return_customer_site_id?: string;
    delivery_fee?: number;
    collection_fee?: number;
    default_price_list_id?: string;
    billing_plan?: string;
  };
}

export const VehicleLineTable: React.FC<VehicleLineTableProps> = ({
  lines,
  onUpdate,
  onRemove,
  errors,
  depositType,
  selectedLines,
  onSelectLine,
  onSelectAll,
  headerDefaults = {},
}) => {
  const [expandedLines, setExpandedLines] = useState<number[]>([]);

  const toggleExpand = (lineNo: number) => {
    setExpandedLines(prev => 
      prev.includes(lineNo) 
        ? prev.filter(l => l !== lineNo)
        : [...prev, lineNo]
    );
  };

  const calculateUpfront = (line: any) => {
    const deposit = line.deposit_amount || 0;
    const advance = (line.advance_rent_months || 0) * (line.monthly_rate || 0);
    return deposit + advance;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), 'dd MMM yyyy');
    } catch {
      return 'Invalid';
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead className="w-12 text-center">
              <Checkbox
                checked={selectedLines.length === lines.length && lines.length > 0}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead className="w-12">#</TableHead>
            <TableHead className="min-w-[140px]">Item Code</TableHead>
            <TableHead className="min-w-[250px]">Item Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead className="text-right">Duration</TableHead>
            <TableHead className="text-right">Monthly Rate</TableHead>
            <TableHead className="text-right">Upfront Total</TableHead>
            <TableHead className="w-32 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.map((line, index) => {
            const isExpanded = expandedLines.includes(line.line_no);
            
            // Generate item code on the fly if missing (for legacy data)
            const itemCode = line._vehicleMeta?.item_code || 
              (line._vehicleMeta ? 
                `${line._vehicleMeta.make.substring(0,3)}-${line._vehicleMeta.model.substring(0,3)}-${line._vehicleMeta.year}`.toUpperCase() 
                : 'N/A');
            
            const itemDescription = line._vehicleMeta?.item_description || 
              (line._vehicleMeta ? 
                `${line._vehicleMeta.make} ${line._vehicleMeta.model} ${line._vehicleMeta.year} - ${line._vehicleMeta.category_name}` 
                : 'Not selected');
            
            const category = line._vehicleMeta?.category_name || 'N/A';
            
            return (
              <React.Fragment key={line.line_no}>
                <TableRow className="hover:bg-muted/50">
                  <TableCell className="text-center">
                    <Checkbox
                      checked={selectedLines.includes(line.line_no)}
                      onCheckedChange={() => onSelectLine(line.line_no)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{line.line_no}</TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-primary">
                    {itemCode}
                  </TableCell>
                  <TableCell className="font-medium">
                    {itemDescription}
                    {line._vehicleMeta?.color && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Color: {line._vehicleMeta.color}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="inline-block max-w-[120px] truncate">
                      {category}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(line.pickup_at)}</TableCell>
                  <TableCell className="text-right">{line.duration_months || 0} mo</TableCell>
                  <TableCell className="text-right">{line.monthly_rate || 0} AED</TableCell>
                  <TableCell className="text-right font-bold">
                    {calculateUpfront(line).toFixed(2)} AED
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(line.line_no)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                
                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={10} className="bg-muted/30 p-6">
                      <VehicleLineDetails
                        line={line}
                        onUpdate={(field, value) => onUpdate(index, field, value)}
                        errors={errors}
                        depositType={depositType}
                        headerDefaults={headerDefaults}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
      
      {lines.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No vehicle lines added yet</p>
          <p className="text-sm mt-1">Click "Select Vehicles" to add multiple vehicles at once</p>
        </div>
      )}
    </div>
  );
};
