import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { 
  FileText, 
  DollarSign, 
  Car, 
  Calendar, 
  ChevronDown, 
  ChevronUp,
  Calculator,
  Shield,
  Coins
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";

interface MasterAgreementStep6SummaryProps {
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export const MasterAgreementStep6Summary: React.FC<MasterAgreementStep6SummaryProps> = ({ data }) => {
  const [openSections, setOpenSections] = useState({
    header: true,
    vehicleLines: true,
    tollFines: false,
    financialTerms: false,
    insurance: false,
    initialFees: false,
    grandTotal: true,
    terms: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const currency = data.currency || 'AED';

  // Helper: Calculate end date from start date + duration months
  const calculateEndDate = (startDate: string, durationMonths: number) => {
    if (!startDate || !durationMonths) return 'TBD';
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + durationMonths);
    return date.toISOString().split('T')[0];
  };

  // Helper: Get addon type flexibly
  const getAddonType = (addon: any) => addon.pricing_model || addon.type || 'monthly';

  // Helper: Get addon total flexibly
  const getAddonTotal = (addon: any) => addon.total ?? addon.amount ?? 0;

  // Calculate comprehensive totals
  const calculateTotals = () => {
    const lines = data.agreement_items || [];
    
    let totalDeposits = 0;
    let totalAdvanceRent = 0;
    let totalDeliveryFees = 0;
    let totalCollectionFees = 0;
    let monthlyRecurringRental = 0;
    let totalOneTimeAddons = 0;

    lines.forEach((line: any) => {
      const monthlyRate = line.monthly_rate || 0;
      const depositAmount = line.deposit_amount || 0;
      const advanceRentMonths = line.advance_rent_months || 0;
      const deliveryFee = line.delivery_fee || 0;
      const collectionFee = line.collection_fee || 0;

      totalDeposits += depositAmount;
      totalAdvanceRent += monthlyRate * advanceRentMonths;
      totalDeliveryFees += deliveryFee;
      totalCollectionFees += collectionFee;

      // Monthly recurring (base + monthly addons)
      const monthlyAddOnsCost = (line.addons || [])
        .filter((a: any) => getAddonType(a) === 'monthly')
        .reduce((sum: number, a: any) => sum + getAddonTotal(a), 0);
      
      monthlyRecurringRental += monthlyRate + monthlyAddOnsCost;

      // One-time addons
      const oneTimeAddOnsCost = (line.addons || [])
        .filter((a: any) => getAddonType(a) === 'one-time')
        .reduce((sum: number, a: any) => sum + getAddonTotal(a), 0);
      
      totalOneTimeAddons += oneTimeAddOnsCost;
    });

    // Initial fees
    const initialFees = (data.initial_fees || []).reduce((sum: number, fee: any) => 
      sum + (fee.amount || 0), 0
    );

    // Taxable subtotal (everything except deposits)
    const taxableSubtotal = totalAdvanceRent + totalDeliveryFees + totalCollectionFees + 
                            initialFees + totalOneTimeAddons;

    const vatRate = data.vat_percentage || 5;
    const vatAmount = (taxableSubtotal * vatRate) / 100;

    const totalUpfrontDue = totalDeposits + taxableSubtotal + vatAmount;

    return {
      deposits: totalDeposits,
      advanceRent: totalAdvanceRent,
      deliveryFees: totalDeliveryFees,
      collectionFees: totalCollectionFees,
      initialFees,
      oneTimeAddons: totalOneTimeAddons,
      monthlyRecurringRental,
      taxableSubtotal,
      vatRate,
      vatAmount,
      totalUpfrontDue,
      vehicles: lines.length,
    };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Executive Summary Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Monthly Recurring</p>
              <p className="text-3xl font-bold">{formatCurrency(totals.monthlyRecurringRental, currency)}</p>
              <p className="text-xs text-muted-foreground">/month</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Vehicle Lines</p>
              <p className="text-3xl font-bold">{totals.vehicles}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Contract Term</p>
              <p className="text-3xl font-bold">
                {data.duration_days ? Math.floor(data.duration_days / 30) : 'N/A'}
                <span className="text-lg font-normal ml-1">months</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Upfront Due</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(totals.totalUpfrontDue, currency)}</p>
            </div>
          </div>
          {data.contract_effective_from && data.contract_effective_to && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Contract Period: {data.contract_effective_from} to {data.contract_effective_to}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agreement Header */}
      <Collapsible open={openSections.header} onOpenChange={() => toggleSection('header')}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle>Agreement Header</CardTitle>
                </div>
                {openSections.header ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Customer</span>
                  <p className="font-medium">{data.account_name || "Not selected"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Agreement Number</span>
                  <p className="font-medium">{data.agreement_no || "Auto-generated"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <div className="mt-1">
                    <Badge variant="outline" className="capitalize">
                      {data.status || "Draft"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Contract Period</span>
                  <p className="font-medium">{data.contract_effective_from || 'TBD'} to {data.contract_effective_to || 'TBD'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Currency</span>
                  <p className="font-medium">{currency}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Legal Entity</span>
                  <p className="font-medium">{data.legal_entity_name || "Not specified"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Business Unit</span>
                  <p className="font-medium">{data.business_unit_name || "Not specified"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Price List</span>
                  <p className="font-medium">{data.price_list_name || "Not specified"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment Terms</span>
                  <p className="font-medium">{data.payment_terms_name || "Not specified"}</p>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Vehicle Lines Summary */}
      <Collapsible open={openSections.vehicleLines} onOpenChange={() => toggleSection('vehicleLines')}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  <CardTitle>Vehicle Lines ({(data.agreement_items || []).length})</CardTitle>
                </div>
                {openSections.vehicleLines ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {(data.agreement_items || []).map((line: any, index: number) => {
                const vehicleMeta = line._vehicleMeta || {};
                const monthlyRate = line.monthly_rate || 0;
                const depositAmount = line.deposit_amount || 0;
                const advanceRentMonths = line.advance_rent_months || 0;
                const advanceRent = monthlyRate * advanceRentMonths;
                const deliveryFee = line.delivery_fee || 0;
                const lineUpfront = depositAmount + advanceRent + deliveryFee;
                
                const monthlyAddons = (line.addons || []).filter((a: any) => getAddonType(a) === 'monthly');
                const oneTimeAddons = (line.addons || []).filter((a: any) => getAddonType(a) === 'one-time');

                const startDate = line.pickup_at || data.contract_effective_from;
                const endDate = line.duration_months ? calculateEndDate(startDate, line.duration_months) : data.contract_effective_to;

                return (
                  <div key={index} className="border-2 rounded-lg p-5 hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Line {line.line_no || index + 1}</Badge>
                        {line.duration_months && (
                          <Badge variant="secondary">{line.duration_months} months</Badge>
                        )}
                      </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-lg mb-2">
                        {vehicleMeta.make || line.vehicle_class_name} {vehicleMeta.model} {vehicleMeta.year}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        {line.vehicle_class_name && (
                          <div>Class: <span className="font-medium text-foreground">{line.vehicle_class_name}</span></div>
                        )}
                        {vehicleMeta.color && (
                          <div>Color: <span className="font-medium text-foreground">{vehicleMeta.color}</span></div>
                        )}
                        {vehicleMeta.vin && (
                          <div>VIN: <span className="font-medium text-foreground">{vehicleMeta.vin}</span></div>
                        )}
                        {line.item_code && (
                          <div>Item Code: <span className="font-medium text-foreground">{line.item_code}</span></div>
                        )}
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Contract Terms */}
                      <div>
                        <h5 className="font-medium mb-2 flex items-center gap-1">
                          <Calendar className="h-4 w-4" /> Contract Terms
                        </h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Start Date:</span>
                            <span className="font-medium">{startDate || 'TBD'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">End Date:</span>
                            <span className="font-medium">{endDate || 'TBD'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="font-medium">{line.duration_months || 'N/A'} months</span>
                          </div>
                        </div>
                      </div>

                      {/* Mileage Package */}
                      <div>
                        <h5 className="font-medium mb-2">Mileage Package</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Included KM/Month:</span>
                            <span className="font-medium">{line.mileage_package_km?.toLocaleString() || 'Unlimited'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Excess Rate:</span>
                            <span className="font-medium">{line.excess_km_rate ? `${formatCurrency(line.excess_km_rate, currency)}/km` : 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Financial Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">Financial Details</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Monthly Rate:</span>
                            <span className="font-bold text-primary">{formatCurrency(monthlyRate, currency)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Deposit:</span>
                            <span className="font-medium">{formatCurrency(depositAmount, currency)}</span>
                          </div>
                          {line.location_name && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Location:</span>
                              <span className="font-medium">{line.location_name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Upfront Costs Breakdown */}
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h5 className="font-medium mb-2 text-sm">Upfront Costs Breakdown</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Security Deposit:</span>
                            <span>{formatCurrency(depositAmount, currency)}</span>
                          </div>
                          {advanceRentMonths > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Advance Rent ({advanceRentMonths}m):</span>
                              <span>{formatCurrency(advanceRent, currency)}</span>
                            </div>
                          )}
                          {deliveryFee > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Delivery Fee:</span>
                              <span>{formatCurrency(deliveryFee, currency)}</span>
                            </div>
                          )}
                          <Separator className="my-2" />
                          <div className="flex justify-between font-bold text-primary">
                            <span>Line Total Upfront:</span>
                            <span>{formatCurrency(lineUpfront, currency)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Add-ons */}
                    {(monthlyAddons.length > 0 || oneTimeAddons.length > 0) && (
                      <>
                        <Separator className="my-4" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {monthlyAddons.length > 0 && (
                            <div>
                              <h5 className="font-medium mb-2 text-sm">Monthly Add-Ons</h5>
                              <div className="space-y-1 text-sm">
                                {monthlyAddons.map((addon: any, idx: number) => (
                                  <div key={idx} className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      {addon.name || addon.addon_name} {addon.quantity > 1 && `(x${addon.quantity})`}
                                    </span>
                                    <span className="font-medium">{formatCurrency(getAddonTotal(addon), currency)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {oneTimeAddons.length > 0 && (
                            <div>
                              <h5 className="font-medium mb-2 text-sm">One-Time Add-Ons</h5>
                              <div className="space-y-1 text-sm">
                                {oneTimeAddons.map((addon: any, idx: number) => (
                                  <div key={idx} className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      {addon.name || addon.addon_name} {addon.quantity > 1 && `(x${addon.quantity})`}
                                    </span>
                                    <span className="font-medium">{formatCurrency(getAddonTotal(addon), currency)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
              
              {(data.agreement_items || []).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No vehicle lines added yet
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Toll & Fines Policy */}
      <Collapsible open={openSections.tollFines} onOpenChange={() => toggleSection('tollFines')}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-primary" />
                  <CardTitle>Toll & Fines Policy</CardTitle>
                </div>
                {openSections.tollFines ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Toll Handling Type</span>
                  <p className="font-medium capitalize">{data.salik_darb_handling || "Customer Responsibility"}</p>
                </div>
                {data.salik_darb_handling === 'included_allowance' && data.monthly_allowance_cap && (
                  <div>
                    <span className="text-muted-foreground">Monthly Allowance Cap</span>
                    <p className="font-medium">{formatCurrency(data.monthly_allowance_cap, currency)}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Admin Fee Model</span>
                  <p className="font-medium capitalize">{data.tolls_admin_fee_model || "None"}</p>
                </div>
                {data.tolls_admin_fee_model !== 'none' && data.admin_fee_per_toll_aed && (
                  <div>
                    <span className="text-muted-foreground">Admin Fee per Toll</span>
                    <p className="font-medium">{formatCurrency(data.admin_fee_per_toll_aed, currency)}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Traffic Fines Handling</span>
                  <p className="font-medium capitalize">{data.traffic_fines_handling || "Pass-through to Customer"}</p>
                </div>
                {data.admin_fee_per_fine_aed && (
                  <div>
                    <span className="text-muted-foreground">Admin Fee per Fine</span>
                    <p className="font-medium">{formatCurrency(data.admin_fee_per_fine_aed, currency)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Financial Terms */}
      <Collapsible open={openSections.financialTerms} onOpenChange={() => toggleSection('financialTerms')}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <CardTitle>Financial Terms</CardTitle>
                </div>
                {openSections.financialTerms ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Billing Plan</span>
                  <p className="font-medium capitalize">{data.billing_plan || "Monthly"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Billing Start Date</span>
                  <p className="font-medium">{data.billing_start_date || "TBD"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">VAT Rate</span>
                  <p className="font-medium">{data.vat_percentage || 5}%</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment Method</span>
                  <p className="font-medium capitalize">{data.payment_method || "Not specified"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Deposit Type</span>
                  <p className="font-medium capitalize">{data.deposit_type || "Not specified"}</p>
                </div>
                {data.annual_escalation_percentage && (
                  <div>
                    <span className="text-muted-foreground">Annual Escalation</span>
                    <p className="font-medium">{data.annual_escalation_percentage}%</p>
                  </div>
                )}
                {data.tax_level_name && (
                  <div>
                    <span className="text-muted-foreground">Tax Level</span>
                    <p className="font-medium">{data.tax_level_name}</p>
                  </div>
                )}
                {data.tax_code_name && (
                  <div>
                    <span className="text-muted-foreground">Tax Code</span>
                    <p className="font-medium">{data.tax_code_name}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Insurance & Coverage */}
      <Collapsible open={openSections.insurance} onOpenChange={() => toggleSection('insurance')}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Insurance & Coverage</CardTitle>
                </div>
                {openSections.insurance ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Insurance Plan</span>
                  <p className="font-medium capitalize">{data.insurance_plan || "Not specified"}</p>
                </div>
                {data.insurance_excess_amount && (
                  <div>
                    <span className="text-muted-foreground">Insurance Excess</span>
                    <p className="font-medium">{formatCurrency(data.insurance_excess_amount, currency)}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Coverage Type</span>
                  <p className="font-medium capitalize">{data.coverage_type || "Comprehensive"}</p>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Initial Fees */}
      {data.initial_fees && data.initial_fees.length > 0 && (
        <Collapsible open={openSections.initialFees} onOpenChange={() => toggleSection('initialFees')}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary" />
                    <CardTitle>Initial Fees</CardTitle>
                  </div>
                  {openSections.initialFees ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {data.initial_fees.map((fee: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{fee.type || fee.name}</p>
                        {fee.description && (
                          <p className="text-xs text-muted-foreground">{fee.description}</p>
                        )}
                      </div>
                      <span className="font-medium">{formatCurrency(fee.amount || 0, currency)}</span>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-primary">
                    <span>Total Initial Fees:</span>
                    <span>{formatCurrency(totals.initialFees, currency)}</span>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Grand Total Summary */}
      <Collapsible open={openSections.grandTotal} onOpenChange={() => toggleSection('grandTotal')}>
        <Card className="border-primary/30">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  <CardTitle>Grand Total Summary</CardTitle>
                </div>
                {openSections.grandTotal ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-3">
                {/* Non-Taxable Items */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Deposits (Non-taxable)</span>
                    <span className="font-medium">{formatCurrency(totals.deposits, currency)}</span>
                  </div>
                </div>

                <Separator />

                {/* Taxable Items */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Advance Rent</span>
                    <span className="font-medium">{formatCurrency(totals.advanceRent, currency)}</span>
                  </div>
                  {totals.deliveryFees > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Fees</span>
                      <span className="font-medium">{formatCurrency(totals.deliveryFees, currency)}</span>
                    </div>
                  )}
                  {totals.collectionFees > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Collection Fees</span>
                      <span className="font-medium">{formatCurrency(totals.collectionFees, currency)}</span>
                    </div>
                  )}
                  {totals.initialFees > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Initial Fees</span>
                      <span className="font-medium">{formatCurrency(totals.initialFees, currency)}</span>
                    </div>
                  )}
                  {totals.oneTimeAddons > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">One-Time Add-Ons</span>
                      <span className="font-medium">{formatCurrency(totals.oneTimeAddons, currency)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Monthly Recurring */}
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Monthly Recurring Rental</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                      {formatCurrency(totals.monthlyRecurringRental, currency)}<span className="text-sm">/mo</span>
                    </span>
                  </div>
                </div>

                <Separator />

                {/* VAT Calculation */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal (Taxable)</span>
                    <span className="font-medium">{formatCurrency(totals.taxableSubtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VAT ({totals.vatRate}%)</span>
                    <span className="font-medium">{formatCurrency(totals.vatAmount, currency)}</span>
                  </div>
                </div>

                <Separator className="border-primary" />

                {/* Grand Total */}
                <div className="bg-primary/5 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Upfront Due (incl. VAT)</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(totals.totalUpfrontDue, currency)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Terms & Conditions */}
      <Collapsible open={openSections.terms} onOpenChange={() => toggleSection('terms')}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle>Terms & Conditions</CardTitle>
                </div>
                {openSections.terms ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-4 text-sm">
                {data.renewal_terms && (
                  <div>
                    <span className="text-muted-foreground font-medium">Renewal Terms</span>
                    <p className="mt-1">{data.renewal_terms}</p>
                  </div>
                )}
                {data.termination_clause && (
                  <div>
                    <span className="text-muted-foreground font-medium">Termination Clause</span>
                    <p className="mt-1">{data.termination_clause}</p>
                  </div>
                )}
                {data.special_terms && (
                  <div>
                    <span className="text-muted-foreground font-medium">Special Terms & Conditions</span>
                    <p className="mt-1 whitespace-pre-wrap">{data.special_terms}</p>
                  </div>
                )}
                {data.notes && (
                  <div>
                    <span className="text-muted-foreground font-medium">Additional Notes</span>
                    <p className="mt-1 whitespace-pre-wrap">{data.notes}</p>
                  </div>
                )}
                {!data.renewal_terms && !data.termination_clause && !data.special_terms && !data.notes && (
                  <p className="text-muted-foreground italic">No additional terms or conditions specified.</p>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};
