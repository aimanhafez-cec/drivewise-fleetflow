import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { EnhancedSignaturePad } from '@/components/agreements/shared/EnhancedSignaturePad';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDateForDisplay } from '@/lib/utils/dateUtils';
import { CheckCircle2, XCircle, AlertTriangle, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';
import autostradLogo from '@/assets/autostrad-logo.png';

interface MasterAgreementData {
  id: string;
  agreement_no: string;
  agreement_date: string;
  public_token_expires_at: string;
  customer_acceptance_status: string | null;
  contract_effective_from: string;
  contract_effective_to: string;
  vat_percentage: number;
  customer: any;
  contact_person: any;
  legal_entity: any;
  business_unit: any;
  agreement_items: any[];
  customer_rejection_reason: string | null;
  customer_signed_at: string | null;
  customer_signature_data: any;
}

export default function MasterAgreementReview() {
  const { token } = useParams<{ token: string }>();
  
  const [agreement, setAgreement] = useState<MasterAgreementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [action, setAction] = useState<'accept' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [comments, setComments] = useState('');
  const [signatureData, setSignatureData] = useState<{ dataUrl: string; signerName: string; signerTitle?: string } | null>(null);
  const [signerName, setSignerName] = useState('');
  const [signerTitle, setSignerTitle] = useState('');

  useEffect(() => {
    fetchAgreementData();
  }, [token]);

  const fetchAgreementData = async () => {
    if (!token) {
      setError('Invalid master agreement link. No token provided.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://tbmcmbldoaespjlhpfys.supabase.co/functions/v1/get-public-master-agreement?token=${token}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load master agreement');
      }

      const data = await response.json();
      setAgreement(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching master agreement:', err);
      setError(err.message || 'Failed to load master agreement. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!agreement || !token) return;

    if (action === 'accept' && !signatureData) {
      toast.error('Please provide your signature to accept the master agreement');
      return;
    }

    if (action === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejecting the master agreement');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(
        'https://tbmcmbldoaespjlhpfys.supabase.co/functions/v1/submit-master-agreement-customer-response',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            action,
            signature_data: action === 'accept' ? {
              signature_image: signatureData?.dataUrl,
              signer_name: signatureData?.signerName,
              signer_title: signerTitle || undefined,
              signed_at: new Date().toISOString(),
            } : undefined,
            rejection_reason: action === 'reject' ? rejectionReason : undefined,
            comments: comments || undefined,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit response');
      }

      const result = await response.json();
      toast.success(result.message || 'Your response has been recorded successfully');
      
      await fetchAgreementData();
      setAction(null);
      setRejectionReason('');
      setComments('');
      setSignatureData(null);
      setSignerName('');
      setSignerTitle('');
    } catch (err: any) {
      console.error('Error submitting response:', err);
      toast.error(err.message || 'Failed to submit your response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotals = () => {
    if (!agreement) return { totalMonthlyRate: 0, vatAmount: 0, grandTotal: 0 };
    
    const agreementItems = agreement.agreement_items || [];
    const totalMonthlyRate = agreementItems.reduce((sum, item) => 
      sum + (parseFloat(item.monthly_rate) || 0), 0
    );
    const vatAmount = totalMonthlyRate * ((agreement.vat_percentage || 5) / 100);
    const grandTotal = totalMonthlyRate + vatAmount;

    return { totalMonthlyRate, vatAmount, grandTotal };
  };

  const isTokenExpired = () => {
    if (!agreement?.public_token_expires_at) return false;
    return new Date(agreement.public_token_expires_at) < new Date();
  };

  const hasAlreadyResponded = () => {
    return agreement?.customer_acceptance_status === 'accepted' || 
           agreement?.customer_acceptance_status === 'rejected';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !agreement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-8">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-6 w-6" />
              <CardTitle>Master Agreement Not Found</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {error || 'We could not find the master agreement you are looking for.'}
            </p>
            <p className="text-sm text-muted-foreground">
              Please check your link or contact Autostrad support for assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totals = calculateTotals();
  const tokenExpired = isTokenExpired();
  const alreadyResponded = hasAlreadyResponded();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <img src={autostradLogo} alt="Autostrad" className="h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground">Master Agreement Review</h1>
          <p className="text-muted-foreground mt-2">Please review the master agreement details below</p>
        </div>

        {/* Status Alert */}
        {alreadyResponded && (
          <Alert className={agreement.customer_acceptance_status === 'accepted' ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-red-500 bg-red-50 dark:bg-red-950'}>
            {agreement.customer_acceptance_status === 'accepted' ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              <span className="font-semibold">
                Master Agreement {agreement.customer_acceptance_status === 'accepted' ? 'Accepted' : 'Rejected'}
              </span>
              {agreement.customer_signed_at && (
                <span className="block text-sm mt-1">
                  on {formatDateForDisplay(new Date(agreement.customer_signed_at))}
                </span>
              )}
              {agreement.customer_acceptance_status === 'rejected' && agreement.customer_rejection_reason && (
                <span className="block text-sm mt-2">
                  Reason: {agreement.customer_rejection_reason}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {tokenExpired && (
          <Alert variant="destructive">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <span className="font-semibold">This master agreement link has expired.</span>
              <span className="block text-sm mt-1">
                Please contact Autostrad for an updated link.
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Agreement Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Master Agreement Details</CardTitle>
            </div>
            <CardDescription>Agreement #{agreement.agreement_no}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Customer:</span>
                <p className="font-semibold">{agreement.customer?.full_name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Agreement Date:</span>
                <p className="font-semibold">{formatDateForDisplay(new Date(agreement.agreement_date))}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Contract Start:</span>
                <p className="font-semibold">{formatDateForDisplay(new Date(agreement.contract_effective_from))}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Contract End:</span>
                <p className="font-semibold">{formatDateForDisplay(new Date(agreement.contract_effective_to))}</p>
              </div>
              {agreement.legal_entity && (
                <div>
                  <span className="text-muted-foreground">Legal Entity:</span>
                  <p className="font-semibold">{agreement.legal_entity.name}</p>
                </div>
              )}
              {agreement.business_unit && (
                <div>
                  <span className="text-muted-foreground">Business Unit:</span>
                  <p className="font-semibold">{agreement.business_unit.name}</p>
                </div>
              )}
            </div>

            {/* Vehicle Items */}
            {agreement.agreement_items && agreement.agreement_items.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Vehicle Lines</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3 text-left">Line</th>
                        <th className="p-3 text-left">Vehicle</th>
                        <th className="p-3 text-center">Quantity</th>
                        <th className="p-3 text-right">Monthly Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agreement.agreement_items.map((item: any, idx: number) => {
                        const vehicleName = item._vehicleMeta 
                          ? `${item._vehicleMeta.make} ${item._vehicleMeta.model} ${item._vehicleMeta.year}`
                          : item._vehicleClass?.name || 'Vehicle';
                        const quantity = item.qty || 1;
                        const monthlyRate = parseFloat(item.monthly_rate) || 0;

                        return (
                          <tr key={idx} className="border-t">
                            <td className="p-3 font-medium">{item.line_number || idx + 1}</td>
                            <td className="p-3">
                              <div className="font-medium">{vehicleName}</div>
                            </td>
                            <td className="p-3 text-center">{quantity}</td>
                            <td className="p-3 text-right font-mono font-semibold">
                              {formatCurrency(monthlyRate, 'AED')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Financial Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Financial Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Monthly Rate:</span>
                  <span className="font-mono">
                    {formatCurrency(totals.totalMonthlyRate, 'AED')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT ({agreement.vat_percentage}%):</span>
                  <span className="font-mono">
                    {formatCurrency(totals.vatAmount, 'AED')}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-bold">Grand Total:</span>
                  <span className="font-mono font-bold text-lg text-primary">
                    {formatCurrency(totals.grandTotal, 'AED')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Section */}
        {!alreadyResponded && !tokenExpired && (
          <Card>
            <CardHeader>
              <CardTitle>Your Response</CardTitle>
              <CardDescription>Please accept or reject this master agreement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Action Selection */}
              {!action && (
                <div className="flex gap-4">
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={() => setAction('accept')}
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Accept Master Agreement
                  </Button>
                  <Button
                    size="lg"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => setAction('reject')}
                  >
                    <XCircle className="mr-2 h-5 w-5" />
                    Reject Master Agreement
                  </Button>
                </div>
              )}

              {/* Accept Form */}
              {action === 'accept' && (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      By signing below, you confirm your acceptance of this master agreement and its terms.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signer-title">Title (Optional)</Label>
                    <Input
                      id="signer-title"
                      placeholder="e.g., Fleet Manager, Operations Director"
                      value={signerTitle}
                      onChange={(e) => setSignerTitle(e.target.value)}
                    />
                  </div>

                  <EnhancedSignaturePad
                    title="Authorized Signature"
                    signerName={signerName}
                    onSave={(dataUrl, name) => {
                      setSignatureData({ dataUrl, signerName: name, signerTitle });
                      setSignerName(name);
                    }}
                    disabled={submitting}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="comments">Additional Comments (Optional)</Label>
                    <Textarea
                      id="comments"
                      placeholder="Add any comments or notes..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleSubmit}
                      disabled={!signatureData || submitting}
                      className="flex-1"
                    >
                      {submitting ? 'Submitting...' : 'Submit Acceptance'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAction(null);
                        setSignatureData(null);
                        setSignerName('');
                        setSignerTitle('');
                        setComments('');
                      }}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Reject Form */}
              {action === 'reject' && (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please provide a reason for rejecting this master agreement.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="rejection-reason">
                      Rejection Reason <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="rejection-reason"
                      placeholder="Please explain why you are rejecting this master agreement..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comments">Additional Comments (Optional)</Label>
                    <Textarea
                      id="comments"
                      placeholder="Add any additional comments..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="destructive"
                      onClick={handleSubmit}
                      disabled={!rejectionReason.trim() || submitting}
                      className="flex-1"
                    >
                      {submitting ? 'Submitting...' : 'Submit Rejection'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAction(null);
                        setRejectionReason('');
                        setComments('');
                      }}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
