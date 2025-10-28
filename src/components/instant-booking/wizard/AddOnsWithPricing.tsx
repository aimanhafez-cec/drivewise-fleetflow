import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Shield,
  UserPlus,
  Baby,
  Navigation,
  Wifi,
  Car,
  Sparkles,
  Key,
  Receipt,
  AlertTriangle,
  Globe,
  Package,
  Users,
  Briefcase,
  TrendingUp,
  DollarSign,
  ChevronDown,
  Tag,
  CheckCircle,
} from 'lucide-react';
import { BookingWizardData } from '@/pages/NewInstantBooking';
import { PriceListSelect } from '@/components/ui/select-components';

interface AddOnsWithPricingProps {
  bookingData: BookingWizardData;
  onUpdate: (updates: any) => void;
}

const AddOnsWithPricing = ({ bookingData, onUpdate }: AddOnsWithPricingProps) => {
  const [pricing, setPricing] = useState<any>(null);
  const [showAllAddOns, setShowAllAddOns] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [selectedPriceList, setSelectedPriceList] = useState<string>('');
  
  const rentalDays = bookingData.pickupDate && bookingData.returnDate
    ? Math.ceil(
        (new Date(`${bookingData.returnDate}T${bookingData.returnTime}`).getTime() -
          new Date(`${bookingData.pickupDate}T${bookingData.pickupTime}`).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 1;

  const addOns = [
    {
      id: 'cdw_scdw',
      category: 'Insurance & Protection',
      icon: Shield,
      name: 'Super Collision Damage Waiver',
      description: 'Reduce excess to AED 500',
      rate: 45,
      perDay: true,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      id: 'personal_accident',
      category: 'Insurance & Protection',
      icon: Shield,
      name: 'Personal Accident Insurance',
      description: 'Coverage for driver and passengers',
      rate: 30,
      perDay: true,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      id: 'additional_driver',
      category: 'Additional Services',
      icon: UserPlus,
      name: 'Additional Driver',
      description: 'Add extra authorized driver',
      rate: 25,
      perDay: true,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      id: 'child_seat',
      category: 'Additional Services',
      icon: Baby,
      name: 'Child Seat',
      description: 'Safety seat for children',
      rate: 20,
      perDay: true,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      id: 'gps_navigation',
      category: 'Additional Services',
      icon: Navigation,
      name: 'GPS Navigation',
      description: 'Built-in GPS system',
      rate: 15,
      perDay: true,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      id: 'wifi_hotspot',
      category: 'Additional Services',
      icon: Wifi,
      name: 'WiFi Hotspot',
      description: 'Unlimited 4G data',
      rate: 50,
      perDay: true,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      id: 'delivery_collection',
      category: 'Convenience',
      icon: Car,
      name: 'Delivery & Collection',
      description: 'We deliver and collect the car',
      rate: 150,
      perDay: false,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  const categories = Array.from(new Set(addOns.map(a => a.category)));

  const handleToggle = (addOnId: string) => {
    const addOn = addOns.find(a => a.id === addOnId);
    if (!addOn) return;

    const isSelected = bookingData.selectedAddOns.includes(addOnId);
    const cost = addOn.perDay ? addOn.rate * rentalDays : addOn.rate;

    if (isSelected) {
      onUpdate({
        selectedAddOns: bookingData.selectedAddOns.filter(id => id !== addOnId),
        addOnCharges: Object.fromEntries(
          Object.entries(bookingData.addOnCharges).filter(([key]) => key !== addOnId)
        ),
      });
    } else {
      onUpdate({
        selectedAddOns: [...bookingData.selectedAddOns, addOnId],
        addOnCharges: { ...bookingData.addOnCharges, [addOnId]: cost },
      });
    }
  };

  const handleQuickPackage = (packageIds: string[]) => {
    const newSelectedAddOns = [...new Set([...bookingData.selectedAddOns, ...packageIds])];
    const newCharges = { ...bookingData.addOnCharges };
    
    packageIds.forEach(id => {
      const addOn = addOns.find(a => a.id === id);
      if (addOn && !bookingData.selectedAddOns.includes(id)) {
        newCharges[id] = addOn.perDay ? addOn.rate * rentalDays : addOn.rate;
      }
    });
    
    onUpdate({
      selectedAddOns: newSelectedAddOns,
      addOnCharges: newCharges,
    });
  };

  // Apply promo code
  const handleApplyPromo = () => {
    // Mock promo codes for UAE car rental business
    const validPromoCodes: Record<string, { discount: number; type: 'percentage' | 'fixed' }> = {
      'WELCOME10': { discount: 10, type: 'percentage' },
      'SUMMER20': { discount: 20, type: 'percentage' },
      'VIP15': { discount: 15, type: 'percentage' },
      'FIRST100': { discount: 100, type: 'fixed' },
    };

    const promo = validPromoCodes[promoCode.toUpperCase()];
    if (promo) {
      const baseRate = 250; // Mock daily rate
      const baseAmount = baseRate * rentalDays;
      
      if (promo.type === 'percentage') {
        setPromoDiscount((baseAmount * promo.discount) / 100);
      } else {
        setPromoDiscount(promo.discount);
      }
      setPromoApplied(true);
    } else {
      setPromoDiscount(0);
      setPromoApplied(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setPromoApplied(false);
    setPromoDiscount(0);
  };

  // Calculate pricing in real-time
  useEffect(() => {
    const baseRate = 250; // Mock daily rate
    const baseAmount = baseRate * rentalDays;
    const addOnsTotal = Object.values(bookingData.addOnCharges).reduce((sum: number, val) => sum + val, 0);
    const oneWayFee = bookingData.pickupLocation !== bookingData.returnLocation ? 100 : 0;
    const subtotalBeforeDiscount = baseAmount + addOnsTotal + oneWayFee;
    const subtotal = subtotalBeforeDiscount - promoDiscount;
    const taxAmount = subtotal * 0.05; // 5% VAT
    const totalAmount = subtotal + taxAmount;
    
    const isCompany = bookingData.customerType === 'Company';
    const downPaymentRequired = isCompany ? totalAmount * 0.3 : totalAmount * 0.5;
    const balanceDue = totalAmount - downPaymentRequired;

    const calculatedPricing = {
      baseAmount,
      addOnsTotal,
      oneWayFee,
      promoDiscount,
      taxAmount,
      totalAmount,
      downPaymentRequired,
      balanceDue,
    };

    setPricing(calculatedPricing);
    onUpdate({ pricing: calculatedPricing });
  }, [bookingData.addOnCharges, rentalDays, bookingData.pickupLocation, bookingData.returnLocation, bookingData.customerType, promoDiscount]);

  const totalAddOns = Object.values(bookingData.addOnCharges).reduce((sum: number, val) => sum + val, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Customize & Review</h2>
        <p className="text-muted-foreground">
          Add services and see live pricing updates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Add-ons (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Packages */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Popular Packages
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleQuickPackage(['cdw_scdw', 'gps_navigation'])}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                      <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground">Essential</h4>
                      <p className="text-xs text-muted-foreground">SCDW + GPS</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        +AED {((45 + 15) * rentalDays).toFixed(0)}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" className="w-full" variant="outline">
                    <Package className="h-4 w-4 mr-2" />
                    Add Package
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleQuickPackage(['cdw_scdw', 'child_seat', 'gps_navigation'])}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground">Family</h4>
                      <p className="text-xs text-muted-foreground">SCDW + Child Seat + GPS</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        +AED {((45 + 20 + 15) * rentalDays).toFixed(0)}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" className="w-full" variant="outline">
                    <Package className="h-4 w-4 mr-2" />
                    Add Package
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleQuickPackage(['wifi_hotspot', 'additional_driver'])}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                      <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground">Business</h4>
                      <p className="text-xs text-muted-foreground">WiFi + Extra Driver</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        +AED {((50 + 25) * rentalDays).toFixed(0)}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" className="w-full" variant="outline">
                    <Package className="h-4 w-4 mr-2" />
                    Add Package
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Individual Add-ons with Progressive Disclosure */}
          {categories.map((category, categoryIndex) => {
            const categoryAddOns = addOns.filter(a => a.category === category);
            const topThree = categoryAddOns.slice(0, 3);
            const remaining = categoryAddOns.slice(3);

            return (
              <div key={category}>
                <h3 className="font-semibold text-foreground mb-3">{category}</h3>
                <div className="space-y-3">
                  {/* Always show top 3 add-ons */}
                  {topThree.map((addOn) => {
                    const IconComponent = addOn.icon;
                    const isSelected = bookingData.selectedAddOns.includes(addOn.id);
                    const cost = addOn.perDay ? addOn.rate * rentalDays : addOn.rate;

                    return (
                      <Card
                        key={addOn.id}
                        className={`transition-all ${
                          isSelected ? 'ring-2 ring-primary shadow-md' : ''
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`p-2 rounded-lg ${addOn.bg}`}>
                                <IconComponent className={`h-5 w-5 ${addOn.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <Label
                                  htmlFor={addOn.id}
                                  className="font-semibold text-foreground cursor-pointer text-sm"
                                >
                                  {addOn.name}
                                </Label>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {addOn.description}
                                </p>
                                <Badge variant="outline" className="text-xs mt-2">
                                  AED {addOn.rate}{addOn.perDay ? '/day' : ' flat'}
                                  {isSelected && addOn.perDay && ` × ${rentalDays} = AED ${cost}`}
                                </Badge>
                              </div>
                            </div>
                            <Switch
                              id={addOn.id}
                              checked={isSelected}
                              onCheckedChange={() => handleToggle(addOn.id)}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {/* Collapsible section for remaining add-ons */}
                  {remaining.length > 0 && (
                    <Collapsible open={showAllAddOns} onOpenChange={setShowAllAddOns}>
                      <CollapsibleContent className="space-y-3">
                        {remaining.map((addOn) => {
                          const IconComponent = addOn.icon;
                          const isSelected = bookingData.selectedAddOns.includes(addOn.id);
                          const cost = addOn.perDay ? addOn.rate * rentalDays : addOn.rate;

                          return (
                            <Card
                              key={addOn.id}
                              className={`transition-all ${
                                isSelected ? 'ring-2 ring-primary shadow-md' : ''
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3 flex-1">
                                    <div className={`p-2 rounded-lg ${addOn.bg}`}>
                                      <IconComponent className={`h-5 w-5 ${addOn.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <Label
                                        htmlFor={addOn.id}
                                        className="font-semibold text-foreground cursor-pointer text-sm"
                                      >
                                        {addOn.name}
                                      </Label>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {addOn.description}
                                      </p>
                                      <Badge variant="outline" className="text-xs mt-2">
                                        AED {addOn.rate}{addOn.perDay ? '/day' : ' flat'}
                                        {isSelected && addOn.perDay && ` × ${rentalDays} = AED ${cost}`}
                                      </Badge>
                                    </div>
                                  </div>
                                  <Switch
                                    id={addOn.id}
                                    checked={isSelected}
                                    onCheckedChange={() => handleToggle(addOn.id)}
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </CollapsibleContent>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full mt-2 gap-2"
                        >
                          {showAllAddOns ? 'Show Less' : `Show ${remaining.length} More Add-ons`}
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${showAllAddOns ? 'rotate-180' : ''}`}
                          />
                        </Button>
                      </CollapsibleTrigger>
                    </Collapsible>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Live Pricing Summary (1/3 width - sticky) */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-foreground">Live Pricing</h3>
              </div>

              {pricing && (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Base Rate</span>
                      <span className="font-medium">AED {pricing.baseAmount.toFixed(2)}</span>
                    </div>
                    
                    {pricing.addOnsTotal > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Add-ons Total</span>
                        <span className="font-medium text-primary">+AED {pricing.addOnsTotal.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {pricing.oneWayFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">One-way Fee</span>
                        <span className="font-medium">AED {pricing.oneWayFee.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Price List Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Receipt className="h-4 w-4" />
                      Price List
                    </Label>
                    <PriceListSelect
                      value={selectedPriceList}
                      onChange={(value) => setSelectedPriceList(typeof value === 'string' ? value : value?.[0] || '')}
                      placeholder="Select price list"
                    />
                  </div>

                  <Separator />

                  {/* Promo Code Section */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Promo Code
                    </Label>
                    {!promoApplied ? (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter promo code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          className="uppercase"
                        />
                        <Button 
                          onClick={handleApplyPromo} 
                          size="sm"
                          disabled={!promoCode}
                        >
                          Apply
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{promoCode}</span>
                        </div>
                        <Button 
                          onClick={handleRemovePromo} 
                          variant="ghost" 
                          size="sm"
                          className="h-7 text-xs"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">AED {(pricing.baseAmount + pricing.addOnsTotal + (pricing.oneWayFee || 0)).toFixed(2)}</span>
                    </div>
                    
                    {promoApplied && promoDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-600 dark:text-emerald-400">Promo Discount</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">-AED {promoDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">VAT (5%)</span>
                      <span className="font-medium">AED {pricing.taxAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center py-2 bg-primary/10 -mx-2 px-2 rounded">
                    <span className="font-bold text-foreground">Total Amount</span>
                    <span className="text-xl font-bold text-primary">AED {pricing.totalAmount.toFixed(2)}</span>
                  </div>

                  <Separator />

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Down Payment</span>
                          <span className="font-semibold text-foreground">AED {pricing.downPaymentRequired.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {bookingData.customerType === 'Company' ? '30%' : '50%'} required now
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Balance Due</span>
                      <span className="font-medium">AED {pricing.balanceDue.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <div className={`h-2 w-2 rounded-full ${pricing.totalAmount > 5000 ? 'bg-red-500' : pricing.totalAmount > 2000 ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
                      <p className="text-xs text-muted-foreground">
                        {pricing.totalAmount > 5000 
                          ? 'Requires manager approval' 
                          : pricing.totalAmount > 2000 
                          ? 'Standard approval required'
                          : 'Auto-approval eligible'}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddOnsWithPricing;
