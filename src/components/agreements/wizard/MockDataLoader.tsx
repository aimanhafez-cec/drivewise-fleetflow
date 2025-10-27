import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  mockCheckOutInspection, 
  mockCheckInInspection,
  mockScenarioCleanReturn,
  mockScenarioHeavyDamage
} from '@/lib/mock/inspectionMockData';
import type { EnhancedWizardData } from '@/types/agreement-wizard';

interface MockDataLoaderProps {
  onLoadData: (data: Partial<EnhancedWizardData>) => void;
}

export function MockDataLoader({ onLoadData }: MockDataLoaderProps) {
  const handleLoadStandardScenario = () => {
    onLoadData({
      step2: {
        inspectionMode: 'checkout_checkin',
        activeTab: 'checkout', // Start at checkout to allow review
        preHandoverChecklist: mockCheckOutInspection.preHandoverChecklist,
        inspectionChecklist: mockCheckOutInspection.inspectionChecklist,
        fuelLevel: mockCheckOutInspection.fuelLevel,
        odometerReading: mockCheckOutInspection.odometerReading,
        damageMarkers: mockCheckOutInspection.damageMarkers,
        photos: mockCheckOutInspection.photos,
        checkOutInspection: mockCheckOutInspection,
        checkInInspection: mockCheckInInspection,
      }
    });
  };

  const handleLoadCleanReturn = () => {
    onLoadData({
      step2: {
        inspectionMode: 'checkout_checkin',
        activeTab: 'checkout', // Start at checkout to allow review
        preHandoverChecklist: mockCheckOutInspection.preHandoverChecklist,
        inspectionChecklist: mockCheckOutInspection.inspectionChecklist,
        fuelLevel: mockCheckOutInspection.fuelLevel,
        odometerReading: mockCheckOutInspection.odometerReading,
        damageMarkers: mockCheckOutInspection.damageMarkers,
        photos: mockCheckOutInspection.photos,
        checkOutInspection: mockCheckOutInspection,
        checkInInspection: mockScenarioCleanReturn,
      }
    });
  };

  const handleLoadHeavyDamage = () => {
    onLoadData({
      step2: {
        inspectionMode: 'checkout_checkin',
        activeTab: 'checkout', // Start at checkout to allow review
        preHandoverChecklist: mockCheckOutInspection.preHandoverChecklist,
        inspectionChecklist: mockCheckOutInspection.inspectionChecklist,
        fuelLevel: mockCheckOutInspection.fuelLevel,
        odometerReading: mockCheckOutInspection.odometerReading,
        damageMarkers: mockCheckOutInspection.damageMarkers,
        photos: mockCheckOutInspection.photos,
        checkOutInspection: mockCheckOutInspection,
        checkInInspection: mockScenarioHeavyDamage,
      }
    });
  };

  return (
    <Card className="border-dashed border-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          <CardTitle>Mock Data Loader</CardTitle>
        </div>
        <CardDescription>
          Load realistic inspection scenarios for testing and demonstration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            These scenarios use realistic UAE rental car inspection data with actual damage types, pricing, and additional charges.
          </AlertDescription>
        </Alert>

        <div className="grid gap-3">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-semibold mb-1">Standard Scenario</h4>
              <p className="text-sm text-muted-foreground mb-2">
                5 new damages, fuel shortage, excess km, late return, Salik charges
              </p>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="destructive">5 New Damages</Badge>
                <Badge variant="outline">AED 2,905 Total</Badge>
                <Badge variant="outline">660 km Driven</Badge>
              </div>
            </div>
            <Button onClick={handleLoadStandardScenario}>
              Load Data
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-semibold mb-1">Clean Return</h4>
              <p className="text-sm text-muted-foreground mb-2">
                No new damages, full tank, within km limit, on time
              </p>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="default">0 New Damages</Badge>
                <Badge variant="outline">200 km Driven</Badge>
                <Badge variant="outline">Perfect Return</Badge>
              </div>
            </div>
            <Button onClick={handleLoadCleanReturn} variant="outline">
              Load Data
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-semibold mb-1">Heavy Damage</h4>
              <p className="text-sm text-muted-foreground mb-2">
                7 damages including broken lights and rim damage
              </p>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="destructive">7 Damages</Badge>
                <Badge variant="destructive">Major Issues</Badge>
                <Badge variant="outline">Manager Approval Required</Badge>
              </div>
            </div>
            <Button onClick={handleLoadHeavyDamage} variant="destructive">
              Load Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
