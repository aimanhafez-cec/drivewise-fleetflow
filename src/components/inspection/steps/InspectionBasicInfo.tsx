import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { INSPECTION_TYPES, InspectionType } from '@/types/inspection';

interface InspectionBasicInfoProps {
  data: {
    entry_date: string;
    inspection_type: InspectionType | '';
  };
  inspectionNo: string;
  onChange: (updates: any) => void;
}

export function InspectionBasicInfo({ data, inspectionNo, onChange }: InspectionBasicInfoProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Inspection No.</Label>
          <div className="flex items-center gap-2">
            <Input value={inspectionNo} disabled className="bg-muted" />
            <Badge variant="outline">Auto-generated</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Inspection number will be auto-generated when you save
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="entry_date">Entry Date *</Label>
          <Input
            id="entry_date"
            type="date"
            value={data.entry_date}
            onChange={(e) => onChange({ entry_date: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inspection_type">Inspection Type *</Label>
          <Select
            value={data.inspection_type}
            onValueChange={(value) => onChange({ inspection_type: value as InspectionType })}
          >
            <SelectTrigger id="inspection_type">
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

        <div className="space-y-2">
          <Label>Status</Label>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">DRAFT</Badge>
            <p className="text-sm text-muted-foreground">
              Auto-managed based on completion
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-dashed p-4 bg-muted/50">
        <p className="text-sm font-medium mb-2">Status Flow:</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">DRAFT</Badge>
          <span>→</span>
          <Badge variant="outline">IN_PROGRESS</Badge>
          <span>→</span>
          <Badge variant="default">APPROVED</Badge>
          <span className="ml-2">(Locked after signature)</span>
        </div>
      </div>
    </div>
  );
}
