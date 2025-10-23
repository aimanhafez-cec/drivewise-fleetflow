import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export function ReadOnlyField({ label, value, icon }: ReadOnlyFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        {icon}
        {label}
      </Label>
      <Input value={value} disabled className="bg-muted" />
    </div>
  );
}
