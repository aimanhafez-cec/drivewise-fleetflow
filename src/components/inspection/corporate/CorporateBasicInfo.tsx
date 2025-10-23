import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { INSPECTION_TYPES } from '@/types/inspection';
import { Calendar } from 'lucide-react';

interface CorporateBasicInfoProps {
  inspectionType: string;
  entryDate: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'APPROVED';
  onUpdate: (field: string, value: string) => void;
  isEditing?: boolean;
}

export function CorporateBasicInfo({
  inspectionType,
  entryDate,
  status,
  onUpdate,
  isEditing = false
}: CorporateBasicInfoProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="entry-date" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Entry Date
          </Label>
          <Input
            id="entry-date"
            type="date"
            value={entryDate}
            onChange={(e) => onUpdate('entry_date', e.target.value)}
            disabled={isEditing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inspection-type">Inspection Type *</Label>
          <Select
            value={inspectionType}
            onValueChange={(value) => onUpdate('inspection_type', value)}
            disabled={isEditing}
          >
            <SelectTrigger id="inspection-type">
              <SelectValue placeholder="Select inspection type" />
            </SelectTrigger>
            <SelectContent>
              {INSPECTION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isEditing && (
        <div className="rounded-lg border border-muted bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Entry date and inspection type cannot be changed when editing an existing inspection.
          </p>
        </div>
      )}
    </div>
  );
}
