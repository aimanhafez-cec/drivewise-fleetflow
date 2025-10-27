import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { VehicleDiagramInteractive } from '@/components/agreements/shared/VehicleDiagramInteractive';
import { Camera, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { InspectionData, DamageMarker, VehicleView, InspectionPhotos } from '@/types/agreement-wizard';

const FUEL_LEVELS = [
  { value: 'E', label: 'Empty', percentage: 0 },
  { value: 'Q1', label: '1/4', percentage: 25 },
  { value: 'H', label: '1/2', percentage: 50 },
  { value: 'Q3', label: '3/4', percentage: 75 },
  { value: 'F', label: 'Full', percentage: 100 }
] as const;

const RETURN_CHECKLIST_ITEMS = [
  { id: 'on_time', label: 'Vehicle returned on time' },
  { id: 'keys_returned', label: 'Keys returned (main + spare)' },
  { id: 'documents_returned', label: 'Documents returned' },
  { id: 'salik_installed', label: 'Salik tag still installed' },
  { id: 'interior_clean', label: 'Interior cleanliness acceptable' },
  { id: 'fuel_matches', label: 'Fuel level matches agreement' },
  { id: 'no_visible_damage', label: 'No obvious new damages visible' }
];

const EXTERIOR_CHECKLIST = [
  'Front bumper', 'Rear bumper', 'Hood', 'Trunk/Boot',
  'Roof', 'Front left door', 'Front right door',
  'Rear left door', 'Rear right door', 'Front left fender',
  'Front right fender', 'Rear left fender', 'Rear right fender',
  'Left side mirror', 'Right side mirror', 'Front windshield',
  'Rear windshield', 'Front left window', 'Front right window',
  'Rear left window', 'Rear right window', 'Left headlight', 'Right headlight'
];

const INTERIOR_CHECKLIST = [
  'Dashboard', 'Steering wheel', 'Front seats', 'Rear seats',
  'Floor mats', 'Trunk interior', 'Door panels', 'Center console',
  'Roof liner', 'Seat belts'
];

const PHOTO_CATEGORIES = [
  { id: 'exterior', label: 'Exterior Photos', required: 8, items: [
    'Front view', 'Rear view', 'Left side', 'Right side',
    'Front-left corner', 'Front-right corner', 'Rear-left corner', 'Rear-right corner'
  ]},
  { id: 'interior', label: 'Interior Photos', required: 6, items: [
    'Dashboard', 'Front seats', 'Rear seats', 'Trunk', 'Roof liner', 'Floor mats'
  ]},
  { id: 'damages', label: 'New Damage Photos', required: 0, items: [
    'Any new damages found'
  ]}
];

interface CheckInInspectionTabProps {
  checkOutData: InspectionData;
  checkInData: InspectionData;
  lineId: string;
  onUpdate: (data: InspectionData) => void;
}

export function CheckInInspectionTab({ 
  checkOutData, 
  checkInData, 
  lineId, 
  onUpdate 
}: CheckInInspectionTabProps) {
  const [fuelIndex, setFuelIndex] = useState(() => {
    if (!checkInData || checkInData.fuelLevel === undefined) return 4;
    return FUEL_LEVELS.findIndex(f => f.percentage === checkInData.fuelLevel) || 4;
  });
  const [currentView, setCurrentView] = useState<VehicleView>('top');

  // Return loading state if data is not yet initialized
  if (!checkInData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-muted-foreground">
          <p>Initializing check-in form...</p>
        </div>
      </div>
    );
  }

  const updateData = (updates: Partial<InspectionData>) => {
    onUpdate({ ...checkInData, ...updates });
  };

  const handleChecklistChange = (itemId: string, checked: boolean) => {
    updateData({
      preHandoverChecklist: {
        ...checkInData.preHandoverChecklist,
        [itemId]: checked
      }
    });
  };

  const handleConditionChange = (item: string, checked: boolean) => {
    updateData({
      inspectionChecklist: {
        ...checkInData.inspectionChecklist,
        [item]: checked
      }
    });
  };

  const handleFuelChange = (value: number[]) => {
    setFuelIndex(value[0]);
    updateData({
      fuelLevel: FUEL_LEVELS[value[0]].percentage
    });
  };

  const handleAddMarker = (marker: Omit<DamageMarker, 'id'>) => {
    const newMarker: DamageMarker = {
      ...marker,
      id: `temp-${Date.now()}`,
      event: 'checkin'
    };

    updateData({
      damageMarkers: [...checkInData.damageMarkers, newMarker]
    });
  };

  const handleRemoveMarker = (markerId: string) => {
    updateData({
      damageMarkers: checkInData.damageMarkers.filter(m => m.id !== markerId)
    });
  };

  const handlePhotoUpload = (category: keyof InspectionPhotos, file: File) => {
    // In production, upload to storage
    const photoUrl = URL.createObjectURL(file);
    updateData({
      photos: {
        ...checkInData.photos,
        [category]: [...(checkInData.photos[category] || []), photoUrl]
      }
    });
  };

  const returnChecklistProgress = RETURN_CHECKLIST_ITEMS.filter(
    item => (checkInData.preHandoverChecklist as any)?.[item.id]
  ).length;

  // Calculate fuel difference
  const fuelDifference = checkOutData.fuelLevel - checkInData.fuelLevel;
  const fuelWarning = fuelDifference > 10; // Warning if fuel is 10% or more below check-out

  // Calculate odometer difference
  const kmDriven = checkInData.odometerReading - checkOutData.odometerReading;

  // Count new damages
  const newDamagesCount = checkInData.damageMarkers.filter(m => m.event === 'checkin').length;
  const existingDamagesCount = checkOutData.damageMarkers.length;

  // Combine markers for display (checkout markers + new checkin markers)
  const allMarkers = [
    ...checkOutData.damageMarkers.map(m => ({ ...m, isFromCheckout: true })),
    ...checkInData.damageMarkers
  ];

  return (
    <div className="space-y-6">
      {/* Comparison Alert */}
      <Alert className="border-primary bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="flex flex-col gap-2">
            <p className="font-semibold">Comparing against Check-Out inspection</p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Check-Out Fuel:</span>
                <Badge variant="outline" className="ml-2">{checkOutData.fuelLevel}%</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Check-Out Odometer:</span>
                <Badge variant="outline" className="ml-2">{checkOutData.odometerReading} km</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Existing Damages:</span>
                <Badge variant="outline" className="ml-2">{existingDamagesCount}</Badge>
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Metrics Comparison Alert */}
      {(fuelWarning || kmDriven > 0) && (
        <Alert className={fuelWarning ? "border-destructive bg-destructive/5" : "border-primary bg-primary/5"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {kmDriven > 0 && (
                <p><strong>Distance driven:</strong> {kmDriven} km</p>
              )}
              {fuelWarning && (
                <p className="text-destructive">
                  <strong>Fuel shortage:</strong> Vehicle returned with {fuelDifference}% less fuel than check-out
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Accordion type="multiple" defaultValue={['checklist', 'metrics', 'damage']} className="w-full">
        {/* Return Checklist */}
        <AccordionItem value="checklist">
          <AccordionTrigger>
            <div className="flex items-center gap-3">
              <span className="font-semibold">Return Checklist</span>
              <Badge variant="outline">
                {returnChecklistProgress}/{RETURN_CHECKLIST_ITEMS.length} Complete
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6 space-y-4">
                {RETURN_CHECKLIST_ITEMS.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={(checkInData.preHandoverChecklist as any)?.[item.id] || false}
                      onCheckedChange={(checked) => 
                        handleChecklistChange(item.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={item.id} className="cursor-pointer">
                      {item.label}
                    </Label>
                  </div>
                ))}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Vehicle Metrics at Return */}
        <AccordionItem value="metrics">
          <AccordionTrigger>
            <span className="font-semibold">Vehicle Metrics at Return</span>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Fuel Level at Return</Label>
                    {fuelWarning && (
                      <Badge variant="destructive" className="text-xs">
                        Below Check-Out Level
                      </Badge>
                    )}
                  </div>
                  <Slider 
                    value={[fuelIndex]} 
                    onValueChange={handleFuelChange} 
                    max={FUEL_LEVELS.length - 1} 
                    step={1} 
                  />
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{FUEL_LEVELS[fuelIndex].label}</Badge>
                    {fuelDifference !== 0 && (
                      <span className={`text-sm ${fuelDifference > 0 ? 'text-destructive' : 'text-success'}`}>
                        {fuelDifference > 0 ? '-' : '+'}{Math.abs(fuelDifference)}% from check-out
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="odometer">Odometer Reading at Return (km)</Label>
                  <Input
                    id="odometer"
                    type="number"
                    value={checkInData.odometerReading || ''}
                    onChange={(e) => updateData({
                      odometerReading: parseInt(e.target.value) || 0
                    })}
                  />
                  {kmDriven > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Distance driven: <strong>{kmDriven} km</strong>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inspector">Inspector Name</Label>
                  <Input
                    id="inspector"
                    value={checkInData.inspectorName || ''}
                    onChange={(e) => updateData({ inspectorName: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Condition Assessment */}
        <AccordionItem value="condition">
          <AccordionTrigger>
            <span className="font-semibold">Condition Assessment</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Exterior Condition</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {EXTERIOR_CHECKLIST.map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox
                        id={`ext-${item}`}
                        checked={checkInData.inspectionChecklist?.[`exterior-${item}`] || false}
                        onCheckedChange={(checked) => 
                          handleConditionChange(`exterior-${item}`, checked as boolean)
                        }
                      />
                      <Label htmlFor={`ext-${item}`} className="cursor-pointer text-sm">
                        {item}
                      </Label>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Interior Condition</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {INTERIOR_CHECKLIST.map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox
                        id={`int-${item}`}
                        checked={checkInData.inspectionChecklist?.[`interior-${item}`] || false}
                        onCheckedChange={(checked) => 
                          handleConditionChange(`interior-${item}`, checked as boolean)
                        }
                      />
                      <Label htmlFor={`int-${item}`} className="cursor-pointer text-sm">
                        {item}
                      </Label>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Damage Inspection (Comparison Mode) */}
        <AccordionItem value="damage">
          <AccordionTrigger>
            <div className="flex items-center gap-3">
              <span className="font-semibold">Damage Inspection (Comparison)</span>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-muted">
                  {existingDamagesCount} From Check-Out
                </Badge>
                {newDamagesCount > 0 && (
                  <Badge variant="destructive">
                    {newDamagesCount} New Damage{newDamagesCount > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold mb-2">Comparison Mode Active</p>
                    <ul className="text-sm space-y-1">
                      <li>• <span className="text-muted-foreground">Gray markers</span> = Existing damages from check-out (read-only)</li>
                      <li>• <span className="text-destructive">Red markers</span> = New damages found during check-in</li>
                      <li>• Click on the diagram to mark new damages</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <VehicleDiagramInteractive
                  markers={allMarkers}
                  currentView={currentView}
                  onAddMarker={handleAddMarker}
                  onRemoveMarker={(id) => {
                    // Only allow removing new check-in markers
                    const marker = checkInData.damageMarkers.find(m => m.id === id);
                    if (marker) {
                      handleRemoveMarker(id);
                    }
                  }}
                  onViewChange={setCurrentView}
                />
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Photo Documentation */}
        <AccordionItem value="photos">
          <AccordionTrigger>
            <span className="font-semibold">Photo Documentation</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {PHOTO_CATEGORIES.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{category.label}</span>
                      <Badge variant="outline">
                        {checkInData.photos?.[category.id as keyof InspectionPhotos]?.length || 0}
                        {category.required > 0 && `/${category.required}`}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {category.items.map((item) => (
                        <div key={item} className="space-y-2">
                          <Label className="text-sm">{item}</Label>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) handlePhotoUpload(category.id as keyof InspectionPhotos, file);
                              };
                              input.click();
                            }}
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Capture
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Return Notes */}
        <AccordionItem value="notes">
          <AccordionTrigger>
            <span className="font-semibold">Return Notes & Customer Comments</span>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="issues">Issues Observed During Return</Label>
                  <Textarea
                    id="issues"
                    placeholder="Describe any issues found during the return inspection..."
                    value={checkInData.notes || ''}
                    onChange={(e) => updateData({ notes: e.target.value })}
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customer-comments">Customer Complaints or Comments</Label>
                  <Textarea
                    id="customer-comments"
                    placeholder="Record any customer feedback or complaints..."
                    value={(checkInData as any).customerComments || ''}
                    onChange={(e) => updateData({ 
                      ...(checkInData as any),
                      customerComments: e.target.value 
                    })}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Summary Card */}
      {(newDamagesCount > 0 || fuelWarning || kmDriven > 0) && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Issues Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {newDamagesCount > 0 && (
              <div className="flex items-center justify-between">
                <span>New damages found:</span>
                <Badge variant="destructive">{newDamagesCount}</Badge>
              </div>
            )}
            {fuelWarning && (
              <div className="flex items-center justify-between">
                <span>Fuel shortage:</span>
                <Badge variant="destructive">{fuelDifference}%</Badge>
              </div>
            )}
            {kmDriven > 0 && (
              <div className="flex items-center justify-between">
                <span>Distance driven:</span>
                <Badge variant="outline">{kmDriven} km</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
