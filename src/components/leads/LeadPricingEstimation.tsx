import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { DollarSign } from 'lucide-react';
import { Lead } from '@/data/mockLeads';

interface LeadPricingEstimationProps {
  lead: Lead;
}

const addOns = [
  { id: 'cdw', name: 'Collision Damage Waiver (CDW)', price: 45, perDay: true },
  { id: 'scdw', name: 'Super CDW (Zero Excess)', price: 75, perDay: true },
  { id: 'pai', name: 'Personal Accident Insurance', price: 30, perDay: true },
  { id: 'gps', name: 'GPS Navigation', price: 150, perDay: false },
  { id: 'child_seat', name: 'Child Seat', price: 100, perDay: false },
  { id: 'additional_driver', name: 'Additional Driver', price: 200, perDay: false },
  { id: 'airport_delivery', name: 'Airport Delivery/Pickup', price: 150, perDay: false },
  { id: 'fuel_full', name: 'Full Fuel Tank Service', price: 200, perDay: false },
];

export const LeadPricingEstimation = ({ lead }: LeadPricingEstimationProps) => {
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  
  const dailyRate = Math.round(lead.estimated_value / lead.duration_days);
  const baseTotal = lead.estimated_value;
  
  const addOnsTotal = selectedAddOns.reduce((sum, addonId) => {
    const addon = addOns.find(a => a.id === addonId);
    if (!addon) return sum;
    return sum + (addon.perDay ? addon.price * lead.duration_days : addon.price);
  }, 0);
  
  const subtotal = baseTotal + addOnsTotal;
  const vat = subtotal * 0.05; // 5% VAT in UAE
  const grandTotal = subtotal + vat;

  const toggleAddOn = (addonId: string) => {
    setSelectedAddOns(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Pricing Estimation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Base Rate */}
        <div className="space-y-2">
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">Base Rate</p>
              <p className="text-sm text-muted-foreground">
                AED {dailyRate.toLocaleString()}/day × {lead.duration_days} days
              </p>
            </div>
            <p className="text-lg font-semibold">AED {baseTotal.toLocaleString()}</p>
          </div>
        </div>

        <Separator />

        {/* Add-ons */}
        <div className="space-y-3">
          <p className="font-medium">Available Add-ons</p>
          {addOns.map((addon) => {
            const isSelected = selectedAddOns.includes(addon.id);
            const addonPrice = addon.perDay ? addon.price * lead.duration_days : addon.price;
            
            return (
              <div
                key={addon.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-primary/5 border-primary'
                    : 'bg-muted/30 border-border hover:bg-muted/50'
                }`}
                onClick={() => toggleAddOn(addon.id)}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleAddOn(addon.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{addon.name}</p>
                  <p className="text-xs text-muted-foreground">
                    AED {addon.price.toLocaleString()}
                    {addon.perDay && '/day'}
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  +AED {addonPrice.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Total Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">AED {subtotal.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">VAT (5%)</span>
            <span className="font-medium">AED {Math.round(vat).toLocaleString()}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
            <span className="text-lg font-semibold">Estimated Total</span>
            <span className="text-2xl font-bold text-primary">
              AED {Math.round(grandTotal).toLocaleString()}
            </span>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Final price may vary based on actual rental conditions and any additional charges
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
