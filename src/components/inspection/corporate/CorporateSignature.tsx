import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PenTool, Trash2 } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

interface CorporateSignatureProps {
  signature: { imageUrl: string; name: string; signedAt: string } | null;
  onUpdate: (signature: { imageUrl: string; name: string; signedAt: string } | null) => void;
}

export function CorporateSignature({ signature, onUpdate }: CorporateSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [inspectorName, setInspectorName] = useState(signature?.name || '');
  const [hasSignature, setHasSignature] = useState(!!signature?.imageUrl);

  useEffect(() => {
    if (signature?.imageUrl && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = signature.imageUrl;
      }
    }
  }, [signature?.imageUrl]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    // Don't auto-save on stopDrawing - only update signature state locally
    if (hasSignature) {
      updateSignatureData();
    }
  };

  const updateSignatureData = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageUrl = canvas.toDataURL('image/png');
    onUpdate({
      imageUrl,
      name: inspectorName,
      signedAt: new Date().toISOString()
    });
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onUpdate(null);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            <h3 className="font-semibold">Inspector Signature</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inspector-name">Inspector Name *</Label>
            <Input
              id="inspector-name"
              placeholder="Enter inspector full name"
              value={inspectorName}
              onChange={(e) => setInspectorName(e.target.value)}
              onBlur={() => {
                if (hasSignature) {
                  updateSignatureData();
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Signature *</Label>
            <div className="border-2 rounded-lg bg-white">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="w-full cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearSignature}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear Signature
              </Button>
            </div>
          </div>

          {!inspectorName && (
            <p className="text-sm text-muted-foreground">
              Please enter inspector name before signing
            </p>
          )}

          {signature?.signedAt && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <p className="text-muted-foreground">
                Signed by <strong>{signature.name}</strong> on{' '}
                {new Date(signature.signedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
