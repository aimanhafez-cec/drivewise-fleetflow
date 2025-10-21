import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  SALIK_GATES,
  DARB_GATES,
  formatAED,
} from '@/lib/constants/uae-compliance';

interface UAETollGateSelectorProps {
  system: 'salik' | 'darb';
  onSelectGate?: (gate: {
    id: string;
    name: string;
    name_ar: string;
    location: string;
    rate: number;
  }) => void;
}

export const UAETollGateSelector: React.FC<UAETollGateSelectorProps> = ({
  system,
  onSelectGate,
}) => {
  const [selectedGate, setSelectedGate] = useState<string>('');

  const gates = system === 'salik' ? SALIK_GATES : DARB_GATES;
  const systemName = system === 'salik' ? 'Salik' : 'Darb';

  const handleGateSelect = (gateId: string) => {
    setSelectedGate(gateId);
    const gate = gates.find((g) => g.id === gateId);
    if (gate) {
      onSelectGate?.(gate);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{systemName} Toll Gates</CardTitle>
        <CardDescription>
          Select a toll gate to auto-fill location and rate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedGate} onValueChange={handleGateSelect}>
          <div className="space-y-2">
            {gates.map((gate) => (
              <div
                key={gate.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedGate === gate.id
                    ? 'border-primary bg-accent'
                    : 'hover:bg-accent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value={gate.id} id={gate.id} />
                  <Label htmlFor={gate.id} className="flex-1 cursor-pointer">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{gate.name}</p>
                        <Badge variant="secondary">{formatAED(gate.rate)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground" dir="rtl">
                        {gate.name_ar}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{gate.location}</span>
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};
