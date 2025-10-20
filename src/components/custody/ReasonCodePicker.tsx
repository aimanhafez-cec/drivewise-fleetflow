import { AlertTriangle, Wrench, Calendar, Car, HelpCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CustodyReason } from '@/lib/api/custody';
import { Textarea } from '@/components/ui/textarea';

interface ReasonCodePickerProps {
  reasonCode: CustodyReason;
  reasonSubcode?: string;
  onReasonCodeChange: (code: CustodyReason) => void;
  onReasonSubcodeChange: (subcode: string) => void;
  disabled?: boolean;
}

const reasonCategories = [
  {
    value: 'accident' as CustodyReason,
    label: 'Accident',
    icon: AlertTriangle,
    color: 'text-red-600',
    description: 'Vehicle involved in accident',
    subcodes: [
      { value: 'collision_third_party', label: 'Collision - Third Party' },
      { value: 'collision_own_damage', label: 'Collision - Own Damage' },
      { value: 'hit_and_run', label: 'Hit and Run' },
      { value: 'rollover', label: 'Rollover' },
      { value: 'fire', label: 'Fire' },
    ],
  },
  {
    value: 'breakdown' as CustodyReason,
    label: 'Breakdown',
    icon: Wrench,
    color: 'text-orange-600',
    description: 'Mechanical or technical failure',
    subcodes: [
      { value: 'engine_failure', label: 'Engine Failure' },
      { value: 'transmission_issue', label: 'Transmission Issue' },
      { value: 'electrical_problem', label: 'Electrical Problem' },
      { value: 'tire_blowout', label: 'Tire Blowout' },
      { value: 'battery_dead', label: 'Battery Dead' },
    ],
  },
  {
    value: 'maintenance' as CustodyReason,
    label: 'Scheduled Maintenance',
    icon: Calendar,
    color: 'text-blue-600',
    description: 'Routine service or planned work',
    subcodes: [
      { value: 'regular_service', label: 'Regular Service' },
      { value: 'recall_campaign', label: 'Recall Campaign' },
      { value: 'warranty_work', label: 'Warranty Work' },
      { value: 'inspection', label: 'Annual Inspection' },
    ],
  },
  {
    value: 'damage' as CustodyReason,
    label: 'Damage',
    icon: Car,
    color: 'text-yellow-600',
    description: 'Non-accident damage',
    subcodes: [
      { value: 'vandalism', label: 'Vandalism' },
      { value: 'theft_attempted', label: 'Attempted Theft' },
      { value: 'weather_damage', label: 'Weather Damage' },
      { value: 'interior_damage', label: 'Interior Damage' },
    ],
  },
  {
    value: 'other' as CustodyReason,
    label: 'Other',
    icon: HelpCircle,
    color: 'text-gray-600',
    description: 'Other reasons',
    subcodes: [
      { value: 'customer_request', label: 'Customer Request' },
      { value: 'upgrade', label: 'Upgrade' },
      { value: 'downgrade', label: 'Downgrade' },
    ],
  },
];

export function ReasonCodePicker({
  reasonCode,
  reasonSubcode,
  onReasonCodeChange,
  onReasonSubcodeChange,
  disabled = false,
}: ReasonCodePickerProps) {
  const selectedCategory = reasonCategories.find((c) => c.value === reasonCode);
  const Icon = selectedCategory?.icon || HelpCircle;

  return (
    <div className="space-y-4">
      {/* Main Reason Category */}
      <div className="space-y-2">
        <Label htmlFor="reason-code">
          Reason for Replacement <span className="text-destructive">*</span>
        </Label>
        <Select
          value={reasonCode}
          onValueChange={onReasonCodeChange}
          disabled={disabled}
        >
          <SelectTrigger id="reason-code">
            <SelectValue placeholder="Select reason" />
          </SelectTrigger>
          <SelectContent className="bg-background">
            {reasonCategories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <SelectItem key={category.value} value={category.value}>
                  <div className="flex items-center gap-2">
                    <CategoryIcon className={`h-4 w-4 ${category.color}`} />
                    <div>
                      <div className="font-medium">{category.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {category.description}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Subcategory */}
      {selectedCategory && selectedCategory.subcodes.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="reason-subcode">
            Specific Reason <span className="text-destructive">*</span>
          </Label>
          <Select
            value={reasonSubcode}
            onValueChange={onReasonSubcodeChange}
            disabled={disabled}
          >
            <SelectTrigger id="reason-subcode">
              <SelectValue placeholder="Select specific reason" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              {selectedCategory.subcodes.map((subcode) => (
                <SelectItem key={subcode.value} value={subcode.value}>
                  {subcode.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Help Text */}
      {selectedCategory && (
        <div className="rounded-md bg-muted p-3 text-sm">
          <div className="flex items-start gap-2">
            <Icon className={`mt-0.5 h-4 w-4 ${selectedCategory.color}`} />
            <div>
              <p className="font-medium">{selectedCategory.label}</p>
              <p className="text-xs text-muted-foreground">
                {selectedCategory.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
