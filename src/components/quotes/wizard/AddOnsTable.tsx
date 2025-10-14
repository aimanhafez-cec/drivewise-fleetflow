import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Package } from "lucide-react";
import { useAddonItems } from "@/hooks/useAddonItems";
import { formatCurrency } from "@/lib/utils/currency";
import { Badge } from "@/components/ui/badge";

export interface AddOnLine {
  id: string; // UUID from addon_items table or temp ID for custom
  item_code: string;
  item_name: string;
  pricing_model: 'monthly' | 'one-time';
  quantity: number;
  unit_price: number;
  total: number;
  is_custom?: boolean; // True if manually added, not from catalog
}

interface AddOnsTableProps {
  addons: AddOnLine[];
  onChange: (addons: AddOnLine[]) => void;
}

export const AddOnsTable: React.FC<AddOnsTableProps> = ({ addons, onChange }) => {
  const { data: catalogItems = [], isLoading } = useAddonItems();

  const addLineFromCatalog = (catalogItemId: string) => {
    const catalogItem = catalogItems.find(item => item.id === catalogItemId);
    if (!catalogItem) return;

    const newLine: AddOnLine = {
      id: catalogItem.id,
      item_code: catalogItem.item_code,
      item_name: catalogItem.item_name,
      pricing_model: catalogItem.pricing_model,
      quantity: 1,
      unit_price: catalogItem.default_unit_price,
      total: catalogItem.default_unit_price,
      is_custom: false,
    };

    onChange([...addons, newLine]);
  };

  const addCustomLine = () => {
    const newLine: AddOnLine = {
      id: `custom-${Date.now()}`,
      item_code: '',
      item_name: '',
      pricing_model: 'monthly',
      quantity: 1,
      unit_price: 0,
      total: 0,
      is_custom: true,
    };

    onChange([...addons, newLine]);
  };

  const removeLine = (index: number) => {
    const updated = [...addons];
    updated.splice(index, 1);
    onChange(updated);
  };

  const updateLine = (index: number, field: keyof AddOnLine, value: any) => {
    const updated = [...addons];
    updated[index] = { ...updated[index], [field]: value };
    
    // Recalculate total when quantity or unit_price changes
    if (field === 'quantity' || field === 'unit_price') {
      updated[index].total = updated[index].quantity * updated[index].unit_price;
    }

    onChange(updated);
  };

  const totalMonthly = addons
    .filter(a => a.pricing_model === 'monthly')
    .reduce((sum, a) => sum + a.total, 0);

  const totalOneTime = addons
    .filter(a => a.pricing_model === 'one-time')
    .reduce((sum, a) => sum + a.total, 0);

  return (
    <div className="space-y-4">
      {/* Add Controls */}
      <div className="flex flex-wrap gap-2">
        <Select onValueChange={addLineFromCatalog} disabled={isLoading}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select from catalog..." />
          </SelectTrigger>
          <SelectContent>
            {catalogItems.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                <div className="flex items-center gap-2">
                  <span>{item.item_name}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.pricing_model === 'monthly' ? 'Monthly' : 'One-time'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(item.default_unit_price)}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="button" variant="outline" size="sm" onClick={addCustomLine}>
          <Plus className="h-4 w-4 mr-1" />
          Add Custom Item
        </Button>
      </div>

      {/* Table */}
      {addons.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Item Code</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead className="w-[120px]">Type</TableHead>
                <TableHead className="w-[100px]">Qty</TableHead>
                <TableHead className="w-[130px]">Unit Price (AED)</TableHead>
                <TableHead className="w-[130px]">Total (AED)</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {addons.map((addon, index) => (
                <TableRow key={`${addon.id}-${index}`}>
                  <TableCell>
                    {addon.is_custom ? (
                      <Input
                        value={addon.item_code}
                        onChange={(e) => updateLine(index, 'item_code', e.target.value)}
                        placeholder="CODE-001"
                        className="h-8"
                      />
                    ) : (
                      <span className="text-sm font-mono">{addon.item_code}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {addon.is_custom ? (
                      <Input
                        value={addon.item_name}
                        onChange={(e) => updateLine(index, 'item_name', e.target.value)}
                        placeholder="Item name..."
                        className="h-8"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{addon.item_name}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {addon.is_custom ? (
                      <Select
                        value={addon.pricing_model}
                        onValueChange={(value: 'monthly' | 'one-time') =>
                          updateLine(index, 'pricing_model', value)
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="one-time">One-time</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        {addon.pricing_model === 'monthly' ? 'Monthly' : 'One-time'}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={addon.quantity}
                      onChange={(e) => updateLine(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={addon.unit_price}
                      onChange={(e) => updateLine(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{formatCurrency(addon.total)}</span>
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLine(index)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totals Footer */}
          <div className="border-t bg-muted/30 p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monthly Add-Ons Total:</span>
              <span className="font-semibold">{formatCurrency(totalMonthly)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">One-Time Add-Ons Total:</span>
              <span className="font-semibold">{formatCurrency(totalOneTime)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No add-ons selected</p>
          <p className="text-xs mt-1">Select from catalog or add custom items</p>
        </div>
      )}
    </div>
  );
};
