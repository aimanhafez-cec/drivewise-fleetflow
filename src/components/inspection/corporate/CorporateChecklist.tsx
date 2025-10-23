import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';

interface CorporateChecklistProps {
  checklist: Record<string, 'OK' | 'DAMAGE'>;
  onChange: (checklist: Record<string, 'OK' | 'DAMAGE'>) => void;
}

const CHECKLIST_ITEMS = [
  { id: 'exterior', label: 'Exterior Body' },
  { id: 'glass', label: 'Glass & Windows' },
  { id: 'tires_rims', label: 'Tires & Rims' },
  { id: 'interior', label: 'Interior Condition' },
  { id: 'accessories', label: 'Accessories & Equipment' }
];

export function CorporateChecklist({ checklist, onChange }: CorporateChecklistProps) {
  const handleItemChange = (itemId: string, value: 'OK' | 'DAMAGE') => {
    onChange({
      ...checklist,
      [itemId]: value
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-dashed p-4 bg-muted/50">
        <p className="text-sm text-muted-foreground">
          Inspect each item and mark as OK or DAMAGE
        </p>
      </div>

      <div className="grid gap-4">
        {CHECKLIST_ITEMS.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <Label className="font-medium flex-1">{item.label}</Label>
              <RadioGroup
                value={checklist[item.id] || ''}
                onValueChange={(value) => handleItemChange(item.id, value as 'OK' | 'DAMAGE')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="OK" id={`${item.id}-ok`} />
                  <Label 
                    htmlFor={`${item.id}-ok`}
                    className="flex items-center gap-2 cursor-pointer font-normal"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    OK
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="DAMAGE" id={`${item.id}-damage`} />
                  <Label 
                    htmlFor={`${item.id}-damage`}
                    className="flex items-center gap-2 cursor-pointer font-normal"
                  >
                    <XCircle className="h-4 w-4 text-red-600" />
                    DAMAGE
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
