import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, Car, UserPlus, MapPin, Clock, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AgreementWizardStep4Props {
  data: {
    selectedAddOns: string[];
    addOnCharges: Array<{
      id: string;
      name: string;
      amount: number;
      taxable: boolean;
    }>;
  };
  reservation: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

// Mock add-on data - in real app, this would come from API
const availableAddOns = [
  {
    id: 'ldw',
    name: 'Loss Damage Waiver (LDW)',
    description: 'Reduces financial responsibility for damage to the rental vehicle',
    amount: 25.99,
    taxable: true,
    category: 'insurance',
    icon: Shield,
    popular: true,
  },
  {
    id: 'sli',
    name: 'Supplemental Liability Insurance (SLI)',
    description: 'Additional liability coverage beyond basic protection',
    amount: 15.99,
    taxable: true,
    category: 'insurance',
    icon: Shield,
    popular: false,
  },
  {
    id: 'gps',
    name: 'GPS Navigation System',
    description: 'Turn-by-turn navigation with real-time traffic updates',
    amount: 12.99,
    taxable: true,
    category: 'equipment',
    icon: MapPin,
    popular: true,
  },
  {
    id: 'additional_driver',
    name: 'Additional Driver',
    description: 'Allow one additional authorized driver',
    amount: 10.00,
    taxable: false,
    category: 'driver',
    icon: UserPlus,
    popular: false,
  },
  {
    id: 'underage_fee',
    name: 'Underage Driver Fee',
    description: 'Required fee for drivers under 25 years old',
    amount: 30.00,
    taxable: false,
    category: 'fee',
    icon: Clock,
    popular: false,
  },
  {
    id: 'car_seat',
    name: 'Child Safety Seat',
    description: 'CPSC approved child safety seat',
    amount: 8.99,
    taxable: true,
    category: 'equipment',
    icon: Car,
    popular: false,
  },
  {
    id: 'roadside',
    name: '24/7 Roadside Assistance',
    description: 'Emergency roadside assistance coverage',
    amount: 7.99,
    taxable: true,
    category: 'service',
    icon: Plus,
    popular: false,
  },
];

export const AgreementWizardStep4: React.FC<AgreementWizardStep4Props> = ({
  data,
  reservation,
  onChange,
  errors,
}) => {
  const toggleAddOn = (addOnId: string) => {
    const addOn = availableAddOns.find(a => a.id === addOnId);
    if (!addOn) return;

    const isSelected = data.selectedAddOns.includes(addOnId);
    
    if (isSelected) {
      // Remove add-on
      const updatedSelected = data.selectedAddOns.filter(id => id !== addOnId);
      const updatedCharges = data.addOnCharges.filter(charge => charge.id !== addOnId);
      onChange({
        selectedAddOns: updatedSelected,
        addOnCharges: updatedCharges,
      });
    } else {
      // Add add-on
      const updatedSelected = [...data.selectedAddOns, addOnId];
      const newCharge = {
        id: addOn.id,
        name: addOn.name,
        amount: addOn.amount,
        taxable: addOn.taxable,
      };
      const updatedCharges = [...data.addOnCharges, newCharge];
      onChange({
        selectedAddOns: updatedSelected,
        addOnCharges: updatedCharges,
      });
    }
  };

  const categorizeAddOns = (category: string) => {
    return availableAddOns.filter(addOn => addOn.category === category);
  };

  const categories = [
    { key: 'insurance', title: 'Insurance & Protection', icon: Shield },
    { key: 'equipment', title: 'Equipment & Accessories', icon: Car },
    { key: 'driver', title: 'Driver Services', icon: UserPlus },
    { key: 'fee', title: 'Fees & Surcharges', icon: Clock },
    { key: 'service', title: 'Additional Services', icon: Plus },
  ];

  const getTotalAddOnAmount = () => {
    return data.addOnCharges.reduce((sum, charge) => sum + charge.amount, 0);
  };

  return (
    <div id="wiz-step-upsell" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add-ons Selection */}
        <div className="lg:col-span-2 space-y-6">
          {categories.map((category) => {
            const categoryAddOns = categorizeAddOns(category.key);
            if (categoryAddOns.length === 0) return null;

            return (
              <Card key={category.key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <category.icon className="h-5 w-5" />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categoryAddOns.map((addOn) => {
                    const isSelected = data.selectedAddOns.includes(addOn.id);
                    const IconComponent = addOn.icon;

                    return (
                      <div
                        key={addOn.id}
                        className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => toggleAddOn(addOn.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleAddOn(addOn.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{addOn.name}</span>
                            {addOn.popular && (
                              <Badge variant="secondary" className="text-xs">
                                Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {addOn.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(addOn.amount)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {addOn.taxable ? 'Taxable' : 'Tax Free'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Add-ons Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.selectedAddOns.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {data.addOnCharges.map((charge) => (
                      <div key={charge.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground truncate mr-2">
                          {charge.name}
                        </span>
                        <span>{formatCurrency(charge.amount)}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="flex justify-between font-medium">
                    <span>Total Add-ons:</span>
                    <span>{formatCurrency(getTotalAddOnAmount())}</span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Selected {data.selectedAddOns.length} add-on{data.selectedAddOns.length !== 1 ? 's' : ''}
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No add-ons selected
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Choose from the options to enhance your rental
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};