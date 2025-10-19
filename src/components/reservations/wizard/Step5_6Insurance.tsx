import React from 'react';
import { useReservationWizard } from './ReservationWizardContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { InsuranceLevelSelect, InsuranceGroupSelect, InsuranceProviderSelect } from '@/components/ui/select-components';
import { Shield, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const Step5_6Insurance: React.FC = () => {
  const { wizardData, updateWizardData } = useReservationWizard();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Insurance Configuration</h2>
        <p className="text-muted-foreground">
          Configure insurance coverage for this reservation
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Insurance Settings
          </CardTitle>
          <CardDescription>
            Select insurance level, group, and provider
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Insurance Level */}
          <div className="space-y-2">
            <Label htmlFor="insuranceLevel">
              Insurance Level
            </Label>
            <InsuranceLevelSelect
              value={wizardData.insuranceLevelId}
              onChange={(value) => updateWizardData({ insuranceLevelId: value as string })}
            />
          </div>

          {/* Insurance Group */}
          <div className="space-y-2">
            <Label htmlFor="insuranceGroup">
              Insurance Group
            </Label>
            <InsuranceGroupSelect
              value={wizardData.insuranceGroupId}
              onChange={(value) => updateWizardData({ insuranceGroupId: value as string })}
            />
          </div>

          {/* Insurance Provider */}
          <div className="space-y-2">
            <Label htmlFor="insuranceProvider">
              Insurance Provider
            </Label>
            <InsuranceProviderSelect
              value={wizardData.insuranceProviderId}
              onChange={(value) => updateWizardData({ insuranceProviderId: value as string })}
            />
          </div>

          {/* Insurance Summary */}
          {wizardData.insuranceLevelId && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Coverage Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium capitalize">
                      {wizardData.insuranceLevelId.replace('-', ' ')}
                    </span>
                  </div>
                  {wizardData.insuranceGroupId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Group:</span>
                      <span className="font-medium uppercase">
                        {wizardData.insuranceGroupId}
                      </span>
                    </div>
                  )}
                  {wizardData.insuranceProviderId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Provider:</span>
                      <span className="font-medium capitalize">
                        {wizardData.insuranceProviderId.replace('-', ' ')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Insurance coverage details will be included in the final agreement. Excess amounts and additional coverage options can be configured in the pricing step.
        </AlertDescription>
      </Alert>
    </div>
  );
};
