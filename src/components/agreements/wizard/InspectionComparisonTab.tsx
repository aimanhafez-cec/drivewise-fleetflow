import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  Mail,
  Printer,
  AlertCircle,
  Filter,
  DollarSign,
  FileText,
  Shield
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { InspectionData, ComparisonReport } from '@/types/agreement-wizard';

const VAT_RATE = 0.05; // 5% UAE VAT

// Mock damage cost calculation
const calculateDamageCost = (damageType: string, severity: string): number => {
  const costs: Record<string, Record<string, number>> = {
    SCRATCH: { minor: 250, moderate: 600, major: 1200 },
    DENT: { minor: 450, moderate: 850, major: 2500 },
    CRACK: { minor: 600, moderate: 1000, major: 2000 },
    PAINT: { minor: 350, moderate: 700, major: 1500 },
    GLASS: { minor: 500, moderate: 1200, major: 2500 },
    BROKEN: { minor: 400, moderate: 800, major: 1800 },
    MISSING: { minor: 500, moderate: 1000, major: 2000 },
    OTHER: { minor: 300, moderate: 600, major: 1200 },
  };

  return costs[damageType]?.[severity] || 500;
};

interface InspectionComparisonTabProps {
  checkOutData: InspectionData;
  checkInData: InspectionData;
  comparisonReport?: ComparisonReport;
  onUpdate: (report: ComparisonReport) => void;
}

interface DamageItem {
  id: string;
  damageType: string;
  location: string;
  severity: string;
  existedAtCheckout: boolean;
  repairCost: number;
  chargeable: boolean;
  chargeableAmount: number;
  notes: string;
  requiresInsurance: boolean;
}

export function InspectionComparisonTab({
  checkOutData,
  checkInData,
  comparisonReport,
  onUpdate
}: InspectionComparisonTabProps) {
  const [showPreExisting, setShowPreExisting] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [chargeableFilter, setChargeableFilter] = useState<string>('all');
  const [managerOverride, setManagerOverride] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate damages
  const damages = useMemo<DamageItem[]>(() => {
    setIsCalculating(true);
    
    const checkoutDamages = checkOutData.damageMarkers.map(m => m.id);
    const newDamages = checkInData.damageMarkers.filter(
      m => !checkoutDamages.includes(m.id)
    );

    const result = newDamages.map((marker) => {
      const cost = calculateDamageCost(marker.type, marker.severity);
      const requiresInsurance = marker.severity === 'major' && cost > 2000;
      
      return {
        id: marker.id,
        damageType: marker.type,
        location: `${marker.side || marker.view || 'General'} - ${marker.notes || 'Unspecified'}`,
        severity: marker.severity,
        existedAtCheckout: false,
        repairCost: cost,
        chargeable: !requiresInsurance,
        chargeableAmount: requiresInsurance ? 0 : cost,
        notes: marker.notes || '',
        requiresInsurance
      };
    });
    
    setTimeout(() => setIsCalculating(false), 300);
    return result;
  }, [checkOutData, checkInData]);

  // Calculate additional charges
  const fuelDifference = checkOutData.fuelLevel - checkInData.fuelLevel;
  const fuelCharge = fuelDifference > 0 ? (fuelDifference / 100) * 60 * 4.5 : 0; // 60L tank, AED 4.5/L

  const kmDriven = checkInData.odometerReading - checkOutData.odometerReading;
  const includedKm = 500; // Mock: would come from agreement
  const excessKm = Math.max(0, kmDriven - includedKm);
  const excessKmCharge = excessKm * 2.0; // AED 2/km

  const cleaningRequired = false; // Would be determined by inspection
  const cleaningCharge = cleaningRequired ? 150 : 0;

  const lateReturnHours = 4.5; // Mock: would calculate from timestamps
  const lateReturnCharge = lateReturnHours > 0 ? Math.ceil(lateReturnHours) * 50 : 0;

  const salikTrips = 18; // Mock: would come from Salik system
  const salikCharge = salikTrips * 8;

  // Calculate totals
  const totalDamageCharges = damages.reduce((sum, d) => sum + d.chargeableAmount, 0);
  const totalAdditionalCharges = fuelCharge + excessKmCharge + cleaningCharge + lateReturnCharge + salikCharge;
  const subtotal = totalDamageCharges + totalAdditionalCharges;
  const vatAmount = subtotal * VAT_RATE;
  const grandTotal = subtotal + vatAmount;
  const securityDeposit = 1500; // Mock: would come from agreement
  const additionalPayment = Math.max(0, grandTotal - securityDeposit);

  // Filter damages
  const filteredDamages = damages.filter(d => {
    if (severityFilter !== 'all' && d.severity !== severityFilter) return false;
    if (chargeableFilter === 'chargeable' && !d.chargeable) return false;
    if (chargeableFilter === 'non-chargeable' && d.chargeable) return false;
    return true;
  });

  const handleExportPDF = () => {
    // Mock: Would generate PDF
    console.log('Exporting to PDF...');
  };

  const handleEmailReport = () => {
    // Mock: Would send email
    console.log('Emailing report...');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:space-y-4 animate-fade-in" role="region" aria-label="Damage comparison report">
      {/* Loading state */}
      {isCalculating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Calculating costs..." />
        </div>
      )}

      {/* Header Summary Card */}
      <Card className="border-primary animate-scale-in print-break-inside-avoid">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-xl lg:text-2xl">Damage & Charges Report</CardTitle>
              <CardDescription className="mt-2">
                Comprehensive comparison between check-out and check-in inspections
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
              <p className="text-sm text-muted-foreground">{checkOutData.inspectorName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Check-In</p>
              <p className="font-semibold">Oct 20, 2025</p>
              <p className="text-sm text-muted-foreground">{checkInData.inspectorName || 'N/A'}</p>
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
              <Button variant="outline" size="sm" onClick={handleExportPDF} aria-label="Export report as PDF">
                <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Export PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleEmailReport} aria-label="Email report">
                <Mail className="w-4 h-4 mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Email</span>
                <span className="sm:hidden">Mail</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint} aria-label="Print report">
                <Printer className="w-4 h-4 mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Print</span>
                <span className="sm:hidden">Print</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <CardTitle className="text-base">Filters</CardTitle>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-preexisting"
                  checked={showPreExisting}
                  onCheckedChange={(checked) => setShowPreExisting(checked as boolean)}
                />
                <Label htmlFor="show-preexisting" className="text-sm cursor-pointer">
                  Show pre-existing damages
                </Label>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label className="text-sm">Severity</Label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="minor">Minor</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="major">Major</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="text-sm">Chargeable Status</Label>
              <Select value={chargeableFilter} onValueChange={setChargeableFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Damages</SelectItem>
                  <SelectItem value="chargeable">Chargeable Only</SelectItem>
                  <SelectItem value="non-chargeable">Non-Chargeable Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Damage Analysis Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Damage Analysis</CardTitle>
            <Badge variant={damages.length > 0 ? "destructive" : "default"}>
              {damages.length} New Damage{damages.length !== 1 ? 's' : ''} Found
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDamages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-success" />
              <p className="text-lg font-medium">No New Damages Found</p>
              <p className="text-sm">Vehicle returned in the same condition as check-out</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Damage Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead className="text-center">Existed at<br />Checkout?</TableHead>
                    <TableHead className="text-right">Repair Cost<br />(AED)</TableHead>
                    <TableHead className="text-center">Chargeable</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDamages.map((damage, index) => (
                    <TableRow key={damage.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{damage.damageType}</Badge>
                      </TableCell>
                      <TableCell>{damage.location}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            damage.severity === 'major' ? 'destructive' : 
                            damage.severity === 'moderate' ? 'default' : 
                            'secondary'
                          }
                        >
                          {damage.severity === 'major' ? 'Major' : damage.severity === 'moderate' ? 'Moderate' : 'Minor'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {damage.existedAtCheckout ? (
                          <CheckCircle2 className="w-5 h-5 text-success mx-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-destructive mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {damage.repairCost.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        {damage.requiresInsurance ? (
                          <Badge variant="outline" className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Insurance
                          </Badge>
                        ) : damage.chargeable ? (
                          <div className="flex flex-col items-center gap-1">
                            <CheckCircle2 className="w-5 h-5 text-success" />
                            <span className="text-xs font-semibold">{damage.chargeableAmount.toFixed(2)}</span>
                          </div>
                        ) : (
                          <XCircle className="w-5 h-5 text-muted-foreground mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {damage.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={5} className="text-right">Subtotal - Damages:</TableCell>
                    <TableCell className="text-right">{totalDamageCharges.toFixed(2)}</TableCell>
                    <TableCell colSpan={2}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
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
                    <p>Scheduled return: Oct 20, 2025 10:00 AM</p>
                    <p>Actual return: Oct 20, 2025 2:30 PM</p>
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

      {/* Payment Options */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="card" />
            <Label htmlFor="card" className="cursor-pointer">Charge to card on file</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="cash" />
            <Label htmlFor="cash" className="cursor-pointer">Cash payment</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="transfer" />
            <Label htmlFor="transfer" className="cursor-pointer">Bank transfer</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="dispute" />
            <Label htmlFor="dispute" className="cursor-pointer text-destructive">
              Dispute charges (requires manager approval)
            </Label>
          </div>
        </CardContent>
      </Card>

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
              <Select>
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
              <Textarea placeholder="Explain the reason for this adjustment..." rows={3} />
            </div>

            <div className="space-y-2">
              <Label>Manager Authorization Code</Label>
              <Input type="password" placeholder="Enter manager code" />
            </div>

            <Button className="w-full" variant="default">
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
              <Input placeholder="Name" />
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Manager</Label>
              <Input placeholder="Name" />
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Customer</Label>
              <Input placeholder="Name" />
              <Input type="date" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Signature acknowledges receipt of report and agreement with charges
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" size="lg">
          Save as Draft
        </Button>
        <Button variant="default" size="lg" className="bg-success hover:bg-success/90">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Finalize Report
        </Button>
      </div>
    </div>
  );
}
