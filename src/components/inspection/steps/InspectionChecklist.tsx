import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';

const CHECKLIST_ITEMS = [
  { id: 'exterior', label: 'Exterior', description: 'Body panels, paint, trim' },
  { id: 'glass', label: 'Glass', description: 'Windows, windshield, mirrors' },
  { id: 'tires_rims', label: 'Tires & Rims', description: 'Tire condition, rim damage' },
  { id: 'interior', label: 'Interior', description: 'Seats, dashboard, controls' },
  { id: 'accessories', label: 'Accessories', description: 'Floor mats, spare tire, tools' }
];

interface InspectionChecklistProps {
  checklist: Record<string, 'OK' | 'DAMAGE'>;
  onChange: (checklist: Record<string, 'OK' | 'DAMAGE'>) => void;
}

export function InspectionChecklist({ checklist, onChange }: InspectionChecklistProps) {
  const updateItem = (itemId: string, value: 'OK' | 'DAMAGE') => {
    onChange({ ...checklist, [itemId]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {CHECKLIST_ITEMS.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-sm text-muted-foreground font-normal">{item.description}</div>
                </div>
                {checklist[item.id] === 'OK' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                {checklist[item.id] === 'DAMAGE' && <XCircle className="h-5 w-5 text-red-600" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={checklist[item.id] || ''}
                onValueChange={(value) => updateItem(item.id, value as 'OK' | 'DAMAGE')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="OK" id={`${item.id}-ok`} />
                  <Label htmlFor={`${item.id}-ok`} className="cursor-pointer">OK</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="DAMAGE" id={`${item.id}-damage`} />
                  <Label htmlFor={`${item.id}-damage`} className="cursor-pointer">DAMAGE</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
