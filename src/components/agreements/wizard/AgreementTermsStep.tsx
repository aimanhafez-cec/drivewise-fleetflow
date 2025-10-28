import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CustomerSelect, LocationSelect } from '@/components/ui/select-components';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link, Award, Lock } from 'lucide-react';
import type { EnhancedWizardData } from '@/types/agreement-wizard';

interface AgreementTermsStepProps {
  data: EnhancedWizardData['step1'];
  onChange: (field: keyof EnhancedWizardData['step1'], value: any) => void;
  errors?: string[];
  source?: 'reservation' | 'instant_booking' | 'direct';
  instantBookingScore?: number;
}

export const AgreementTermsStep: React.FC<AgreementTermsStepProps> = ({
  data,
  onChange,
  errors = [],
  source,
  instantBookingScore,
}) => {
  const isFromInstantBooking = source === 'instant_booking';
  
  const FieldBadge = ({ locked = false }: { locked?: boolean }) => (
    <Badge variant={locked ? "secondary" : "outline"} className="ml-2">
      {locked ? (
        <>
          <Lock className="h-3 w-3 mr-1" />
          Locked
        </>
      ) : (
        <>
          <Link className="h-3 w-3 mr-1" />
          Pre-filled
        </>
      )}
    </Badge>
  );

  return (
    <div className="space-y-6">
      {isFromInstantBooking && (
        <Alert className="bg-blue-50 border-blue-200">
          <Link className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold">Pre-filled from Instant Booking</span>
                <p className="text-sm mt-1">
                  Customer and rental details have been imported. Locked fields cannot be changed.
                </p>
              </div>
              {instantBookingScore && (
                <Badge variant="secondary" className="ml-4 flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  Score: {instantBookingScore}
                </Badge>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Customer & Agreement Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer" className="required flex items-center">
              Customer *
              {isFromInstantBooking && <FieldBadge locked />}
            </Label>
            <CustomerSelect
              value={data.customerId || ''}
              onChange={(value) => onChange('customerId', value)}
              disabled={isFromInstantBooking}
            />
            {isFromInstantBooking && (
              <p className="text-xs text-muted-foreground">
                Customer verified through instant booking process
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agreementType" className="required">
                Agreement Type *
              </Label>
              <Select
                value={data.agreementType}
                onValueChange={(value) => onChange('agreementType', value)}
              >
                <SelectTrigger id="agreementType" aria-required="true">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="long_term">Long Term</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rentalPurpose" className="required">
                Rental Purpose *
              </Label>
              <Select
                value={data.rentalPurpose}
                onValueChange={(value) => onChange('rentalPurpose', value)}
              >
                <SelectTrigger id="rentalPurpose" aria-required="true">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="tourism">Tourism</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pickup & Drop-off Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickupLocation" className="required flex items-center">
                Pickup Location *
                {isFromInstantBooking && <FieldBadge locked />}
              </Label>
              <LocationSelect
                value={data.pickupLocationId}
                onChange={(value) => onChange('pickupLocationId', value)}
                disabled={isFromInstantBooking}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickupDateTime" className="required flex items-center">
                Pickup Date & Time *
                {isFromInstantBooking && <FieldBadge locked />}
              </Label>
              <Input
                id="pickupDateTime"
                type="datetime-local"
                value={data.pickupDateTime}
                onChange={(e) => onChange('pickupDateTime', e.target.value)}
                required
                aria-required="true"
                disabled={isFromInstantBooking}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dropoffLocation" className="required flex items-center">
                Drop-off Location *
                {isFromInstantBooking && <FieldBadge locked />}
              </Label>
              <LocationSelect
                value={data.dropoffLocationId}
                onChange={(value) => onChange('dropoffLocationId', value)}
                disabled={isFromInstantBooking}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dropoffDateTime" className="required flex items-center">
                Drop-off Date & Time *
                {isFromInstantBooking && <FieldBadge locked />}
              </Label>
              <Input
                id="dropoffDateTime"
                type="datetime-local"
                value={data.dropoffDateTime}
                onChange={(e) => onChange('dropoffDateTime', e.target.value)}
                required
                aria-required="true"
                disabled={isFromInstantBooking}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mileage & Cross-Border</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mileagePackage">Mileage Package</Label>
              <Select
                value={data.mileagePackage}
                onValueChange={(value) => onChange('mileagePackage', value)}
              >
                <SelectTrigger id="mileagePackage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unlimited">Unlimited</SelectItem>
                  <SelectItem value="limited">Limited</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {data.mileagePackage === 'limited' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="includedKm">Included KM</Label>
                  <Input
                    id="includedKm"
                    type="number"
                    value={data.includedKm || ''}
                    onChange={(e) => onChange('includedKm', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excessKmRate">Excess KM Rate (AED)</Label>
                  <Input
                    id="excessKmRate"
                    type="number"
                    step="0.01"
                    value={data.excessKmRate || ''}
                    onChange={(e) => onChange('excessKmRate', parseFloat(e.target.value))}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="crossBorderAllowed"
              checked={data.crossBorderAllowed}
              onCheckedChange={(checked) => onChange('crossBorderAllowed', checked)}
            />
            <Label htmlFor="crossBorderAllowed">Allow Cross-Border Travel</Label>
          </div>

          {data.crossBorderAllowed && (
            <div className="space-y-2">
              <Label htmlFor="crossBorderCountries">Allowed Countries</Label>
              <Input
                id="crossBorderCountries"
                placeholder="e.g., Oman, Saudi Arabia"
                value={data.crossBorderCountries?.join(', ') || ''}
                onChange={(e) =>
                  onChange(
                    'crossBorderCountries',
                    e.target.value.split(',').map((c) => c.trim())
                  )
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salikAccountNo" className="flex items-center">
                Salik Account Number
                {isFromInstantBooking && data.salikAccountNo && <FieldBadge />}
              </Label>
              <Input
                id="salikAccountNo"
                value={data.salikAccountNo || ''}
                onChange={(e) => onChange('salikAccountNo', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="darbAccountNo" className="flex items-center">
                Darb Account Number
                {isFromInstantBooking && data.darbAccountNo && <FieldBadge />}
              </Label>
              <Input
                id="darbAccountNo"
                value={data.darbAccountNo || ''}
                onChange={(e) => onChange('darbAccountNo', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialInstructions" className="flex items-center">
              Special Instructions
              {isFromInstantBooking && data.specialInstructions && <FieldBadge />}
            </Label>
            <Textarea
              id="specialInstructions"
              rows={3}
              value={data.specialInstructions || ''}
              onChange={(e) => onChange('specialInstructions', e.target.value)}
              placeholder="Any special requests or instructions..."
            />
            {isFromInstantBooking && data.specialInstructions && (
              <p className="text-xs text-muted-foreground">
                Original request from instant booking
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="internalNotes">Internal Notes</Label>
            <Textarea
              id="internalNotes"
              rows={3}
              value={data.internalNotes || ''}
              onChange={(e) => onChange('internalNotes', e.target.value)}
              placeholder="Internal notes (not visible to customer)..."
            />
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
