import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Mail,
  Printer,
  AlertCircle,
  DollarSign,
  Shield
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MultiPaymentAllocator } from '@/components/agreements/payments/MultiPaymentAllocator';
import { PaymentReceiptDialog } from '@/components/agreements/payments/PaymentReceiptDialog';
import { useCustomerPaymentProfile } from '@/hooks/useCustomerPaymentProfile';
import type { EnhancedWizardData } from '@/types/agreement-wizard';
import type { 
  PaymentAllocation, 
  SplitPaymentItem
} from '@/lib/api/agreement-payments';

const VAT_RATE = 0.05; // 5% UAE VAT

interface FinancialSettlementStepProps {
  data: EnhancedWizardData['step9'];
  inspectionData: EnhancedWizardData['step2'];
  onChange: (field: keyof EnhancedWizardData['step9'], value: any) => void;
  errors?: string[];
  customerId?: string; // Added for fetching customer profile
}

export const FinancialSettlementStep: React.FC<FinancialSettlementStepProps> = ({
  data,
  inspectionData,
  onChange,
  errors = [],
  customerId,
}) => {
  const [managerOverride, setManagerOverride] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const { profile: customerProfile, isLoading: loadingProfile } = useCustomerPaymentProfile(customerId);
  const [paymentAllocation, setPaymentAllocation] = useState<PaymentAllocation>({
    totalAmount: 0,
    allocatedAmount: 0,
    remainingAmount: 0,
    payments: [],
  });

  // Safety check: provide default values if data is undefined
  const safeData = data || {
    cleaningRequired: false,
    cleaningCharge: undefined,
    lateReturnHours: undefined,
    lateReturnCharge: undefined,
    salikTrips: undefined,
    salikCharge: undefined,
    paymentMethod: undefined,
    disputeRaised: false,
    overrideReason: undefined,
    overrideNotes: undefined,
    managerAuthCode: undefined,
    overrideApplied: false,
    inspectorName: undefined,
    inspectorDate: undefined,
    managerName: undefined,
    managerDate: undefined,
    customerName: undefined,
    customerDate: undefined,
    securityDepositHeld: 1500,
    settlementCompleted: false,
    splitPayments: [],
    paymentAllocation: undefined,
  };

  // Get inspection data
  const checkOutData = inspectionData?.checkOutInspection;
  const checkInData = inspectionData?.checkInInspection;
  const comparisonReport = inspectionData?.comparisonReport;

  if (!checkOutData || !checkInData) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Inspection Data Required</h3>
          <p className="text-muted-foreground">
            Please complete check-out and check-in inspections before calculating financial settlement.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate charges from inspection data
  const totalDamageCharges = comparisonReport?.totalChargeableAmount || 0;
  
  // Calculate additional charges
  const fuelDifference = checkOutData.fuelLevel - checkInData.fuelLevel;
  const fuelCharge = fuelDifference > 0 ? (fuelDifference / 100) * 60 * 4.5 : 0;

  const kmDriven = checkInData.odometerReading - checkOutData.odometerReading;
  const includedKm = 500; // Mock: would come from agreement
  const excessKm = Math.max(0, kmDriven - includedKm);
  const excessKmCharge = excessKm * 2.0;

  const cleaningRequired = safeData.cleaningRequired || false;
  const cleaningCharge = cleaningRequired ? 150 : 0;

  const lateReturnHours = safeData.lateReturnHours || 0;
  const lateReturnCharge = lateReturnHours > 0 ? Math.ceil(lateReturnHours) * 50 : 0;

  const salikTrips = safeData.salikTrips || 0;
  const salikCharge = salikTrips * 8;

  // Calculate totals
  const totalAdditionalCharges = fuelCharge + excessKmCharge + cleaningCharge + lateReturnCharge + salikCharge;
  const subtotal = totalDamageCharges + totalAdditionalCharges;
  const vatAmount = subtotal * VAT_RATE;
  const grandTotal = subtotal + vatAmount;
  const securityDeposit = safeData.securityDepositHeld || 1500;
  const additionalPayment = Math.max(0, grandTotal - securityDeposit);

  const handleExportPDF = () => {
    console.log('Exporting to PDF...');
  };

  const handleEmailReport = () => {
    console.log('Emailing report...');
  };

  const handlePrint = () => {
    window.print();
  };

  // Handle payment allocation change
  const handleAllocationChange = (allocation: PaymentAllocation) => {
    setPaymentAllocation(allocation);
    onChange('paymentAllocation', {
      totalAmount: allocation.totalAmount,
      allocatedAmount: allocation.allocatedAmount,
      remainingAmount: allocation.remainingAmount,
    });
  };

  // Handle payment completion
  const handlePaymentComplete = (payments: SplitPaymentItem[]) => {
    onChange('splitPayments', payments);
    onChange('settlementCompleted', true);
    setShowReceipt(true);
  };

  // Update payment allocation total when additional payment changes
  useEffect(() => {
    setPaymentAllocation(prev => ({
      ...prev,
      totalAmount: additionalPayment,
      remainingAmount: additionalPayment - prev.allocatedAmount,
    }));
  }, [additionalPayment]);

  return (
    <div className="space-y-6 print:space-y-4 animate-fade-in" role="region" aria-label="Financial settlement">
      {/* Header Summary Card */}
      <Card className="border-primary animate-scale-in print-break-inside-avoid">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-xl lg:text-2xl">Financial Settlement</CardTitle>
              <CardDescription className="mt-2">
                All charges, fees, and payment calculations for agreement closure
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-base lg:text-lg px-4 py-2 w-fit" aria-label="Agreement number">
              AGR-000123
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-semibold">Ahmed Al Mansoori</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vehicle</p>
              <p className="font-semibold">2023 Toyota Camry</p>
              <p className="text-sm text-muted-foreground">Dubai A-12345</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Check-Out</p>
              <p className="font-semibold">Oct 13, 2025</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Check-In</p>
              <p className="font-semibold">Oct 20, 2025</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-sm lg:text-base">
                {Math.ceil((new Date(checkInData.timestamp).getTime() - new Date(checkOutData.timestamp).getTime()) / (1000 * 60 * 60 * 24))} Days Rental
              </Badge>
              <Badge variant="outline" className="text-sm lg:text-base">
                {kmDriven} km Driven
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2 print:hidden">
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleEmailReport}>
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Damage Charges Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Damage Charges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-lg">
            <span>Total Damage Charges:</span>
            <span className="font-bold text-2xl">{totalDamageCharges.toFixed(2)} AED</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Based on {comparisonReport?.totalNewDamages || 0} new damage(s) found during check-in inspection
          </p>
        </CardContent>
      </Card>

      {/* Additional Charges */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Charges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Fuel Charge */}
            {fuelCharge > 0 && (
              <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <h4 className="font-semibold">Fuel Shortage</h4>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Check-out: {checkOutData.fuelLevel}% (Full tank)</p>
                    <p>Check-in: {checkInData.fuelLevel}%</p>
                    <p>Missing fuel: {fuelDifference}% ≈ {((fuelDifference / 100) * 60).toFixed(1)} liters</p>
                    <p>Fuel charge: AED 4.50/liter × {((fuelDifference / 100) * 60).toFixed(1)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{fuelCharge.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">AED</p>
                </div>
              </div>
            )}

            {/* Excess KM */}
            {excessKmCharge > 0 && (
              <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <h4 className="font-semibold">Excess Kilometers</h4>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Check-out odometer: {checkOutData.odometerReading.toLocaleString()} km</p>
                    <p>Check-in odometer: {checkInData.odometerReading.toLocaleString()} km</p>
                    <p>Distance driven: {kmDriven.toLocaleString()} km</p>
                    <p>Included in agreement: {includedKm.toLocaleString()} km</p>
                    <p>Excess: {excessKm.toLocaleString()} km</p>
                    <p>Excess charge: AED 2.00/km × {excessKm}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{excessKmCharge.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">AED</p>
                </div>
              </div>
            )}

            {/* Cleaning Fee */}
            {cleaningCharge > 0 && (
              <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Deep Cleaning Required</h4>
                  <p className="text-sm text-muted-foreground">Interior requires professional cleaning</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{cleaningCharge.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">AED</p>
                </div>
              </div>
            )}

            {/* Late Return */}
            {lateReturnCharge > 0 && (
              <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <h4 className="font-semibold">Late Return Fee</h4>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Late by: {lateReturnHours} hours (rounded to {Math.ceil(lateReturnHours)})</p>
                    <p>Charge: AED 50/hour × {Math.ceil(lateReturnHours)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{lateReturnCharge.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">AED</p>
                </div>
              </div>
            )}

            {/* Salik Charges */}
            {salikCharge > 0 && (
              <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Salik/Toll Charges</h4>
                  <p className="text-sm text-muted-foreground">
                    Trips recorded: {salikTrips} trips × AED 8.00
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{salikCharge.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">AED</p>
                </div>
              </div>
            )}

            <Separator />
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Subtotal - Additional Charges:</span>
              <span>{totalAdditionalCharges.toFixed(2)} AED</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card className="border-2 border-primary">
        <CardHeader className="bg-primary/5">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            <CardTitle className="text-xl">Financial Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3 text-lg">
            <div className="flex items-center justify-between">
              <span>Damage Charges:</span>
              <span className="font-semibold">{totalDamageCharges.toFixed(2)} AED</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Additional Charges:</span>
              <span className="font-semibold">{totalAdditionalCharges.toFixed(2)} AED</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">{subtotal.toFixed(2)} AED</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>VAT (5%):</span>
              <span className="font-semibold">{vatAmount.toFixed(2)} AED</span>
            </div>
            <Separator className="border-2" />
            <div className="flex items-center justify-between text-2xl font-bold text-primary">
              <span>TOTAL AMOUNT DUE:</span>
              <span>{grandTotal.toFixed(2)} AED</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-success">
              <span>Security Deposit Held:</span>
              <span className="font-semibold">{securityDeposit.toFixed(2)} AED</span>
            </div>
            <div className="flex items-center justify-between text-xl font-bold text-destructive">
              <span>Additional Payment Required:</span>
              <span>{additionalPayment.toFixed(2)} AED</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multi-Payment Options */}
      {additionalPayment > 0 ? (
        loadingProfile ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading payment options...</p>
            </CardContent>
          </Card>
        ) : (
          <MultiPaymentAllocator
            totalAmount={additionalPayment}
            customerProfile={customerProfile}
            allocation={paymentAllocation}
            onAllocationChange={handleAllocationChange}
            onPaymentComplete={handlePaymentComplete}
            disabled={safeData.settlementCompleted}
          />
        )
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              No Additional Payment Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="border-green-500 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600 dark:text-green-400">
                The security deposit covers all charges. Remaining balance will be refunded to the customer.
              </AlertDescription>
            </Alert>
            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between text-lg">
                <span className="font-medium">Refund Amount:</span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {(securityDeposit - grandTotal).toFixed(2)} AED
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dispute Option */}
      {additionalPayment > 0 && (
        <Card className="border-amber-500">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="dispute"
                checked={safeData.disputeRaised || false}
                onCheckedChange={(checked) => onChange('disputeRaised', checked as boolean)}
              />
              <Label htmlFor="dispute" className="cursor-pointer text-destructive">
                Dispute charges (requires manager approval)
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manager Override Section */}
      <Card className="border-amber-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              <CardTitle>Manager Override</CardTitle>
            </div>
            <Button
              variant={managerOverride ? "default" : "outline"}
              size="sm"
              onClick={() => setManagerOverride(!managerOverride)}
            >
              {managerOverride ? 'Lock' : 'Unlock'} Override
            </Button>
          </div>
        </CardHeader>
        {managerOverride && (
          <CardContent className="space-y-4">
            <Alert className="border-amber-500 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertDescription>
                Manager override enabled. Changes will be logged and require authorization code.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label>Adjustment Reason</Label>
              <Select 
                value={safeData.overrideReason || ''}
                onValueChange={(value) => onChange('overrideReason', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reason for adjustment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="goodwill">Goodwill - No Charge</SelectItem>
                  <SelectItem value="dispute">Customer Dispute</SelectItem>
                  <SelectItem value="insurance">Insurance Coverage</SelectItem>
                  <SelectItem value="error">Inspection Error</SelectItem>
                  <SelectItem value="other">Other (Specify)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Override Notes</Label>
              <Textarea 
                placeholder="Explain the reason for this adjustment..." 
                rows={3}
                value={safeData.overrideNotes || ''}
                onChange={(e) => onChange('overrideNotes', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Manager Authorization Code</Label>
              <Input 
                type="password" 
                placeholder="Enter manager code"
                value={safeData.managerAuthCode || ''}
                onChange={(e) => onChange('managerAuthCode', e.target.value)}
              />
            </div>

            <Button 
              className="w-full" 
              variant="default"
              onClick={() => onChange('overrideApplied', true)}
            >
              Apply Override
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Approvals Section */}
      <Card>
        <CardHeader>
          <CardTitle>Approvals & Signatures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Inspector</Label>
              <Input 
                placeholder="Name"
                value={safeData.inspectorName || checkInData?.inspectorName || ''}
                onChange={(e) => onChange('inspectorName', e.target.value)}
              />
              <Input 
                type="date"
                value={safeData.inspectorDate || ''}
                onChange={(e) => onChange('inspectorDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Manager</Label>
              <Input 
                placeholder="Name"
                value={safeData.managerName || ''}
                onChange={(e) => onChange('managerName', e.target.value)}
              />
              <Input 
                type="date"
                value={safeData.managerDate || ''}
                onChange={(e) => onChange('managerDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Customer</Label>
              <Input 
                placeholder="Name"
                value={safeData.customerName || ''}
                onChange={(e) => onChange('customerName', e.target.value)}
              />
              <Input 
                type="date"
                value={safeData.customerDate || ''}
                onChange={(e) => onChange('customerDate', e.target.value)}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Signature acknowledges receipt of report and agreement with charges
          </p>
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <div className="text-sm text-destructive space-y-1">
          {errors.map((error, i) => (
            <div key={i}>{error}</div>
          ))}
        </div>
      )}

      {/* Payment Receipt Dialog */}
      <PaymentReceiptDialog
        open={showReceipt}
        onOpenChange={setShowReceipt}
        agreementNo="AGR-000123"
        customerName="Ahmed Al Mansoori"
        customerEmail="ahmed@example.com"
        customerPhone="+971501234567"
        totalAmount={additionalPayment}
        splitPayments={(safeData.splitPayments || []) as SplitPaymentItem[]}
        securityDepositHeld={securityDeposit}
        securityDepositRefund={Math.max(0, securityDeposit - grandTotal)}
        chargesBreakdown={[
          { label: 'Damage Charges', amount: totalDamageCharges },
          { label: 'Fuel Shortage', amount: fuelCharge },
          { label: 'Excess Kilometers', amount: excessKmCharge },
          ...(cleaningCharge > 0 ? [{ label: 'Cleaning Fee', amount: cleaningCharge }] : []),
          ...(lateReturnCharge > 0 ? [{ label: 'Late Return Fee', amount: lateReturnCharge }] : []),
          ...(salikCharge > 0 ? [{ label: 'Salik/Toll Charges', amount: salikCharge }] : []),
        ]}
        completedAt={new Date().toISOString()}
      />
    </div>
  );
};
