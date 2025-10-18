import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { VehicleLineDetails } from "./VehicleLineDetails";
import { format } from "date-fns";
import { AddOnLine } from "./AddOnsTable";
import { formatCurrency } from "@/lib/utils/currency";

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
    default_price_list_id?: string;
    billing_plan?: string;
    default_delivery_fee?: number;
    default_collection_fee?: number;
    maintenance_included?: boolean;
    maintenance_package_type?: string;
    monthly_maintenance_cost_per_vehicle?: number;
    maintenance_plan_source?: string;
    show_maintenance_separate_line?: boolean;
    default_addons?: AddOnLine[];
    initial_fees?: Array<{
      fee_type: string;
      fee_type_label?: string;
      description: string;
      amount: number;
    }>;
    customer_id?: string;
    mileage_pooling_enabled?: boolean;
    pooled_mileage_allowance_km?: number;
    pooled_excess_km_rate?: number;
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
    const delivery = line.delivery_fee || 0;
    const collection = line.collection_fee || 0;
    return deposit + advance + delivery + collection;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), 'dd MMM yyyy');
    } catch {
      return 'Invalid';
    }
  };

  const displayDuration = (line: any): string => {
    // If we have a stored duration, use it
    if (line.duration_months && line.duration_months > 0) {
      return `${line.duration_months} mo`;
    }
    
    // Calculate on-the-fly if dates exist
    if (line.pickup_at && line.return_at) {
      const from = new Date(line.pickup_at);
      const to = new Date(line.return_at);
      const diffTime = Math.abs(to.getTime() - from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const months = Math.round(diffDays / 30.44);
      return `${months} mo`;
    }
    
    return "0 mo";
  };

  return (
    <div className="border rounded-lg overflow-x-auto w-full">
      <Table className="min-w-[1600px]">
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead className="min-w-[50px] w-12 text-center">
              <Checkbox
                checked={selectedLines.length === lines.length && lines.length > 0}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead className="min-w-[50px] w-12">#</TableHead>
            <TableHead className="min-w-[70px] w-16 text-center"></TableHead>
            <TableHead className="min-w-[150px]">Contract No.</TableHead>
            <TableHead className="min-w-[180px]">Item Code</TableHead>
            <TableHead className="min-w-[350px]">Item Description</TableHead>
            <TableHead className="min-w-[150px]">Category</TableHead>
            <TableHead className="min-w-[130px]">Start Date</TableHead>
            <TableHead className="text-right min-w-[110px]">Duration</TableHead>
            <TableHead className="text-right min-w-[150px]">Monthly Rate</TableHead>
            <TableHead className="text-right min-w-[180px]">Delivery & Collection</TableHead>
            <TableHead className="text-right min-w-[150px]">Upfront Total</TableHead>
            <TableHead className="min-w-[80px] w-20 text-center">Delete</TableHead>
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
                  <TableCell className="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(line.line_no)}
                      className="h-8 w-8 p-0"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="font-mono text-sm font-bold text-primary">
                    {line.contract_no || 'TBD'}
                  </TableCell>
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
                  <TableCell className="text-right">{displayDuration(line)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(line.monthly_rate || 0)}</TableCell>
                  <TableCell className="text-right">
                    <div className="space-y-1">
                      {/* Delivery Fee */}
                      {((line.pickup_type ?? headerDefaults.pickup_type ?? "company_location") === "customer_site") ? (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Delivery: </span>
                          {line.delivery_fee !== undefined && line.delivery_fee !== (headerDefaults.default_delivery_fee ?? 0) && (
                            <Badge variant="secondary" className="text-[10px] mr-1 px-1 py-0">Custom</Badge>
                          )}
                          <span className="font-medium">{(line.delivery_fee ?? headerDefaults.default_delivery_fee ?? 0).toFixed(2)} AED</span>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">Delivery: N/A</div>
                      )}
                      
                      {/* Collection Fee */}
                      {((line.return_type ?? headerDefaults.return_type ?? "company_location") === "customer_site") ? (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Collection: </span>
                          {line.collection_fee !== undefined && line.collection_fee !== (headerDefaults.default_collection_fee ?? 0) && (
                            <Badge variant="secondary" className="text-[10px] mr-1 px-1 py-0">Custom</Badge>
                          )}
                          <span className="font-medium">{(line.collection_fee ?? headerDefaults.default_collection_fee ?? 0).toFixed(2)} AED</span>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">Collection: N/A</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {calculateUpfront(line).toFixed(2)} AED
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(index)}
                      className="text-destructive hover:text-destructive h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                
                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={13} className="bg-muted/30 p-6">
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
