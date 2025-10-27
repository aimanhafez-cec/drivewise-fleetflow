import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Shield, AlertCircle, TrendingUp } from 'lucide-react';
import { Lead } from '@/hooks/useLeadsRealtime';

interface LeadPricingEstimationProps {
  lead: Lead;
}

const addOns = [
  { id: 'cdw', name: 'Collision Damage Waiver (CDW)', price: 45, perDay: true, icon: Shield },
  { id: 'scdw', name: 'Super CDW (Zero Excess)', price: 75, perDay: true, icon: Shield },
  { id: 'pai', name: 'Personal Accident Insurance', price: 30, perDay: true, icon: Shield },
  { id: 'gps', name: 'GPS Navigation', price: 150, perDay: false, icon: null },
  { id: 'child_seat', name: 'Child Seat', price: 100, perDay: false, icon: null },
  { id: 'additional_driver', name: 'Additional Driver', price: 200, perDay: false, icon: null },
  { id: 'airport_delivery', name: 'Airport Delivery/Pickup', price: 150, perDay: false, icon: null },
  { id: 'fuel_full', name: 'Full Fuel Tank Service', price: 200, perDay: false, icon: null },
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
  const securityDeposit = Math.round(dailyRate * 5); // Estimated deposit
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing Estimation
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            Live Quote
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Base Rate Breakdown */}
        <div className="space-y-3">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-lg">Vehicle Rental</p>
                <p className="text-sm text-muted-foreground">
                  {lead.vehicle_category}
                </p>
              </div>
              <p className="text-2xl font-bold text-primary">
                AED {baseTotal.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>AED {dailyRate.toLocaleString()}/day</span>
              <span>×</span>
              <Badge variant="secondary">{lead.duration_days} days</Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Add-ons Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Optional Add-ons</p>
            {selectedAddOns.length > 0 && (
              <Badge variant="secondary">
                {selectedAddOns.length} selected
              </Badge>
            )}
          </div>
          
          <div className="space-y-2">
            {addOns.map((addon) => {
              const isSelected = selectedAddOns.includes(addon.id);
              const addonPrice = addon.perDay ? addon.price * lead.duration_days : addon.price;
              
              return (
                <div
                  key={addon.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary/5 border-primary shadow-sm'
                      : 'bg-muted/30 border-border hover:bg-muted/50 hover:border-muted-foreground/20'
                  }`}
                  onClick={() => toggleAddOn(addon.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleAddOn(addon.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{addon.name}</p>
                    <p className="text-xs text-muted-foreground">
                      AED {addon.price.toLocaleString()}
                      {addon.perDay && ` × ${lead.duration_days} days`}
                    </p>
                  </div>
                  <p className="text-sm font-semibold whitespace-nowrap">
                    +AED {addonPrice.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Rental Subtotal</span>
              <span className="font-medium">AED {baseTotal.toLocaleString()}</span>
            </div>
            
            {addOnsTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Add-ons Total</span>
                <span className="font-medium">AED {addOnsTotal.toLocaleString()}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">AED {subtotal.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">VAT (5%)</span>
              <span className="font-medium">AED {Math.round(vat).toLocaleString()}</span>
            </div>
          </div>
          
          <Separator />
          
          {/* Grand Total */}
          <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Estimated Total</span>
              <span className="text-3xl font-bold text-primary">
                AED {Math.round(grandTotal).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Security Deposit */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                Security Deposit Required
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Estimated AED {securityDeposit.toLocaleString()} (refundable after return)
              </p>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Final pricing may vary based on vehicle availability and actual rental conditions
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
