import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Layers, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface MultiLineToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  lineCount?: number;
  disabled?: boolean;
  disabledReason?: string;
}

export const MultiLineToggle: React.FC<MultiLineToggleProps> = ({
  enabled,
  onToggle,
  lineCount = 0,
  disabled = false,
  disabledReason,
}) => {
  return (
    <Card className={enabled ? 'border-primary' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${enabled ? 'bg-primary/10' : 'bg-muted'}`}>
              <Layers className={`h-5 w-5 ${enabled ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Multi-Line Agreement
                {enabled && (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Active
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-1">
                {enabled 
                  ? 'Create agreements for multiple vehicles in a single session'
                  : 'Enable to add multiple vehicles to this agreement'
                }
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="multi-line-mode"
              checked={enabled}
              onCheckedChange={onToggle}
              disabled={disabled}
            />
            <Label htmlFor="multi-line-mode" className="sr-only">
              Enable multi-line mode
            </Label>
          </div>
        </div>
      </CardHeader>

      {enabled && (
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <Layers className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Multi-Line Mode Enabled</p>
                  <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                    <li>Add multiple vehicles to this agreement</li>
                    <li>Each line has its own pricing and configuration</li>
                    <li>Shared customer, payment, and document verification</li>
                    <li>Perfect for corporate fleet handovers or group rentals</li>
                  </ul>
                  {lineCount > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm">
                        <span className="font-semibold">{lineCount}</span> vehicle line{lineCount !== 1 ? 's' : ''} configured
                      </p>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      )}

      {disabled && disabledReason && (
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {disabledReason}
            </AlertDescription>
          </Alert>
        </CardContent>
      )}
    </Card>
  );
};
