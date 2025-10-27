import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CheckOutInspectionTab } from './CheckOutInspectionTab';
import type { EnhancedWizardData, InspectionData } from '@/types/agreement-wizard';

interface EnhancedInspectionStepProps {
  data: EnhancedWizardData['step2'];
  fullData: EnhancedWizardData;
  onChange: (field: keyof EnhancedWizardData['step2'], value: any) => void;
  errors?: string[];
}

export const EnhancedInspectionStep: React.FC<EnhancedInspectionStepProps> = ({
  data,
  fullData,
  onChange,
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
  }, []);

  const activeTab = data.activeTab || 'checkout';
  
  // Determine completion status for each tab
  const checkoutComplete = !!data.checkOutInspection && 
    data.checkOutInspection.odometerReading > 0 &&
    data.checkOutInspection.fuelLevel >= 0;
    
  const checkinComplete = !!data.checkInInspection && 
    data.checkInInspection.odometerReading > 0 &&
    data.checkInInspection.fuelLevel >= 0;
    
  const comparisonComplete = !!data.comparisonReport && 
    data.comparisonReport.reportGeneratedAt !== '';

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
      return <Badge variant="default" className="ml-2 bg-success text-success-foreground">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Complete
      </Badge>;
    }
    if (isActive) {
      return <Badge variant="default" className="ml-2 bg-primary text-primary-foreground">
        In Progress
      </Badge>;
    }
    return <Badge variant="outline" className="ml-2">
      <Circle className="h-3 w-3 mr-1" />
      Pending
    </Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Vehicle Inspection (Enhanced)</span>
            <div className="flex gap-2 text-sm font-normal">
              {checkoutComplete && (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Check-Out Done
                </Badge>
              )}
              {checkinComplete && (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Check-In Done
                </Badge>
              )}
              {comparisonComplete && (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Report Generated
                </Badge>
              )}
            </div>
          </CardTitle>
          <CardDescription>
            Complete check-out inspection when vehicle leaves, check-in when it returns, and review the comparison report
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Progress Tracker */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 ${checkoutComplete ? 'text-success' : 'text-muted-foreground'}`}>
                {checkoutComplete ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
                <span className="text-sm font-medium">1. Check-Out</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className={`flex items-center gap-2 ${checkinComplete ? 'text-success' : 'text-muted-foreground'}`}>
                {checkinComplete ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
                <span className="text-sm font-medium">2. Check-In</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className={`flex items-center gap-2 ${comparisonComplete ? 'text-success' : 'text-muted-foreground'}`}>
                {comparisonComplete ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
                <span className="text-sm font-medium">3. Comparison</span>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2">
              {checkoutComplete && !checkinComplete && (
                <Button 
                  onClick={handleStartCheckIn} 
                  size="sm"
                  className="animate-scale-in"
                >
                  Start Check-In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {checkoutComplete && checkinComplete && !comparisonComplete && (
                <Button 
                  onClick={handleGenerateComparison} 
                  size="sm"
                  className="animate-scale-in"
                >
                  Generate Report
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger 
            value="checkout" 
            className="flex items-center justify-center py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <div className="flex flex-col items-center gap-1">
              <span className="font-semibold">Check-Out Inspection</span>
              <span className="text-xs opacity-80">When vehicle leaves</span>
            </div>
            {getTabBadge(checkoutComplete, activeTab === 'checkout')}
          </TabsTrigger>
          
          <TabsTrigger 
            value="checkin" 
            className="flex items-center justify-center py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            disabled={!checkoutComplete}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="font-semibold">Check-In Inspection</span>
              <span className="text-xs opacity-80">When vehicle returns</span>
            </div>
            {getTabBadge(checkinComplete, activeTab === 'checkin')}
          </TabsTrigger>
          
          <TabsTrigger 
            value="comparison" 
            className="flex items-center justify-center py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            disabled={!checkoutComplete || !checkinComplete}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="font-semibold">Comparison & Report</span>
              <span className="text-xs opacity-80">Damage & cost analysis</span>
            </div>
            {getTabBadge(comparisonComplete, activeTab === 'comparison')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checkout" className="mt-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Check-Out Inspection</CardTitle>
              <CardDescription>
                Document vehicle condition when customer takes possession
              </CardDescription>
            </CardHeader>
            <CardContent>
              {checkoutComplete ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
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

        <TabsContent value="checkin" className="mt-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Check-In Inspection</CardTitle>
              <CardDescription>
                Document vehicle condition upon return from customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!checkoutComplete ? (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Complete Check-Out First</p>
                  <p className="text-sm">You must complete the check-out inspection before starting check-in</p>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Check-In Inspection Form</p>
                  <p className="text-sm">This will be implemented in Phase 4</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="mt-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comparison & Damage Report</CardTitle>
              <CardDescription>
                Side-by-side analysis with full cost breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!checkoutComplete || !checkinComplete ? (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
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
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Comparison Report</p>
                  <p className="text-sm">This will be implemented in Phase 5</p>
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
