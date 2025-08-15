import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RequiredLabel } from '@/components/ui/required-label';
import { FormError } from '@/components/ui/form-error';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { FileText, PenTool, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AgreementWizardStep6Props {
  data: {
    termsAccepted: boolean;
    signature?: {
      data: string;
      signerName: string;
      timestamp: string;
    };
  };
  reservation: any;
  wizardData: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export const AgreementWizardStep6: React.FC<AgreementWizardStep6Props> = ({
  data,
  reservation,
  wizardData,
  onChange,
  errors,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signerName, setSignerName] = useState(data.signature?.signerName || '');

  const updateField = (field: string, value: any) => {
    onChange({ [field]: value });
  };

  // Signature canvas handling
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const signatureData = canvas.toDataURL();
    onChange({
      signature: {
        data: signatureData,
        signerName,
        timestamp: new Date().toISOString(),
      },
    });
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange({ signature: undefined });
  };

  // Initialize canvas
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 200;

    // Set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Restore signature if exists
    if (data.signature?.data) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = data.signature.data;
    }
  }, [data.signature?.data]);

  const termsAndConditions = `
RENTAL AGREEMENT TERMS AND CONDITIONS

1. RENTAL PERIOD
The rental period begins on the date and time specified in this agreement and ends on the return date and time specified. The vehicle must be returned to the location specified in this agreement.

2. AUTHORIZED DRIVERS
Only persons listed as authorized drivers on this agreement may operate the vehicle. All drivers must possess a valid driver's license and meet age requirements.

3. USE RESTRICTIONS
The vehicle may not be used:
- For any illegal purpose or in connection with any illegal activity
- To carry passengers or cargo for hire
- To propel or tow any vehicle, trailer, or other object
- In any race, speed test, rally, or driving contest
- While the driver is under the influence of alcohol or drugs

4. CONDITION OF VEHICLE
You acknowledge that you have inspected the vehicle and found it to be in good condition, clean, and properly equipped.

5. FUEL
You will return the vehicle with the same amount of fuel as when rented. If returned with less fuel, you will pay a fuel service charge.

6. INSURANCE
You are responsible for all damage to or loss of the vehicle during the rental period, regardless of fault or negligence.

7. PAYMENT
You authorize us to charge your payment method for all rental charges, including additional drivers, equipment, optional services, fuel service charges, and applicable taxes.

8. RETURN OF VEHICLE
You must return the vehicle to the location specified in this agreement at the date and time specified, in the same condition as when rented, except for normal wear and tear.

By signing below, you acknowledge that you have read and agree to be bound by all terms and conditions of this rental agreement.
  `;

  return (
    <div id="wiz-step-sign" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Terms & Conditions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Terms & Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full border rounded-md p-4">
                <div className="whitespace-pre-line text-sm">
                  {termsAndConditions}
                </div>
              </ScrollArea>
              
              <div className="mt-4 flex items-start space-x-2">
                <Checkbox
                  id="terms-acceptance"
                  checked={data.termsAccepted}
                  onCheckedChange={(checked) => updateField('termsAccepted', checked)}
                />
                <Label htmlFor="terms-acceptance" className="text-sm leading-relaxed">
                  I have read and agree to the terms and conditions above *
                </Label>
              </div>
              <FormError message={errors.terms} />
            </CardContent>
          </Card>
        </div>

        {/* Signature */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5" />
                Digital Signature
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <RequiredLabel htmlFor="signer-name">Signer Full Name</RequiredLabel>
                <Input
                  id="signer-name"
                  placeholder="Enter your full legal name"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  aria-required="true"
                />
                <FormError message={errors.signer_name} />
              </div>

              <div className="space-y-2">
                <RequiredLabel>Signature</RequiredLabel>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                  <canvas
                    ref={canvasRef}
                    className="border border-gray-300 rounded cursor-crosshair mx-auto block"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-muted-foreground">
                      Sign above with your mouse or touch screen
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearSignature}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  </div>
                </div>
                <FormError message={errors.signature} />
              </div>

              {data.signature && (
                <div className="text-xs text-muted-foreground">
                  Signed on {new Date(data.signature.timestamp).toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agreement Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Agreement Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-medium">{reservation.profiles?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vehicle:</span>
                  <span className="font-medium">
                    {reservation.vehicles ? 
                      `${reservation.vehicles.make} ${reservation.vehicles.model}` : 
                      'TBD'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contract Period:</span>
                  <span className="font-medium">
                    {wizardData.step1.contractStart} to {wizardData.step1.contractEnd}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium capitalize">
                    {wizardData.step5.paymentMethod?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-medium text-lg">
                <span>Total Amount:</span>
                <span>{formatCurrency(reservation.total_amount || 0)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};