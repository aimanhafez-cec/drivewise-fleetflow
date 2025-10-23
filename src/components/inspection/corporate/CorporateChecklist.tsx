import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

interface ChecklistItem {
  itemId: string;
  rating: 'good' | 'moderate' | 'needs_repair' | 'n_a' | null;
  remarks: string;
}

interface CorporateChecklistProps {
  checklist: ChecklistItem[];
  onChange: (checklist: ChecklistItem[]) => void;
}

const CHECKLIST_ITEMS = [
  { id: 'tires_rims', label: 'Tires & Rims' },
  { id: 'lights', label: 'Lights' },
  { id: 'brakes', label: 'Brakes' },
  { id: 'engine', label: 'Engine' },
  { id: 'body', label: 'Body' },
  { id: 'interior', label: 'Interior' },
  { id: 'fuel_tank', label: 'Fuel Tank' },
  { id: 'spare_tire', label: 'Spare Tire' },
  { id: 'tools', label: 'Tools' },
  { id: 'registration', label: 'Registration Documents' }
];

export function CorporateChecklist({ checklist, onChange }: CorporateChecklistProps) {
  const handleRatingChange = (itemId: string, rating: 'good' | 'moderate' | 'needs_repair' | 'n_a') => {
    const existingIndex = checklist.findIndex(item => item.itemId === itemId);
    const newChecklist = [...checklist];
    
    if (existingIndex >= 0) {
      newChecklist[existingIndex] = { ...newChecklist[existingIndex], rating };
    } else {
      newChecklist.push({ itemId, rating, remarks: '' });
    }
    
    onChange(newChecklist);
  };

  const handleRemarksChange = (itemId: string, remarks: string) => {
    const existingIndex = checklist.findIndex(item => item.itemId === itemId);
    const newChecklist = [...checklist];
    
    if (existingIndex >= 0) {
      newChecklist[existingIndex] = { ...newChecklist[existingIndex], remarks };
    } else {
      newChecklist.push({ itemId, rating: null, remarks });
    }
    
    onChange(newChecklist);
  };

  const getItemData = (itemId: string): ChecklistItem => {
    return checklist.find(item => item.itemId === itemId) || { itemId, rating: null, remarks: '' };
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left p-3 font-medium text-sm">Item</th>
              <th className="text-center p-3 font-medium text-sm w-20">Good</th>
              <th className="text-center p-3 font-medium text-sm w-20">Moderate</th>
              <th className="text-center p-3 font-medium text-sm w-32">Need Repairs</th>
              <th className="text-center p-3 font-medium text-sm w-20">N/A</th>
              <th className="text-left p-3 font-medium text-sm w-1/3">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {CHECKLIST_ITEMS.map((item, index) => {
              const itemData = getItemData(item.id);
              return (
                <tr 
                  key={item.id} 
                  className={`border-b last:border-b-0 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
                >
                  <td className="p-3">
                    <Label className="font-normal">{item.label}</Label>
                  </td>
                  <td className="p-3 text-center">
                    <RadioGroup
                      value={itemData.rating || ''}
                      onValueChange={(value) => handleRatingChange(item.id, value as any)}
                    >
                      <RadioGroupItem 
                        value="good" 
                        id={`${item.id}-good`}
                        className="mx-auto"
                      />
                    </RadioGroup>
                  </td>
                  <td className="p-3 text-center">
                    <RadioGroup
                      value={itemData.rating || ''}
                      onValueChange={(value) => handleRatingChange(item.id, value as any)}
                    >
                      <RadioGroupItem 
                        value="moderate" 
                        id={`${item.id}-moderate`}
                        className="mx-auto"
                      />
                    </RadioGroup>
                  </td>
                  <td className="p-3 text-center">
                    <RadioGroup
                      value={itemData.rating || ''}
                      onValueChange={(value) => handleRatingChange(item.id, value as any)}
                    >
                      <RadioGroupItem 
                        value="needs_repair" 
                        id={`${item.id}-needs_repair`}
                        className="mx-auto"
                      />
                    </RadioGroup>
                  </td>
                  <td className="p-3 text-center">
                    <RadioGroup
                      value={itemData.rating || ''}
                      onValueChange={(value) => handleRatingChange(item.id, value as any)}
                    >
                      <RadioGroupItem 
                        value="n_a" 
                        id={`${item.id}-n_a`}
                        className="mx-auto"
                      />
                    </RadioGroup>
                  </td>
                  <td className="p-3">
                    <Textarea
                      value={itemData.remarks}
                      onChange={(e) => handleRemarksChange(item.id, e.target.value)}
                      placeholder="Add remarks..."
                      className="min-h-[60px] resize-none"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
