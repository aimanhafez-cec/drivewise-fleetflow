import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import type { EnhancedWizardData } from '@/types/agreement-wizard';

interface FinalReviewStepProps {
  wizardData: EnhancedWizardData;
  onChange: (field: keyof EnhancedWizardData['step8'], value: any) => void;
  errors?: string[];
}

export const FinalReviewStep: React.FC<FinalReviewStepProps> = ({
  wizardData,
  onChange,
  errors = [],
}) => {
  const step8 = wizardData.step8;

  const updateDistribution = (key: keyof EnhancedWizardData['step8']['distributionMethods'], value: boolean) => {
    onChange('distributionMethods', {
      ...step8.distributionMethods,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <CardTitle>Agreement Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Source</h3>
            <Badge variant="secondary" className="capitalize">
              {wizardData.source.replace('_', ' ')}
            </Badge>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Agreement Details</h3>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">Type:</dt>
              <dd className="capitalize">{wizardData.step1.agreementType}</dd>
              
              <dt className="text-muted-foreground">Purpose:</dt>
              <dd className="capitalize">{wizardData.step1.rentalPurpose}</dd>
              
              <dt className="text-muted-foreground">Pickup:</dt>
              <dd>{new Date(wizardData.step1.pickupDateTime).toLocaleString()}</dd>
              
              <dt className="text-muted-foreground">Drop-off:</dt>
              <dd>{new Date(wizardData.step1.dropoffDateTime).toLocaleString()}</dd>
            </dl>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Vehicle Inspection</h3>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">Fuel Level:</dt>
              <dd>{wizardData.step2.fuelLevel}%</dd>
              
              <dt className="text-muted-foreground">Odometer:</dt>
              <dd>{wizardData.step2.odometerReading.toLocaleString()} KM</dd>
              
              <dt className="text-muted-foreground">Damage Markers:</dt>
              <dd>{wizardData.step2.damageMarkers.length} noted</dd>
            </dl>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Pricing</h3>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Base Rate:</dt>
                <dd>AED {wizardData.step3.pricingBreakdown.baseRate.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Insurance:</dt>
                <dd>AED {wizardData.step3.pricingBreakdown.insurance.toFixed(2)}</dd>
              </div>
              {wizardData.step4.selectedAddons.length > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Add-ons ({wizardData.step4.selectedAddons.length}):</dt>
                  <dd>AED {wizardData.step4.selectedAddons.reduce((sum, a) => sum + a.totalCost, 0).toFixed(2)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">VAT:</dt>
                <dd>AED {wizardData.step3.pricingBreakdown.vat.toFixed(2)}</dd>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <dt>Total:</dt>
                <dd className="text-primary">AED {wizardData.step3.pricingBreakdown.total.toFixed(2)}</dd>
              </div>
            </dl>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Payment</h3>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">Method:</dt>
              <dd className="capitalize">{wizardData.step5.paymentMethod.replace('_', ' ')}</dd>
              
              <dt className="text-muted-foreground">Schedule:</dt>
              <dd className="capitalize">{wizardData.step5.paymentSchedule}</dd>
              
              <dt className="text-muted-foreground">Advance Payment:</dt>
              <dd>AED {wizardData.step5.advancePayment.amount.toFixed(2)}</dd>
              
              <dt className="text-muted-foreground">Security Deposit:</dt>
              <dd>AED {wizardData.step5.securityDeposit.amount.toFixed(2)}</dd>
            </dl>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Documents</h3>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">Emirates ID:</dt>
              <dd>{wizardData.step6.emiratesIdVerified ? '✅ Verified' : '❌ Not Verified'}</dd>
              
              <dt className="text-muted-foreground">License:</dt>
              <dd>{wizardData.step6.licenseVerified ? '✅ Verified' : '❌ Not Verified'}</dd>
              
              <dt className="text-muted-foreground">Black Points:</dt>
              <dd>
                {wizardData.step6.blackPointsChecked
                  ? `✅ Checked (${wizardData.step6.blackPointsCount || 0} points)`
                  : '❌ Not Checked'}
              </dd>
            </dl>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Signature</h3>
            <p className="text-sm text-muted-foreground">
              {wizardData.step7.customerSignature ? '✅ Customer signature captured' : '❌ No signature'}
            </p>
            <p className="text-sm text-muted-foreground">
              {wizardData.step7.termsAccepted ? '✅ Terms accepted' : '❌ Terms not accepted'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribution Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="email"
              checked={step8.distributionMethods.email}
              onCheckedChange={(checked) => updateDistribution('email', checked as boolean)}
            />
            <Label htmlFor="email">Send via Email</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="sms"
              checked={step8.distributionMethods.sms}
              onCheckedChange={(checked) => updateDistribution('sms', checked as boolean)}
            />
            <Label htmlFor="sms">Send via SMS</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="whatsapp"
              checked={step8.distributionMethods.whatsapp}
              onCheckedChange={(checked) => updateDistribution('whatsapp', checked as boolean)}
            />
            <Label htmlFor="whatsapp">Send via WhatsApp</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="print"
              checked={step8.distributionMethods.print}
              onCheckedChange={(checked) => updateDistribution('print', checked as boolean)}
            />
            <Label htmlFor="print">Print Copy</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Final Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={step8.finalNotes || ''}
            onChange={(e) => onChange('finalNotes', e.target.value)}
            rows={4}
            placeholder="Any final notes or special instructions..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="reviewCompleted"
              checked={step8.reviewCompleted}
              onCheckedChange={(checked) => onChange('reviewCompleted', checked as boolean)}
            />
            <Label htmlFor="reviewCompleted" className="text-lg font-semibold">
              I have reviewed all information and confirm it is accurate
            </Label>
          </div>
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <div className="text-sm text-destructive">
          {errors.map((error, i) => (
            <div key={i}>{error}</div>
          ))}
        </div>
      )}
    </div>
  );
};
