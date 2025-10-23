import { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, PenTool, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface InspectionSignatureProps {
  onComplete: (signature: any) => void;
  isLoading: boolean;
}

export function InspectionSignature({ onComplete, isLoading }: InspectionSignatureProps) {
  const [inspectorName, setInspectorName] = useState('');
  const [signatureDrawn, setSignatureDrawn] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    setSignatureDrawn(true);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDrawn(false);
  };

  const handleComplete = () => {
    const canvas = canvasRef.current;
    if (!canvas || !signatureDrawn || !inspectorName) return;

    const signatureData = {
      imageUrl: canvas.toDataURL(),
      name: inspectorName,
      signedAt: new Date().toISOString()
    };

    onComplete(signatureData);
  };

  const canComplete = inspectorName.trim() && signatureDrawn;

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          By signing this inspection, you confirm that all information is accurate. 
          The inspection will be <strong>automatically approved and locked</strong> after signature.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="inspector_name">Inspector Name *</Label>
        <Input
          id="inspector_name"
          placeholder="Enter your full name"
          value={inspectorName}
          onChange={(e) => setInspectorName(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Label>Digital Signature *</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSignature}
              disabled={!signatureDrawn}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          <div className="border-2 border-dashed rounded-lg bg-background">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="w-full cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              style={{ touchAction: 'none' }}
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <PenTool className="h-4 w-4" />
            <span>Sign above using your mouse or touch screen</span>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-dashed p-4 bg-muted/50">
        <p className="text-sm font-medium mb-2">What happens next:</p>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Status will change to <strong>APPROVED</strong></li>
          <li>Inspection will be <strong>locked</strong> (read-only)</li>
          <li>Completion date/time will be recorded</li>
          <li>For Rental Check-out: Vehicle assignment will be updated</li>
        </ul>
      </div>

      <Button
        onClick={handleComplete}
        disabled={!canComplete || isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? 'Completing...' : 'Complete Inspection'}
      </Button>
    </div>
  );
}
