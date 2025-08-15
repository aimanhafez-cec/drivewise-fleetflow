import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Plus, Trash2 } from "lucide-react";

interface LineItem {
  description: string;
  qty: number;
  rate: number;
}

interface QuoteWizardStep4Props {
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export const QuoteWizardStep4: React.FC<QuoteWizardStep4Props> = ({
  data,
  onChange,
  errors,
}) => {
  const items = data.items || [];

  const addItem = () => {
    const newItems = [...items, { description: "", qty: 1, rate: 0 }];
    onChange({ items: newItems });
  };

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_: any, i: number) => i !== index);
    onChange({ items: newItems });
  };

  const subtotal = items.reduce((sum: number, item: LineItem) => sum + (item.qty * item.rate), 0);
  const taxAmount = subtotal * (data.tax_rate || 0);
  const total = subtotal + taxAmount;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing & Line Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Line Items *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <p className="text-muted-foreground">No line items added yet</p>
                <Button variant="outline" size="sm" onClick={addItem} className="mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Item
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item: LineItem, index: number) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-end border p-3 rounded-lg">
                    <div className="col-span-5">
                      <Label htmlFor={`description-${index}`}>Description</Label>
                      <Input
                        id={`description-${index}`}
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                        placeholder="Enter description"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`qty-${index}`}>Qty</Label>
                      <Input
                        id={`qty-${index}`}
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => updateItem(index, "qty", parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`rate-${index}`}>Rate</Label>
                      <Input
                        id={`rate-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => updateItem(index, "rate", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Total</Label>
                      <div className="h-10 flex items-center px-3 border rounded-md bg-muted">
                        {(item.qty * item.rate).toFixed(2)} EGP
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {errors.items && (
              <p className="text-sm text-destructive">{errors.items}</p>
            )}
          </div>

          <Separator />

          {/* Tax Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tax_rate">Tax Rate (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={((data.tax_rate || 0) * 100).toString()}
                onChange={(e) => onChange({ tax_rate: parseFloat(e.target.value) / 100 || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={data.currency || "EGP"} onValueChange={(value) => onChange({ currency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EGP">EGP</SelectItem>
                    </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add-ons */}
      <Card>
        <CardHeader>
          <CardTitle>Add-ons & Extras</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cdw">Collision Damage Waiver</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="cdw"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">per day</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gps">GPS Navigation</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="gps"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">per day</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{subtotal.toFixed(2)} EGP</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({((data.tax_rate || 0) * 100).toFixed(1)}%)</span>
              <span>{taxAmount.toFixed(2)} EGP</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{total.toFixed(2)} EGP</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};