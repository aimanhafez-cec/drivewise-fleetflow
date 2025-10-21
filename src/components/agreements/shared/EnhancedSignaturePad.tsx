import { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RotateCcw, Check } from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedSignaturePadProps {
  onSave: (signatureData: string, signerName: string) => void;
  signerName?: string;
  title?: string;
  disabled?: boolean;
}

export const EnhancedSignaturePad = ({
  onSave,
  signerName: initialSignerName = '',
  title = 'Signature',
  disabled = false,
}: EnhancedSignaturePadProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signerName, setSignerName] = useState(initialSignerName);
  const [typedSignature, setTypedSignature] = useState('');
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Configure drawing style
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const point = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const point = getPoint(e);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getPoint = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setTypedSignature('');
  };

  const generateTypedSignature = () => {
    if (!typedSignature.trim()) {
      toast.error('Please enter your name');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw typed signature in cursive font
    ctx.font = '48px "Dancing Script", cursive';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2);

    setHasDrawn(true);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!hasDrawn) {
      toast.error('Please provide a signature');
      return;
    }

    if (!signerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    const signatureData = canvas.toDataURL('image/png');
    onSave(signatureData, signerName);
    toast.success('Signature saved successfully');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Signer Name */}
        <div className="space-y-2">
          <Label htmlFor="signer-name">Full Name *</Label>
          <Input
            id="signer-name"
            placeholder="Enter your full name"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            disabled={disabled}
          />
        </div>

        {/* Signature Mode Tabs */}
        <Tabs value={signatureMode} onValueChange={(v) => setSignatureMode(v as 'draw' | 'type')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="draw">Draw</TabsTrigger>
            <TabsTrigger value="type">Type</TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="space-y-4">
            <div className="space-y-2">
              <Label>Draw your signature</Label>
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="w-full h-48 border-2 border-input rounded-md touch-none bg-background cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-muted-foreground text-sm">Sign here</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="type" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="typed-signature">Type your name</Label>
              <Input
                id="typed-signature"
                placeholder="Enter your name as signature"
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                disabled={disabled}
                className="font-['Dancing_Script'] text-2xl"
              />
              <Button
                variant="outline"
                onClick={generateTypedSignature}
                disabled={disabled || !typedSignature.trim()}
                className="w-full"
              >
                Generate Signature
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Preview</Label>
              <canvas
                ref={canvasRef}
                className="w-full h-48 border-2 border-input rounded-md bg-background"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={clearSignature}
            disabled={disabled || !hasDrawn}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button
            onClick={handleSave}
            disabled={disabled || !hasDrawn || !signerName.trim()}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-2" />
            Save Signature
          </Button>
        </div>

        {/* Info */}
        <p className="text-xs text-muted-foreground">
          By signing, you confirm that the information provided is accurate and complete.
        </p>
      </CardContent>
    </Card>
  );
};
