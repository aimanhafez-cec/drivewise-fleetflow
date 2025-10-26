import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReservationWizard } from './ReservationWizardContext';
import { Bug, ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export const WizardDebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { wizardData, currentStep } = useReservationWizard();

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const getStepStatus = (stepNum: number) => {
    if (currentStep === stepNum) return 'current';
    if (currentStep > stepNum) return 'complete';
    return 'pending';
  };

  const criticalFields = {
    step1: { reservationType: wizardData.reservationType },
    step2: {
      businessUnitId: wizardData.businessUnitId,
      reservationMethodId: wizardData.reservationMethodId,
      paymentTermsId: wizardData.paymentTermsId,
    },
    step3: { customerId: wizardData.customerId },
    step4: {
      pickupDate: wizardData.pickupDate,
      returnDate: wizardData.returnDate,
      pickupLocation: wizardData.pickupLocation,
    },
    step5: { lineCount: wizardData.reservationLines?.length || 0 },
    step6: {
      priceListId: wizardData.priceListId,
      dailyRate: wizardData.dailyRate,
    },
    step7: { totalAmount: wizardData.totalAmount },
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="border-2 border-amber-500 shadow-lg">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-accent p-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Bug className="h-4 w-4 text-amber-500" />
                  <span>Wizard Debug</span>
                  <Badge variant="outline" className="text-xs">
                    Step {currentStep}/14
                  </Badge>
                </div>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="space-y-3 p-3 text-xs">
              {/* Step Progress */}
              <div className="space-y-1">
                <h4 className="font-semibold text-xs mb-2">Step Status:</h4>
                <div className="grid grid-cols-7 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((step) => {
                    const status = getStepStatus(step);
                    return (
                      <div
                        key={step}
                        className={`h-6 flex items-center justify-center rounded text-xs font-medium ${
                          status === 'current'
                            ? 'bg-primary text-primary-foreground'
                            : status === 'complete'
                            ? 'bg-green-500 text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {step}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Critical Fields */}
              <div className="space-y-2">
                <h4 className="font-semibold text-xs">Critical Fields:</h4>
                
                {/* Step 1 */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Reservation Type:</span>
                  <span className="font-mono">
                    {criticalFields.step1.reservationType ? (
                      <Badge variant="outline" className="text-xs">
                        {criticalFields.step1.reservationType}
                      </Badge>
                    ) : (
                      <XCircle className="h-3 w-3 text-destructive" />
                    )}
                  </span>
                </div>

                {/* Step 5 */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Vehicle Lines:</span>
                  <span className="font-mono">
                    {criticalFields.step5.lineCount > 0 ? (
                      <Badge variant="outline" className="text-xs">
                        {criticalFields.step5.lineCount} line(s)
                      </Badge>
                    ) : (
                      <XCircle className="h-3 w-3 text-destructive" />
                    )}
                  </span>
                </div>

                {/* Step 6 */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Price List:</span>
                  <span className="font-mono">
                    {criticalFields.step6.priceListId ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-destructive" />
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Daily Rate:</span>
                  <span className="font-mono">
                    {criticalFields.step6.dailyRate ? (
                      <span className="text-green-600">
                        AED {criticalFields.step6.dailyRate}
                      </span>
                    ) : (
                      <span className="text-destructive">Not Set</span>
                    )}
                  </span>
                </div>

                {/* Step 7 */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-mono">
                    {criticalFields.step7.totalAmount ? (
                      <span className="text-green-600 font-semibold">
                        AED {criticalFields.step7.totalAmount.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-destructive">Not Calculated</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Line Details */}
              {wizardData.reservationLines && wizardData.reservationLines.length > 0 && (
                <div className="space-y-1">
                  <h4 className="font-semibold text-xs">Reservation Lines:</h4>
                  {wizardData.reservationLines.map((line, idx) => (
                    <div
                      key={line.id}
                      className="p-2 bg-muted rounded text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Line {line.lineNo}</span>
                        {line.lineTotal && line.lineTotal > 0 ? (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                            AED {line.lineTotal.toFixed(2)}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700">
                            Pending
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground">
                        {wizardData.reservationType === 'vehicle_class' && (
                          <span>Class: {line.vehicleClassId || 'Not set'}</span>
                        )}
                        {wizardData.reservationType === 'specific_vehicle' && (
                          <span>
                            {line.vehicleId 
                              ? `VIN: ${line.vehicleId}` 
                              : line.vehicleData?.make && line.vehicleData?.model
                              ? `${line.vehicleData.make} ${line.vehicleData.model}`
                              : 'Not set'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Validation Status */}
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 text-xs">
                  {currentStep >= 7 && criticalFields.step7.totalAmount ? (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-green-600">Pricing Calculated</span>
                    </>
                  ) : currentStep >= 6 && criticalFields.step6.priceListId ? (
                    <>
                      <AlertCircle className="h-3 w-3 text-amber-500" />
                      <span className="text-amber-600">Awaiting Calculation</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Configuration Pending</span>
                    </>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  console.log('📊 Full Wizard Data:', wizardData);
                }}
              >
                Log Full Data to Console
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};
