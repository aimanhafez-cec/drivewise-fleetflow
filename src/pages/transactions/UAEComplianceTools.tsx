import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import {
  UAEViolationLookup,
  UAETollGateSelector,
  BlackPointsTracker,
} from '@/components/cost-compliance';

const UAEComplianceTools: React.FC = () => {
  const [selectedTollSystem, setSelectedTollSystem] = useState<'salik' | 'darb'>(
    'salik'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">UAE Compliance Tools</h1>
        <p className="text-muted-foreground mt-2">
          RTA violation codes, toll gates, and black points tracking for UAE operations
        </p>
      </div>

      <Tabs defaultValue="violations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="violations">Violation Lookup</TabsTrigger>
          <TabsTrigger value="tolls">Toll Gates</TabsTrigger>
          <TabsTrigger value="blackpoints">Black Points Tracker</TabsTrigger>
        </TabsList>

        <TabsContent value="violations" className="space-y-4">
          <UAEViolationLookup
            onSelectViolation={(violation) => {
              console.log('Selected violation:', violation);
            }}
          />
        </TabsContent>

        <TabsContent value="tolls" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Salik (Dubai)</h3>
                  <p className="text-sm text-muted-foreground">
                    Dubai toll gate system - 8 gates
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTollSystem('salik')}
                  className={`w-full rounded-md border px-4 py-2 text-sm transition-colors ${
                    selectedTollSystem === 'salik'
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  View Salik Gates
                </button>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Darb (Abu Dhabi)</h3>
                  <p className="text-sm text-muted-foreground">
                    Abu Dhabi toll gate system - 4 gates
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTollSystem('darb')}
                  className={`w-full rounded-md border px-4 py-2 text-sm transition-colors ${
                    selectedTollSystem === 'darb'
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  View Darb Gates
                </button>
              </div>
            </Card>
          </div>

          <UAETollGateSelector
            system={selectedTollSystem}
            onSelectGate={(gate) => {
              console.log('Selected gate:', gate);
            }}
          />
        </TabsContent>

        <TabsContent value="blackpoints" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Example trackers */}
            <BlackPointsTracker
              blackPoints={8}
              driverName="Ahmed Ali"
              licenseNumber="123456789"
            />
            <BlackPointsTracker
              blackPoints={18}
              driverName="Mohammed Hassan"
              licenseNumber="987654321"
              showArabic
            />
            <BlackPointsTracker
              blackPoints={26}
              driverName="Fatima Salem"
              licenseNumber="456789123"
            />
            <BlackPointsTracker
              blackPoints={50}
              driverName="Omar Abdullah"
              licenseNumber="789123456"
              showArabic
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UAEComplianceTools;
