import { CreateMovementData } from "@/lib/api/fleet-operations";

interface DocumentsStepProps {
  data: Partial<CreateMovementData>;
  onUpdate: (data: Partial<CreateMovementData>) => void;
  onNext: () => void;
}

export function DocumentsStep({ data, onUpdate }: DocumentsStepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Documents</h2>
      <p className="text-sm text-muted-foreground">Upload handover forms, photos, and supporting documents</p>
    </div>
  );
}
