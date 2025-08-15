import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, User, Car, DollarSign } from "lucide-react";

interface QuoteWizardStep5Props {
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export const QuoteWizardStep5: React.FC<QuoteWizardStep5Props> = ({
  data,
  onChange,
  errors,
}) => {
  const subtotal = (data.items || []).reduce((sum: number, item: any) => sum + (item.qty * item.rate), 0);
  const taxAmount = subtotal * (data.tax_rate || 0);
  const total = subtotal + taxAmount;

  // Set default expiry date to 30 days from now if not set
  React.useEffect(() => {
    if (!data.expires_at) {
      const defaultExpiry = new Date();
      defaultExpiry.setDate(defaultExpiry.getDate() + 30);
      onChange({ expires_at: defaultExpiry.toISOString().split('T')[0] });
    }
  }, [data.expires_at, onChange]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quote Review & Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quote Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer
                </h4>
                <div className="text-sm text-muted-foreground">
                  {data.customer_id ? "Customer selected" : "No customer selected"}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Trip Details
                </h4>
                <div className="text-sm space-y-1">
                  {data.pickup_at && (
                    <p>Pickup: {new Date(data.pickup_at).toLocaleString()}</p>
                  )}
                  {data.return_at && (
                    <p>Return: {new Date(data.return_at).toLocaleString()}</p>
                  )}
                  {data.pickup_location && (
                    <p>From: {data.pickup_location}</p>
                  )}
                  {data.return_location && (
                    <p>To: {data.return_location}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Vehicle
                </h4>
                <div className="text-sm text-muted-foreground">
                  {data.vehicle_id ? "Specific vehicle selected" : 
                   data.vehicle_type_id ? "Vehicle category selected" : 
                   "No vehicle selected"}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Pricing Breakdown
              </h4>
              
              <div className="space-y-2 text-sm">
                {(data.items || []).map((item: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.description}</span>
                    <span>${(item.qty * item.rate).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <Separator />
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({((data.tax_rate || 0) * 100).toFixed(1)}%)</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
              </div>

              <Separator />
              
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Quote Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expires_at">Quote Expiry Date *</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={data.expires_at || ""}
                  onChange={(e) => onChange({ expires_at: e.target.value })}
                />
                {errors.expires_at && (
                  <p className="text-sm text-destructive">{errors.expires_at}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bill_to_type">Bill To</Label>
                <Select 
                  value={data.bill_to_type || "customer"} 
                  onValueChange={(value) => onChange({ bill_to_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="insurer">Insurance Company</SelectItem>
                    <SelectItem value="third_party">Third Party</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payment_terms">Payment Terms</Label>
                <Select 
                  value={data.payment_terms || "due_on_pickup"} 
                  onValueChange={(value) => onChange({ payment_terms: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="due_on_pickup">Due on Pickup</SelectItem>
                    <SelectItem value="net_30">Net 30 Days</SelectItem>
                    <SelectItem value="net_15">Net 15 Days</SelectItem>
                    <SelectItem value="advance_payment">Advance Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="po_number">PO/RO Number</Label>
                <Input
                  id="po_number"
                  value={data.po_number || ""}
                  onChange={(e) => onChange({ po_number: e.target.value })}
                  placeholder="Optional reference number"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={data.notes || ""}
              onChange={(e) => onChange({ notes: e.target.value })}
              placeholder="Additional notes or terms..."
              rows={4}
            />
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 pt-4">
            <Badge variant="secondary">Draft</Badge>
            <span className="text-sm text-muted-foreground">
              Quote will be created as draft and can be sent later
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};