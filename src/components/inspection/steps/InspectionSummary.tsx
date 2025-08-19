import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RequiredLabel } from '@/components/ui/required-label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { InspectionData } from '@/lib/api/inspection';
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Gauge, 
  Fuel, 
  Package,
  PenTool,
  User
} from 'lucide-react';

interface InspectionSummaryProps {
  inspectionData: Partial<InspectionData>;
  onSignature: (signature: { imageUrl: string; name: string; signedAt: string }) => void;
}

export const InspectionSummary: React.FC<InspectionSummaryProps> = ({
  inspectionData,
  onSignature
}) => {
  const [signerName, setSignerName] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getEventPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if ('clientX' in e) {
      // Mouse event
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    } else {
      // Touch event
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getEventPos(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getEventPos(e);

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert canvas to base64
    const signatureData = canvas.toDataURL();
    setSignature(signatureData);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
  };

  const handleSaveSignature = () => {
    if (!signature || !signerName.trim()) return;

    const signatureData = {
      imageUrl: signature,
      name: signerName.trim(),
      signedAt: new Date().toISOString()
    };

    onSignature(signatureData);
  };

  const getChecklistSummary = () => {
    const checklist = inspectionData.checklist || {};
    const total = Object.keys(checklist).length;
    const damages = Object.values(checklist).filter(v => v === 'DAMAGE').length;
    const ok = total - damages;

    return { total, ok, damages };
  };

  const checklistSummary = getChecklistSummary();
  const hasSignature = inspectionData.signature;

  return (
    <div id="step-summary" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Summary & Customer Signature</h3>
        <p className="text-muted-foreground">
          Review the inspection details and capture the customer's signature to complete.
        </p>
      </div>

      {/* Inspection Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Checklist Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Checklist Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Total Items Checked:</span>
              <Badge variant="outline">{checklistSummary.total}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                OK Items:
              </span>
              <Badge variant="default">{checklistSummary.ok}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                Damage Items:
              </span>
              <Badge variant={checklistSummary.damages > 0 ? 'destructive' : 'outline'}>
                {checklistSummary.damages}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Vehicle Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                Odometer (Out):
              </span>
              <Badge variant="outline">
                {inspectionData.metrics?.odometer?.toLocaleString() || 'Not set'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Fuel className="h-4 w-4" />
                Fuel Level (Out):
              </span>
              <Badge variant="outline">
                {inspectionData.metrics?.fuelLevel || 'Not set'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Extras Issued:
              </span>
              <Badge variant="outline">
                {inspectionData.metrics?.extras?.length || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Damage Markers Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Damage Markers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span>Total damage markers recorded:</span>
            <Badge variant={inspectionData.damageMarkerIds?.length ? 'destructive' : 'default'}>
              {inspectionData.damageMarkerIds?.length || 0}
            </Badge>
          </div>
          {inspectionData.damageMarkerIds && inspectionData.damageMarkerIds.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              All damage markers have been recorded as pre-existing conditions.
            </p>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Customer Signature */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Customer Signature
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasSignature ? (
            <div className="space-y-4">
              <div className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Signature Captured</span>
                </div>
                <div className="text-sm space-y-1">
                  <p><strong>Signed by:</strong> {inspectionData.signature?.name}</p>
                  <p><strong>Signed at:</strong> {inspectionData.signature?.signedAt ? new Date(inspectionData.signature.signedAt).toLocaleString() : 'Unknown'}</p>
                </div>
              </div>
              <div className="border-2 border-gray-200 rounded-lg p-2">
                <img 
                  src={inspectionData.signature?.imageUrl} 
                  alt="Customer signature"
                  className="max-w-full h-auto"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <RequiredLabel htmlFor="sig-name">Customer Name *</RequiredLabel>
                <Input
                  id="sig-name"
                  placeholder="Enter customer name"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <RequiredLabel>Signature *</RequiredLabel>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <canvas
                    id="sig-pad"
                    ref={canvasRef}
                    width={400}
                    height={150}
                    className="w-full border border-gray-200 rounded cursor-crosshair bg-white touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-muted-foreground">
                      Sign above using your mouse, finger, or Apple Pencil
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearSignature}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSaveSignature}
                disabled={!signature || !signerName.trim()}
                className="w-full"
              >
                <User className="mr-2 h-4 w-4" />
                Save Signature
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completion Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4">
            {hasSignature ? (
              <Badge variant="default" className="text-base py-2 px-4">
                <CheckCircle className="mr-2 h-4 w-4" />
                Ready to Lock & Attach
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-base py-2 px-4">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Customer signature required
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};