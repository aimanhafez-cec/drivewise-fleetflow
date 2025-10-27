import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Link as LinkIcon, 
  Copy, 
  Mail, 
  MessageSquare, 
  QrCode, 
  Clock,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentLinkPaymentProps {
  amount: number;
  customerEmail?: string;
  customerPhone?: string;
  onLinkGenerated: (linkToken: string, expiresInHours: number) => void;
  disabled?: boolean;
}

export const PaymentLinkPayment: React.FC<PaymentLinkPaymentProps> = ({
  amount,
  customerEmail,
  customerPhone,
  onLinkGenerated,
  disabled = false,
}) => {
  const { toast } = useToast();
  const [linkAmount, setLinkAmount] = useState(amount);
  const [expiresIn, setExpiresIn] = useState<string>('24');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [linkStatus, setLinkStatus] = useState<'pending' | 'generated' | 'sent'>('pending');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateLink = async () => {
    setIsGenerating(true);
    
    // Simulate link generation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const linkToken = `pay_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const paymentUrl = `${window.location.origin}/payment/${linkToken}`;
    
    setGeneratedLink(paymentUrl);
    setLinkStatus('generated');
    setIsGenerating(false);
    
    onLinkGenerated(linkToken, parseInt(expiresIn));
    
    toast({
      title: 'Payment Link Generated',
      description: 'Payment link created successfully',
    });
  };

  const copyToClipboard = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(generatedLink);
      toast({
        title: 'Link Copied',
        description: 'Payment link copied to clipboard',
      });
    }
  };

  const sendViaEmail = () => {
    if (generatedLink && customerEmail) {
      // Simulate sending email
      toast({
        title: 'Email Sent',
        description: `Payment link sent to ${customerEmail}`,
      });
      setLinkStatus('sent');
    }
  };

  const sendViaSMS = () => {
    if (generatedLink && customerPhone) {
      // Simulate sending SMS
      toast({
        title: 'SMS Sent',
        description: `Payment link sent to ${customerPhone}`,
      });
      setLinkStatus('sent');
    }
  };

  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + parseInt(expiresIn));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          Payment Link Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!generatedLink ? (
          <>
            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="link-amount">Payment Amount (AED)</Label>
              <Input
                id="link-amount"
                type="number"
                value={linkAmount}
                onChange={(e) => setLinkAmount(parseFloat(e.target.value) || 0)}
                min={0}
                step={0.01}
                disabled={disabled}
              />
            </div>

            {/* Expiry Selection */}
            <div className="space-y-2">
              <Label>Link Expiration</Label>
              <Select value={expiresIn} onValueChange={setExpiresIn} disabled={disabled}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Hour</SelectItem>
                  <SelectItem value="6">6 Hours</SelectItem>
                  <SelectItem value="12">12 Hours</SelectItem>
                  <SelectItem value="24">24 Hours (Default)</SelectItem>
                  <SelectItem value="48">48 Hours</SelectItem>
                  <SelectItem value="72">72 Hours</SelectItem>
                  <SelectItem value="168">7 Days</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Expires on: {expiryDate.toLocaleString('en-US', { 
                  dateStyle: 'medium', 
                  timeStyle: 'short' 
                })}
              </p>
            </div>

            {/* Customer Info Display */}
            {(customerEmail || customerPhone) && (
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <p className="text-sm font-medium">Customer Information</p>
                {customerEmail && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{customerEmail}</span>
                  </div>
                )}
                {customerPhone && (
                  <div className="flex items-center gap-2 text-sm">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>{customerPhone}</span>
                  </div>
                )}
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={generateLink}
              disabled={disabled || isGenerating || linkAmount <= 0}
              className="w-full"
              size="lg"
            >
              {isGenerating ? 'Generating Link...' : `Generate Payment Link (${linkAmount.toFixed(2)} AED)`}
            </Button>
          </>
        ) : (
          <>
            {/* Link Status */}
            <div className="flex items-center gap-2">
              <Badge variant={linkStatus === 'sent' ? 'default' : 'secondary'}>
                {linkStatus === 'sent' ? 'Sent' : 'Pending'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Payment Amount: {linkAmount.toFixed(2)} AED
              </span>
            </div>

            {/* Generated Link Display */}
            <div className="space-y-2">
              <Label>Payment Link</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={generatedLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* QR Code Placeholder */}
            <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg">
              <div className="text-center space-y-2">
                <QrCode className="h-24 w-24 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">QR Code for Easy Scanning</p>
                <Button variant="outline" size="sm">
                  Download QR Code
                </Button>
              </div>
            </div>

            {/* Send Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {customerEmail && (
                <Button
                  variant="outline"
                  onClick={sendViaEmail}
                  disabled={disabled || linkStatus === 'sent'}
                  className="w-full"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send via Email
                </Button>
              )}
              {customerPhone && (
                <Button
                  variant="outline"
                  onClick={sendViaSMS}
                  disabled={disabled || linkStatus === 'sent'}
                  className="w-full"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send via SMS
                </Button>
              )}
            </div>

            {/* Link Info */}
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-1">Payment link generated successfully</p>
                <p className="text-sm text-muted-foreground">
                  This link will expire in {expiresIn} hours. The customer can use this link to complete the payment online.
                </p>
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => window.open(generatedLink, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview Link
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setGeneratedLink(null);
                  setLinkStatus('pending');
                }}
              >
                Generate New Link
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
