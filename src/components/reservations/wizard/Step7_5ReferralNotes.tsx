import React from 'react';
import { useReservationWizard } from './ReservationWizardContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, MessageSquare, Tag } from 'lucide-react';

export const Step7_5ReferralNotes: React.FC = () => {
  const { wizardData, updateWizardData } = useReservationWizard();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Referral & Additional Notes</h2>
        <p className="text-muted-foreground">
          Add referral information and any special notes for this reservation
        </p>
      </div>

      {/* Referral Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Referral Program
          </CardTitle>
          <CardDescription>
            Track referrals and apply referral discounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Referral Customer */}
          <div className="space-y-2">
            <Label htmlFor="referralCustomer">Referred By Customer</Label>
            <Select
              value={wizardData.referralCustomerId || ''}
              onValueChange={(value) => updateWizardData({ referralCustomerId: value })}
            >
              <SelectTrigger id="referralCustomer">
                <SelectValue placeholder="Select referring customer (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Referral</SelectItem>
                <SelectItem value="cust-001">John Doe (C-001)</SelectItem>
                <SelectItem value="cust-002">Jane Smith (C-002)</SelectItem>
                <SelectItem value="cust-003">Ahmed Ali (C-003)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Referral Code */}
          <div className="space-y-2">
            <Label htmlFor="referralCode" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Referral Code
            </Label>
            <Input
              id="referralCode"
              placeholder="Enter referral code (optional)"
              value={wizardData.referralCode || ''}
              onChange={(e) => updateWizardData({ referralCode: e.target.value.toUpperCase() })}
              className="uppercase"
            />
            <p className="text-xs text-muted-foreground">
              Enter a valid referral code to apply any applicable discounts
            </p>
          </div>

          {wizardData.referralCode && (
            <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  ✓ Referral code applied. A 5% discount will be applied to the total amount.
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Additional Notes
          </CardTitle>
          <CardDescription>
            Add any special instructions or notes for this reservation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* General Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">General Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any general notes, preferences, or special requests..."
              value={wizardData.notes || ''}
              onChange={(e) => updateWizardData({ notes: e.target.value })}
              rows={4}
            />
          </div>

          {/* Special Notes */}
          <div className="space-y-2">
            <Label htmlFor="specialNotes">Special Instructions</Label>
            <Textarea
              id="specialNotes"
              placeholder="Add any special instructions for staff (vehicle preparation, delivery notes, etc.)..."
              value={wizardData.specialNotes || ''}
              onChange={(e) => updateWizardData({ specialNotes: e.target.value })}
              rows={4}
              className="border-orange-200 dark:border-orange-800 focus-visible:ring-orange-500"
            />
            <p className="text-xs text-muted-foreground">
              These notes will be highlighted for staff attention
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
