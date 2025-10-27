import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle, AlertCircle, ArrowRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CheckOutInspectionTab } from './CheckOutInspectionTab';
import { CheckInInspectionTab } from './CheckInInspectionTab';
import { InspectionComparisonTab } from './InspectionComparisonTab';
import { MockDataLoader } from './MockDataLoader';
import type { EnhancedWizardData, InspectionData, ComparisonReport } from '@/types/agreement-wizard';

interface EnhancedInspectionStepProps {
  data: EnhancedWizardData['step2'];
  fullData: EnhancedWizardData;
  onChange: (field: keyof EnhancedWizardData['step2'], value: any) => void;
  onFullUpdate?: (data: Partial<EnhancedWizardData>) => void;
  errors?: string[];
}

export const EnhancedInspectionStep: React.FC<EnhancedInspectionStepProps> = ({
  data,
  fullData,
  onChange,
  onFullUpdate,
  errors = [],
}) => {
  // Initialize inspection mode if not set
  useEffect(() => {
    if (!data.inspectionMode) {
      onChange('inspectionMode', 'checkout_checkin');
      onChange('activeTab', 'checkout');
    }
    // Initialize checkOutInspection with default values if undefined
    if (!data.checkOutInspection) {
      onChange('checkOutInspection', {
        timestamp: new Date().toISOString(),
        inspectorName: '',
        preHandoverChecklist: {
          vehicleCleaned: false,
          vehicleFueled: false,
          documentsReady: false,
          keysAvailable: false,
          warningLightsOk: false,
        },
        fuelLevel: 100,
        odometerReading: 0,
        damageMarkers: [],
        photos: {
          exterior: [],
          interior: [],
          documents: [],
          damages: [],
        },
        inspectionChecklist: {},
        notes: '',
      });
    }
    // Initialize checkInInspection when checkout is complete
    if (data.checkOutInspection && !data.checkInInspection) {
      onChange('checkInInspection', {
        timestamp: new Date().toISOString(),
        inspectorName: '',
        preHandoverChecklist: {
          vehicleCleaned: false,
          vehicleFueled: false,
          documentsReady: false,
          keysAvailable: false,
          warningLightsOk: false,
        },
        fuelLevel: 100,
        odometerReading: data.checkOutInspection.odometerReading,
        damageMarkers: [],
        photos: {
          exterior: [],
          interior: [],
          documents: [],
          damages: [],
        },
        inspectionChecklist: {},
        notes: '',
      });
    }
  }, [data.checkOutInspection]);

  const activeTab = data.activeTab || 'checkout';
  
  // Determine completion status for each tab
  const checkoutComplete = !!data.checkOutInspection && 
    data.checkOutInspection.odometerReading > 0 &&
    data.checkOutInspection.fuelLevel >= 0 &&
    !!data.checkOutInspection.inspectorName;
    
  const checkinComplete = !!data.checkInInspection && 
    data.checkInInspection.odometerReading > 0 &&
    data.checkInInspection.fuelLevel >= 0 &&
    !!data.checkInInspection.inspectorName;
    
  const comparisonComplete = !!data.comparisonReport && 
    data.comparisonReport.reportGeneratedAt !== '';

  // Calculate overall progress
  const completedSteps = [checkoutComplete, checkinComplete, comparisonComplete].filter(Boolean).length;
  const totalSteps = 3;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const handleTabChange = (value: string) => {
    onChange('activeTab', value as 'checkout' | 'checkin' | 'comparison');
  };

  const handleStartCheckIn = () => {
    onChange('activeTab', 'checkin');
  };

  const handleGenerateComparison = () => {
    onChange('activeTab', 'comparison');
  };

  // Get tab status badge
  const getTabBadge = (isComplete: boolean, isActive: boolean) => {
    if (isComplete) {
      return <Badge variant="default" className="ml-2 bg-success text-success-foreground animate-scale-in" aria-label="Complete">
        <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
        Complete
      </Badge>;
    }
    if (isActive) {
      return <Badge variant="default" className="ml-2 bg-primary text-primary-foreground animate-fade-in" aria-label="In Progress">
        In Progress
      </Badge>;
    }
    return <Badge variant="outline" className="ml-2 text-muted-foreground" aria-label="Pending">
      <Circle className="h-3 w-3 mr-1" aria-hidden="true" />
      Pending
    </Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in" role="region" aria-label="Vehicle Inspection">
      {/* Mock Data Loader - Development Only */}
      {onFullUpdate && (
        <div className="animate-fade-in">
          <MockDataLoader onLoadData={onFullUpdate} />
        </div>
      )}

      {/* Header Card */}
      <Card className="animate-fade-in">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle>Vehicle Inspection (Enhanced)</CardTitle>
                <Badge 
                  variant="outline" 
                  className={`
                    ${progressPercentage === 100 ? 'bg-success/10 text-success border-success/20' : 'bg-primary/10 text-primary border-primary/20'}
                    animate-scale-in
                  `}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {completedSteps}/{totalSteps} Complete ({progressPercentage.toFixed(0)}%)
                </Badge>
              </div>
              <CardDescription>
                Complete check-out inspection when vehicle leaves, check-in when it returns, and review the comparison report
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {checkoutComplete && (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20 animate-scale-in">
                  <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
                  <span className="sr-only">Status:</span> Check-Out Done
                </Badge>
              )}
              {checkinComplete && (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20 animate-scale-in">
                  <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
                  <span className="sr-only">Status:</span> Check-In Done
                </Badge>
              )}
              {comparisonComplete && (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20 animate-scale-in">
                  <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
                  <span className="sr-only">Status:</span> Report Generated
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Tracker */}
      <Card className="border-primary/20 bg-primary/5 animate-fade-in print:hidden">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <nav aria-label="Inspection progress" className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
              <div className={`flex items-center gap-2 transition-colors duration-300 ${checkoutComplete ? 'text-success' : 'text-muted-foreground'}`}>
                {checkoutComplete ? (
                  <CheckCircle2 className="h-5 w-5 animate-scale-in" aria-hidden="true" />
                ) : (
                  <Circle className="h-5 w-5" aria-hidden="true" />
                )}
                <span className="text-sm font-medium">1. Check-Out</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" aria-hidden="true" />
              <div className={`flex items-center gap-2 transition-colors duration-300 ${checkinComplete ? 'text-success' : 'text-muted-foreground'}`}>
                {checkinComplete ? (
                  <CheckCircle2 className="h-5 w-5 animate-scale-in" aria-hidden="true" />
                ) : (
                  <Circle className="h-5 w-5" aria-hidden="true" />
                )}
                <span className="text-sm font-medium">2. Check-In</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" aria-hidden="true" />
              <div className={`flex items-center gap-2 transition-colors duration-300 ${comparisonComplete ? 'text-success' : 'text-muted-foreground'}`}>
                {comparisonComplete ? (
                  <CheckCircle2 className="h-5 w-5 animate-scale-in" aria-hidden="true" />
                ) : (
                  <Circle className="h-5 w-5" aria-hidden="true" />
                )}
                <span className="text-sm font-medium">3. Comparison</span>
              </div>
            </nav>
            
            {/* Quick Actions */}
            <div className="flex gap-2 flex-wrap">
              {checkoutComplete && !checkinComplete && (
                <Button 
                  onClick={handleStartCheckIn} 
                  size="sm"
                  className="animate-scale-in"
                  aria-label="Start check-in inspection"
                >
                  Start Check-In
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              )}
              {checkoutComplete && checkinComplete && !comparisonComplete && (
                <Button 
                  onClick={handleGenerateComparison} 
                  size="sm"
                  className="animate-scale-in"
                  aria-label="Generate comparison report"
                >
                  Generate Report
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full animate-fade-in">
        <TabsList 
          className="grid w-full grid-cols-1 md:grid-cols-3 h-auto p-1 gap-1"
          role="tablist"
          aria-label="Inspection stages"
        >
          <TabsTrigger 
            value="checkout" 
            className="flex items-center justify-center py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
            role="tab"
            aria-selected={activeTab === 'checkout'}
            aria-controls="checkout-panel"
          >
            <div className="flex flex-col items-center gap-1 w-full">
              <span className="font-semibold text-sm md:text-base">Check-Out Inspection</span>
              <span className="text-xs opacity-80 hidden sm:inline">When vehicle leaves</span>
            </div>
            {getTabBadge(checkoutComplete, activeTab === 'checkout')}
          </TabsTrigger>
          
          <TabsTrigger 
            value="checkin" 
            className="flex items-center justify-center py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
            disabled={!checkoutComplete}
            role="tab"
            aria-selected={activeTab === 'checkin'}
            aria-controls="checkin-panel"
            aria-disabled={!checkoutComplete}
          >
            <div className="flex flex-col items-center gap-1 w-full">
              <span className="font-semibold text-sm md:text-base">Check-In Inspection</span>
              <span className="text-xs opacity-80 hidden sm:inline">When vehicle returns</span>
            </div>
            {getTabBadge(checkinComplete, activeTab === 'checkin')}
          </TabsTrigger>
          
          <TabsTrigger 
            value="comparison" 
            className="flex items-center justify-center py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
            disabled={!checkoutComplete || !checkinComplete}
            role="tab"
            aria-selected={activeTab === 'comparison'}
            aria-controls="comparison-panel"
            aria-disabled={!checkoutComplete || !checkinComplete}
          >
            <div className="flex flex-col items-center gap-1 w-full">
              <span className="font-semibold text-sm md:text-base">Comparison & Report</span>
              <span className="text-xs opacity-80 hidden sm:inline">Damage & cost analysis</span>
            </div>
            {getTabBadge(comparisonComplete, activeTab === 'comparison')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checkout" className="mt-6 animate-fade-in transition-opacity duration-300" id="checkout-panel" role="tabpanel">
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle className="text-lg">Check-Out Inspection</CardTitle>
              <CardDescription>
                Document vehicle condition when customer takes possession
              </CardDescription>
            </CardHeader>
            <CardContent>
              {checkoutComplete ? (
                <div className="text-center py-12 animate-fade-in">
                  <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" aria-hidden="true" />
                  <p className="text-lg font-medium">Check-Out Inspection Complete</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Vehicle handed over to customer
                  </p>
                </div>
              ) : (
                <CheckOutInspectionTab
                  data={data.checkOutInspection}
                  lineId={`temp-line-${Date.now()}`}
                  onUpdate={(inspectionData: InspectionData) => {
                    onChange('checkOutInspection', inspectionData);
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checkin" className="mt-6 animate-fade-in transition-opacity duration-300" id="checkin-panel" role="tabpanel">
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle className="text-lg">Check-In Inspection</CardTitle>
              <CardDescription>
                Document vehicle condition upon return from customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!checkoutComplete ? (
                <div className="text-center py-12 text-muted-foreground animate-fade-in">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
                  <p className="text-lg font-medium mb-2">Complete Check-Out First</p>
                  <p className="text-sm">You must complete the check-out inspection before starting check-in</p>
                </div>
              ) : checkinComplete ? (
                <div className="text-center py-12 animate-fade-in">
                  <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" aria-hidden="true" />
                  <p className="text-lg font-medium">Check-In Inspection Complete</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Vehicle returned by customer
                  </p>
                </div>
              ) : (
                <CheckInInspectionTab
                  checkOutData={data.checkOutInspection}
                  checkInData={data.checkInInspection}
                  lineId={`temp-line-${Date.now()}`}
                  onUpdate={(inspectionData: InspectionData) => {
                    onChange('checkInInspection', inspectionData);
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="mt-6 animate-fade-in transition-opacity duration-300" id="comparison-panel" role="tabpanel">
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle className="text-lg">Comparison & Damage Report</CardTitle>
              <CardDescription>
                Side-by-side analysis with full cost breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!checkoutComplete || !checkinComplete ? (
                <div className="text-center py-12 text-muted-foreground animate-fade-in">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
                  <p className="text-lg font-medium mb-2">Complete Both Inspections First</p>
                  <p className="text-sm">
                    {!checkoutComplete && !checkinComplete 
                      ? 'Complete check-out and check-in inspections to generate comparison report'
                      : !checkoutComplete 
                        ? 'Complete check-out inspection first'
                        : 'Complete check-in inspection to generate report'
                    }
                  </p>
                </div>
              ) : comparisonComplete ? (
                <InspectionComparisonTab
                  checkOutData={data.checkOutInspection}
                  checkInData={data.checkInInspection}
                  comparisonReport={data.comparisonReport}
                  onUpdate={(report: ComparisonReport) => {
                    onChange('comparisonReport', report);
                  }}
                />
              ) : (
                <div className="text-center py-12 animate-fade-in">
                  <Button
                    size="lg"
                    className="hover-scale"
                    onClick={() => {
                      // Auto-generate comparison report
                      onChange('comparisonReport', {
                        newDamages: [],
                        totalNewDamages: 0,
                        totalEstimatedCost: 0,
                        totalChargeableAmount: 0,
                        fuelDifference: 0,
                        fuelCharge: 0,
                        odometerDifference: 0,
                        excessKmCharge: 0,
                        cleaningRequired: false,
                        cleaningCharge: 0,
                        additionalCharges: [],
                        subtotal: 0,
                        vatRate: 0.05,
                        vatAmount: 0,
                        grandTotal: 0,
                        securityDepositHeld: 1500,
                        additionalPaymentRequired: 0,
                        reportGeneratedAt: new Date().toISOString(),
                        reportGeneratedBy: 'System',
                        managerApprovalRequired: false,
                        customerAcknowledged: false
                      });
                    }}
                    aria-label="Generate damage comparison report"
                  >
                    <FileText className="w-4 h-4 mr-2" aria-hidden="true" />
                    Generate Comparison Report
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Error Display */}
      {errors.length > 0 && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-destructive mb-2">Validation Errors</p>
                <ul className="text-sm text-destructive space-y-1">
                  {errors.map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
