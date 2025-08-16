import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Camera } from 'lucide-react';

interface ChecklistItem {
  id: string;
  name: string;
  description: string;
  testId: string;
}

const CHECKLIST_SECTIONS: { name: string; items: ChecklistItem[] }[] = [
  {
    name: 'Exterior',
    items: [
      { id: 'exterior', name: 'Exterior Panels', description: 'Check for dents, scratches, paint damage', testId: 'chk-exterior' }
    ]
  },
  {
    name: 'Glass',
    items: [
      { id: 'glass', name: 'Windshield & Windows', description: 'Check for cracks, chips, or damage', testId: 'chk-glass' }
    ]
  },
  {
    name: 'Tires & Rims',
    items: [
      { id: 'tires', name: 'Tires & Rims', description: 'Check tread, sidewalls, rim condition', testId: 'chk-tires' }
    ]
  },
  {
    name: 'Interior',
    items: [
      { id: 'interior', name: 'Dashboard & Seats', description: 'Check seats, dashboard, controls', testId: 'chk-interior' }
    ]
  },
  {
    name: 'Accessories',
    items: [
      { id: 'accessories', name: 'Spare Tire & Equipment', description: 'Check spare tire, jack, GPS, child seats', testId: 'chk-accessories' }
    ]
  }
];

interface InspectionChecklistProps {
  data: Record<string, 'OK' | 'DAMAGE'>;
  onUpdate: (data: Record<string, 'OK' | 'DAMAGE'>) => void;
  onDamageDetected: () => void;
}

export const InspectionChecklist: React.FC<InspectionChecklistProps> = ({
  data,
  onUpdate,
  onDamageDetected
}) => {
  const [checklistData, setChecklistData] = useState<Record<string, 'OK' | 'DAMAGE'>>(data);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setChecklistData(data);
  }, [data]);

  const handleItemChange = (itemId: string, value: 'OK' | 'DAMAGE') => {
    const newData = { ...checklistData, [itemId]: value };
    setChecklistData(newData);
    setHasUnsavedChanges(true);
    onUpdate(newData);

    // If damage is detected, prompt to add marker
    if (value === 'DAMAGE') {
      setTimeout(() => {
        if (confirm(`Damage detected in ${CHECKLIST_SECTIONS.flatMap(s => s.items).find(i => i.id === itemId)?.name}. Would you like to add a damage marker to the vehicle diagram?`)) {
          onDamageDetected();
        }
      }, 500);
    }
  };

  const getCompletionStats = () => {
    const totalItems = CHECKLIST_SECTIONS.flatMap(s => s.items).length;
    const completedItems = Object.keys(checklistData).length;
    const damageItems = Object.values(checklistData).filter(v => v === 'DAMAGE').length;
    
    return { totalItems, completedItems, damageItems };
  };

  const { totalItems, completedItems, damageItems } = getCompletionStats();

  return (
    <div id="step-checklist" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Walk-Around Checklist</h3>
        <p className="text-muted-foreground">
          Inspect each section of the vehicle and mark as OK or Damage.
        </p>
      </div>

      {/* Progress Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="font-medium">{completedItems}/{totalItems}</span> sections completed
              </div>
              {damageItems > 0 && (
                <Badge variant="destructive">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  {damageItems} damage{damageItems !== 1 ? 's' : ''} found
                </Badge>
              )}
              {completedItems === totalItems && damageItems === 0 && (
                <Badge variant="default">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  All OK
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Sections */}
      <div className="space-y-4">
        {CHECKLIST_SECTIONS.map((section) => (
          <Card key={section.name}>
            <CardHeader>
              <CardTitle className="text-base">{section.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.items.map((item) => (
                <div key={item.id} className="space-y-3">
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  
                  <RadioGroup
                    value={checklistData[item.id] || ''}
                    onValueChange={(value: 'OK' | 'DAMAGE') => handleItemChange(item.id, value)}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="OK" id={`${item.testId}-ok`} />
                      <Label htmlFor={`${item.testId}-ok`} className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        OK
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="DAMAGE" id={`${item.testId}-damage`} />
                      <Label htmlFor={`${item.testId}-damage`} className="flex items-center gap-2 text-red-700">
                        <AlertTriangle className="h-4 w-4" />
                        Damage
                      </Label>
                    </div>
                  </RadioGroup>

                  {checklistData[item.id] === 'DAMAGE' && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800 mb-2">
                        Damage detected. Consider adding a damage marker to the vehicle diagram.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={onDamageDetected}
                        className="border-red-300 text-red-700 hover:bg-red-100"
                      >
                        <Camera className="mr-2 h-3 w-3" />
                        Add Damage Marker
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {hasUnsavedChanges && (
        <div className="text-sm text-muted-foreground text-center">
          Changes are automatically saved
        </div>
      )}
    </div>
  );
};