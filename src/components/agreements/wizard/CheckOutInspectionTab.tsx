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
import { Vehicle3DDamageInspection } from '@/components/agreements/shared/Vehicle3DDamageInspection';
import { Camera, Upload, CheckCircle2 } from 'lucide-react';
import type { InspectionData, DamageMarker, InspectionPhotos } from '@/types/agreement-wizard';

const FUEL_LEVELS = [
  { value: 'E', label: 'Empty', percentage: 0 },
  { value: 'Q1', label: '1/4', percentage: 25 },
  { value: 'H', label: '1/2', percentage: 50 },
  { value: 'Q3', label: '3/4', percentage: 75 },
  { value: 'F', label: 'Full', percentage: 100 }
] as const;

const PRE_HANDOVER_ITEMS = [
  { id: 'cleaned', label: 'Vehicle cleaned (interior & exterior)' },
  { id: 'fuel', label: 'Fuel level at full or specified level' },
  { id: 'documents', label: 'All documents ready (registration, insurance, Mulkiya)' },
  { id: 'keys', label: 'Keys available (main key + spare key)' },
  { id: 'warnings', label: 'No warning lights on dashboard' },
  { id: 'tire_pressure', label: 'Tire pressure checked' },
  { id: 'lights', label: 'All lights functioning (headlights, tail lights, indicators)' },
  { id: 'ac', label: 'Air conditioning operational' },
  { id: 'salik', label: 'Salik tag installed and active' },
  { id: 'first_aid', label: 'First aid kit present' },
  { id: 'extinguisher', label: 'Fire extinguisher present' },
  { id: 'triangle', label: 'Warning triangle available' }
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
  { id: 'documents', label: 'Document Photos', required: 4, items: [
    'Mulkiya', 'Insurance card', 'Registration', 'Salik tag'
  ]}
];

interface CheckOutInspectionTabProps {
  data: InspectionData;
  lineId: string;
  onUpdate: (data: InspectionData) => void;
}

export function CheckOutInspectionTab({ data, lineId, onUpdate }: CheckOutInspectionTabProps) {
  const [fuelIndex, setFuelIndex] = useState(() => {
    if (!data || data.fuelLevel === undefined) return 4;
    return FUEL_LEVELS.findIndex(f => f.percentage === data.fuelLevel) || 4;
  });

  // Return loading state if data is not yet initialized
  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-muted-foreground">
          <p>Initializing inspection form...</p>
        </div>
      </div>
    );
  }

  const updateData = (updates: Partial<InspectionData>) => {
    onUpdate({ ...data, ...updates });
  };

  const handleChecklistChange = (itemId: string, checked: boolean) => {
    updateData({
      preHandoverChecklist: {
        ...data.preHandoverChecklist,
        [itemId]: checked
      }
    });
  };

  const handleConditionChange = (item: string, checked: boolean) => {
    updateData({
      inspectionChecklist: {
        ...data.inspectionChecklist,
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
      event: 'checkout'
    };

    updateData({
      damageMarkers: [...data.damageMarkers, newMarker]
    });
  };

  const handleRemoveMarker = (markerId: string) => {
    updateData({
      damageMarkers: data.damageMarkers.filter(m => m.id !== markerId)
    });
  };

  const handlePhotoUpload = (category: keyof InspectionPhotos, file: File) => {
    // In production, upload to storage
    const photoUrl = URL.createObjectURL(file);
    updateData({
      photos: {
        ...data.photos,
        [category]: [...(data.photos[category] || []), photoUrl]
      }
    });
  };

  const preHandoverProgress = PRE_HANDOVER_ITEMS.filter(
    item => (data.preHandoverChecklist as any)?.[item.id]
  ).length;

  return (
    <div className="space-y-6 animate-fade-in" role="region" aria-label="Check-out inspection form">
      <Accordion type="multiple" defaultValue={['checklist', 'metrics', 'damage']} className="w-full">
        {/* Pre-Handover Checklist */}
        <AccordionItem value="checklist">
          <AccordionTrigger className="hover:no-underline transition-all">
            <div className="flex items-center gap-3">
              <span className="font-semibold">Pre-Handover Checklist</span>
              <Badge variant="outline" className="transition-colors">
                {preHandoverProgress}/{PRE_HANDOVER_ITEMS.length} Complete
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="animate-fade-in">
            <Card>
              <CardContent className="pt-6 space-y-4">
                {PRE_HANDOVER_ITEMS.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={(data.preHandoverChecklist as any)?.[item.id] || false}
                      onCheckedChange={(checked) => 
                        handleChecklistChange(item.id, checked as boolean)
                      }
                      aria-label={item.label}
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

        {/* Vehicle Metrics */}
        <AccordionItem value="metrics">
          <AccordionTrigger>
            <span className="font-semibold">Vehicle Metrics</span>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <Label>Fuel Level</Label>
                  <Slider 
                    value={[fuelIndex]} 
                    onValueChange={handleFuelChange} 
                    max={FUEL_LEVELS.length - 1} 
                    step={1} 
                  />
                  <Badge variant="outline">{FUEL_LEVELS[fuelIndex].label}</Badge>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="odometer">Odometer Reading (km)</Label>
                  <Input
                    id="odometer"
                    type="number"
                    value={data.odometerReading || ''}
                    onChange={(e) => updateData({
                      odometerReading: parseInt(e.target.value) || 0
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inspector">Inspector Name</Label>
                  <Input
                    id="inspector"
                    value={data.inspectorName || ''}
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
                        checked={data.inspectionChecklist?.[`exterior-${item}`] || false}
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
                        checked={data.inspectionChecklist?.[`interior-${item}`] || false}
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

        {/* 3D Damage Inspection */}
        <AccordionItem value="damage">
          <AccordionTrigger>
            <div className="flex items-center gap-3">
              <span className="font-semibold">3D Damage Inspection</span>
              <Badge variant="outline">
                {data.damageMarkers?.length || 0} Markers
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="h-[600px]">
              <Vehicle3DDamageInspection
                markers={data.damageMarkers}
                onAddMarker={handleAddMarker}
                onRemoveMarker={handleRemoveMarker}
                agreementId="temp-checkout"
                lineId={lineId}
              />
            </div>
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
                        {data.photos?.[category.id as keyof InspectionPhotos]?.length || 0}/{category.required}
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

        {/* Notes & Special Instructions */}
        <AccordionItem value="notes">
          <AccordionTrigger>
            <span className="font-semibold">Notes & Special Instructions</span>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
                <Textarea
                  placeholder="Add any observations or special instructions..."
                  value={data.notes || ''}
                  onChange={(e) => updateData({ notes: e.target.value })}
                  rows={6}
                />
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

    </div>
  );
}
