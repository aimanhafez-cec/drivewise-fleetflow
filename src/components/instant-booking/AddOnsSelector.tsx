import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Minus } from 'lucide-react';
import { availableAddOns, categorizeAddOns, calculateAddOnCost, addOnCategories, AddOn } from '@/lib/constants/addOns';

interface AddOnsSelectorProps {
  selectedAddOns: string[];
  addOnCharges: Record<string, number>;
  onAddOnToggle: (addOnId: string) => void;
  rentalDays?: number;
}

const AddOnsSelector: React.FC<AddOnsSelectorProps> = ({
  selectedAddOns = [],
  addOnCharges = {},
  onAddOnToggle,
  rentalDays = 1
}) => {
  const getTotalAddOnAmount = () => {
    return Object.values(addOnCharges).reduce((sum, amount) => sum + amount, 0);
  };

  return (
    <div className="space-y-6">
      {/* Add-ons Selection */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Plus className="h-5 w-5 text-card-foreground" />
            Add-on Features
          </CardTitle>
          <CardDescription className="text-card-foreground/70">
            Enhance your rental experience with optional add-ons
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {categorizeAddOns().map((category) => {
            if (category.items.length === 0) return null;

            return (
              <div key={category.category} className="space-y-4">
                <h3 className="font-semibold text-lg text-card-foreground border-b border-card-foreground/20 pb-2">
                  {category.name}
                </h3>
                <div className="grid gap-4">
                  {category.items.map((addOn) => {
                    const isSelected = selectedAddOns.includes(addOn.id);
                    const cost = calculateAddOnCost(addOn.id, rentalDays);
                    const IconComponent = addOn.icon;

                    return (
                      <div
                        key={addOn.id}
                        className={`
                          relative p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md
                          ${isSelected 
                            ? 'border-primary bg-primary/5 shadow-sm' 
                            : 'border-card-foreground/20 bg-card hover:border-primary/50'
                          }
                        `}
                        onClick={() => onAddOnToggle(addOn.id)}
                      >
                        <div className="flex items-start gap-4">
                          <Checkbox 
                            checked={isSelected}
                            onChange={() => {}} // Controlled by parent click
                            className="mt-1"
                          />
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <IconComponent className="h-5 w-5 text-primary" />
                              <h4 className="font-medium text-card-foreground">{addOn.name}</h4>
                              {addOn.isPopular && (
                                <Badge variant="secondary" className="text-xs">
                                  Popular
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-card-foreground/70 mb-3">
                              {addOn.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-lg font-bold text-red-600">
                                AED {cost.toFixed(0)}
                                {addOn.isFlat ? (
                                  <span className="text-xs text-card-foreground/70 ml-1">(flat rate)</span>
                                ) : (
                                  <span className="text-xs text-card-foreground/70 ml-1">
                                    ({rentalDays} day{rentalDays > 1 ? 's' : ''} × AED {addOn.amount})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Selected Add-ons Summary - Non-sticky */}
      {selectedAddOns.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">Selected Add-ons Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedAddOns.map((addOnId) => {
                const addOn = availableAddOns.find(a => a.id === addOnId);
                if (!addOn) return null;
                
                const cost = calculateAddOnCost(addOnId, rentalDays);
                const IconComponent = addOn.icon;
                
                return (
                  <div key={addOnId} className="flex items-center justify-between p-3 bg-card-foreground/5 rounded-lg border border-card-foreground/10">
                    <div className="flex items-center gap-2 flex-1">
                      <IconComponent className="h-4 w-4 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate text-card-foreground">{addOn.name}</p>
                        <p className="text-xs text-card-foreground/70">
                          {addOn.isFlat ? 'Flat rate' : `AED ${addOn.amount}/day`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <p className="font-bold text-sm text-red-600">AED {cost.toFixed(0)}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-card-foreground/70 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddOnToggle(addOnId);
                        }}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              
              <div className="border-t border-card-foreground/20 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-card-foreground">Add-ons Total:</span>
                  <span className="font-bold text-lg text-red-600">
                    AED {getTotalAddOnAmount().toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AddOnsSelector;