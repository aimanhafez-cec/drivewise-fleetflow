import React from 'react';
import { useReservationWizard } from './ReservationWizardContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
            <Select
              value={wizardData.insuranceLevelId || ''}
              onValueChange={(value) => updateWizardData({ insuranceLevelId: value })}
            >
              <SelectTrigger id="insuranceLevel">
                <SelectValue placeholder="Select insurance level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic Coverage</SelectItem>
                <SelectItem value="standard">Standard Coverage</SelectItem>
                <SelectItem value="comprehensive">Comprehensive Coverage</SelectItem>
                <SelectItem value="premium">Premium Coverage</SelectItem>
                <SelectItem value="zero-excess">Zero Excess</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Insurance Group */}
          <div className="space-y-2">
            <Label htmlFor="insuranceGroup">
              Insurance Group
            </Label>
            <Select
              value={wizardData.insuranceGroupId || ''}
              onValueChange={(value) => updateWizardData({ insuranceGroupId: value })}
            >
              <SelectTrigger id="insuranceGroup">
                <SelectValue placeholder="Select insurance group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="group-a">Group A (Economy)</SelectItem>
                <SelectItem value="group-b">Group B (Compact)</SelectItem>
                <SelectItem value="group-c">Group C (Midsize)</SelectItem>
                <SelectItem value="group-d">Group D (Standard)</SelectItem>
                <SelectItem value="group-e">Group E (SUV)</SelectItem>
                <SelectItem value="group-f">Group F (Luxury)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Insurance Provider */}
          <div className="space-y-2">
            <Label htmlFor="insuranceProvider">
              Insurance Provider
            </Label>
            <Select
              value={wizardData.insuranceProviderId || ''}
              onValueChange={(value) => updateWizardData({ insuranceProviderId: value })}
            >
              <SelectTrigger id="insuranceProvider">
                <SelectValue placeholder="Select insurance provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="axa">AXA Insurance</SelectItem>
                <SelectItem value="oman">Oman Insurance Company</SelectItem>
                <SelectItem value="orient">Orient Insurance</SelectItem>
                <SelectItem value="dubai">Dubai Insurance</SelectItem>
                <SelectItem value="abu-dhabi">Abu Dhabi National Insurance</SelectItem>
                <SelectItem value="alliance">Alliance Insurance</SelectItem>
              </SelectContent>
            </Select>
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
