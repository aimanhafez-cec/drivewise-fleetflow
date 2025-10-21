import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EnhancedSignaturePad } from '@/components/agreements/shared/EnhancedSignaturePad';
import { AlertCircle } from 'lucide-react';
import type { EnhancedWizardData } from '@/types/agreement-wizard';

interface TermsSignatureStepProps {
  data: EnhancedWizardData['step7'];
  onChange: (field: keyof EnhancedWizardData['step7'], value: any) => void;
  errors?: string[];
}

export const TermsSignatureStep: React.FC<TermsSignatureStepProps> = ({
  data,
  onChange,
  errors = [],
}) => {
  const updateKeyTerms = (key: keyof EnhancedWizardData['step7']['keyTermsAcknowledged'], value: boolean) => {
    onChange('keyTermsAcknowledged', {
      ...data.keyTermsAcknowledged,
      [key]: value,
    });
  };

  const updateDeclarations = (key: keyof EnhancedWizardData['step7']['customerDeclarations'], value: boolean) => {
    onChange('customerDeclarations', {
      ...data.customerDeclarations,
      [key]: value,
    });
  };

  const allKeyTermsAcknowledged = Object.values(data.keyTermsAcknowledged).every(Boolean);
  const allDeclarationsConfirmed = Object.values(data.customerDeclarations).every(Boolean);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Language Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="termsLanguage">Terms & Conditions Language</Label>
            <Select
              value={data.termsLanguage}
              onValueChange={(value) => onChange('termsLanguage', value)}
            >
              <SelectTrigger id="termsLanguage">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">العربية (Arabic)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Terms Acknowledgment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please ensure the customer reads and acknowledges each key term before signing.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="fuelPolicy"
                checked={data.keyTermsAcknowledged.fuelPolicy}
                onCheckedChange={(checked) => updateKeyTerms('fuelPolicy', checked as boolean)}
              />
              <Label htmlFor="fuelPolicy" className="cursor-pointer leading-relaxed">
                <span className="font-semibold">Fuel Policy:</span> Vehicle must be returned with the
                same fuel level as at pickup. Refueling charges apply if returned with less fuel.
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="insuranceCoverage"
                checked={data.keyTermsAcknowledged.insuranceCoverage}
                onCheckedChange={(checked) => updateKeyTerms('insuranceCoverage', checked as boolean)}
              />
              <Label htmlFor="insuranceCoverage" className="cursor-pointer leading-relaxed">
                <span className="font-semibold">Insurance Coverage:</span> Comprehensive insurance
                includes collision damage waiver with specified excess. Customer is liable for excess
                amount in case of damage.
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="tollsFinesLiability"
                checked={data.keyTermsAcknowledged.tollsFinesLiability}
                onCheckedChange={(checked) => updateKeyTerms('tollsFinesLiability', checked as boolean)}
              />
              <Label htmlFor="tollsFinesLiability" className="cursor-pointer leading-relaxed">
                <span className="font-semibold">Tolls & Fines:</span> Customer is responsible for all
                Salik/Darb tolls and traffic fines incurred during the rental period, plus
                administrative fees.
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="returnPolicy"
                checked={data.keyTermsAcknowledged.returnPolicy}
                onCheckedChange={(checked) => updateKeyTerms('returnPolicy', checked as boolean)}
              />
              <Label htmlFor="returnPolicy" className="cursor-pointer leading-relaxed">
                <span className="font-semibold">Return Policy:</span> Vehicle must be returned to the
                agreed location by the specified date and time. Late return charges apply per hour/day.
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="damageLiability"
                checked={data.keyTermsAcknowledged.damageLiability}
                onCheckedChange={(checked) => updateKeyTerms('damageLiability', checked as boolean)}
              />
              <Label htmlFor="damageLiability" className="cursor-pointer leading-relaxed">
                <span className="font-semibold">Damage Liability:</span> Customer is liable for any
                damage not documented at pickup. All damages must be reported immediately.
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer Declarations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="vehicleConditionConfirmed"
              checked={data.customerDeclarations.vehicleConditionConfirmed}
              onCheckedChange={(checked) => updateDeclarations('vehicleConditionConfirmed', checked as boolean)}
            />
            <Label htmlFor="vehicleConditionConfirmed" className="cursor-pointer">
              I confirm that I have inspected the vehicle and agree with the documented condition
            </Label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="keysDocumentsReceived"
              checked={data.customerDeclarations.keysDocumentsReceived}
              onCheckedChange={(checked) => updateDeclarations('keysDocumentsReceived', checked as boolean)}
            />
            <Label htmlFor="keysDocumentsReceived" className="cursor-pointer">
              I confirm that I have received all keys and documents for the vehicle
            </Label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="termsUnderstood"
              checked={data.customerDeclarations.termsUnderstood}
              onCheckedChange={(checked) => updateDeclarations('termsUnderstood', checked as boolean)}
            />
            <Label htmlFor="termsUnderstood" className="cursor-pointer">
              I confirm that I have read, understood, and agree to all terms and conditions
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer Signature</CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedSignaturePad
            signature={data.customerSignature}
            onSignatureChange={(sig) => onChange('customerSignature', sig)}
            signerLabel="Customer Name"
            required
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Witness Signature (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedSignaturePad
            signature={data.witnessSignature}
            onSignatureChange={(sig) => onChange('witnessSignature', sig)}
            signerLabel="Witness Name"
          />
        </CardContent>
      </Card>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="termsAccepted"
          checked={data.termsAccepted}
          onCheckedChange={(checked) => onChange('termsAccepted', checked as boolean)}
          disabled={!allKeyTermsAcknowledged || !allDeclarationsConfirmed || !data.customerSignature}
        />
        <Label htmlFor="termsAccepted" className="text-lg font-semibold">
          Final Terms Acceptance
        </Label>
      </div>

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
