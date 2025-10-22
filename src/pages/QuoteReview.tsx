import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { EnhancedSignaturePad } from '@/components/agreements/shared/EnhancedSignaturePad';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDateForDisplay } from '@/lib/utils/dateUtils';
import { CheckCircle2, XCircle, AlertTriangle, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';
import autostradLogo from '@/assets/autostrad-logo.png';

interface QuoteData {
  id: string;
  quote_number: string;
  quote_date: string;
  valid_until: string;
  public_token_expires_at: string;
  customer_acceptance_status: string | null;
  account_name: string;
  customer_bill_to: string | null;
  quote_type: string;
  billing_plan: string;
  duration_days: number;
  currency: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes: string | null;
  payment_terms: string | null;
  quote_items: any[];
  customer_rejection_reason: string | null;
  customer_signed_at: string | null;
}

export default function QuoteReview() {
  const { token } = useParams<{ token: string }>();
  
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [action, setAction] = useState<'accept' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [signatureData, setSignatureData] = useState<{ dataUrl: string; signerName: string } | null>(null);
  const [signerName, setSignerName] = useState('');

  useEffect(() => {
    fetchQuoteData();
  }, [token]);

  const fetchQuoteData = async () => {
    if (!token) {
      setError('Invalid quote link. No token provided.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://tbmcmbldoaespjlhpfys.supabase.co/functions/v1/get-public-quote?token=${token}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load quote');
      }

      const data = await response.json();
      setQuote(data.quote);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching quote:', err);
      setError(err.message || 'Failed to load quote. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!quote || !token) return;

    // Validation
    if (action === 'accept' && !signatureData) {
      toast.error('Please provide your signature to accept the quote');
      return;
    }

    if (action === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejecting the quote');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(
        'https://tbmcmbldoaespjlhpfys.supabase.co/functions/v1/customer-quote-action',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            action,
            reason_or_notes: rejectionReason,
            signature_data: signatureData?.dataUrl || null,
            signer_name: signatureData?.signerName || null,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit response');
      }

      const result = await response.json();
      toast.success(result.message || 'Your response has been recorded successfully');
      
      // Refresh quote data to show updated status
      await fetchQuoteData();
      setAction(null);
      setRejectionReason('');
      setSignatureData(null);
      setSignerName('');
    } catch (err: any) {
      console.error('Error submitting response:', err);
      toast.error(err.message || 'Failed to submit your response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotals = () => {
    if (!quote) return { deposit: 0, subtotal: 0, vat: 0, grandTotal: 0 };
    
    const deposit = quote.quote_items?.reduce((sum, item) => {
      return sum + ((item.deposit_amount || 0) * (item.quantity || 1));
    }, 0) || 0;

    return {
      deposit,
      subtotal: quote.subtotal || 0,
      vat: quote.tax_amount || 0,
      grandTotal: quote.total_amount || 0,
    };
  };

  const isTokenExpired = () => {
    if (!quote?.public_token_expires_at) return false;
    return new Date(quote.public_token_expires_at) < new Date();
  };

  const hasAlreadyResponded = () => {
    return quote?.customer_acceptance_status === 'accepted' || 
           quote?.customer_acceptance_status === 'rejected';
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

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-8">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-6 w-6" />
              <CardTitle>Quote Not Found</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {error || 'We could not find the quote you are looking for.'}
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
  const firstLine = quote.quote_items?.[0];
  const durationMonths = firstLine?.duration_months || Math.floor((quote.duration_days || 0) / 30);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <img src={autostradLogo} alt="Autostrad" className="h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground">Quote Review</h1>
          <p className="text-muted-foreground mt-2">Please review the quote details below</p>
        </div>

        {/* Status Alert */}
        {alreadyResponded && (
          <Alert className={quote.customer_acceptance_status === 'accepted' ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-red-500 bg-red-50 dark:bg-red-950'}>
            {quote.customer_acceptance_status === 'accepted' ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              <span className="font-semibold">
                Quote {quote.customer_acceptance_status === 'accepted' ? 'Accepted' : 'Rejected'}
              </span>
              {quote.customer_signed_at && (
                <span className="block text-sm mt-1">
                  on {formatDateForDisplay(new Date(quote.customer_signed_at))}
                </span>
              )}
              {quote.customer_acceptance_status === 'rejected' && quote.customer_rejection_reason && (
                <span className="block text-sm mt-2">
                  Reason: {quote.customer_rejection_reason}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {tokenExpired && (
          <Alert variant="destructive">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <span className="font-semibold">This quote link has expired.</span>
              <span className="block text-sm mt-1">
                Please contact Autostrad for an updated quote.
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Quote Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Quote Details</CardTitle>
            </div>
            <CardDescription>Quote #{quote.quote_number}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Customer:</span>
                <p className="font-semibold">{quote.account_name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Quote Date:</span>
                <p className="font-semibold">{formatDateForDisplay(new Date(quote.quote_date))}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Valid Until:</span>
                <p className="font-semibold">{formatDateForDisplay(new Date(quote.valid_until))}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Quote Type:</span>
                <p className="font-semibold capitalize">{quote.quote_type || 'Standard'}</p>
              </div>
              {durationMonths > 0 && (
                <div>
                  <span className="text-muted-foreground">Contract Duration:</span>
                  <p className="font-semibold">{durationMonths} months</p>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Billing Plan:</span>
                <p className="font-semibold capitalize">{quote.billing_plan || 'Monthly'}</p>
              </div>
            </div>

            {/* Vehicle Items */}
            {quote.quote_items && quote.quote_items.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Vehicle Details</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3 text-left">Vehicle</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Monthly Rate</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quote.quote_items.map((item: any, idx: number) => {
                        const vehicleName = item._vehicleMeta?.make && item._vehicleMeta?.model 
                          ? `${item._vehicleMeta.make} ${item._vehicleMeta.model}`
                          : item.vehicle_name || item.vehicle_class_name || 'Vehicle';
                        const quantity = item.quantity || 1;
                        const monthlyRate = item.monthly_rate || 0;
                        const lineTotal = monthlyRate * quantity * (durationMonths || 1);

                        return (
                          <tr key={idx} className="border-t">
                            <td className="p-3">
                              <div className="font-medium">{vehicleName}</div>
                              {item._vehicleMeta?.year && (
                                <div className="text-xs text-muted-foreground">{item._vehicleMeta.year}</div>
                              )}
                            </td>
                            <td className="p-3 text-center">{quantity}</td>
                            <td className="p-3 text-right font-mono">
                              {formatCurrency(monthlyRate, quote.currency || 'AED')}
                            </td>
                            <td className="p-3 text-right font-mono font-semibold">
                              {formatCurrency(lineTotal, quote.currency || 'AED')}
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
                {totals.deposit > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Security Deposit:</span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(totals.deposit, quote.currency || 'AED')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-mono">
                    {formatCurrency(totals.subtotal, quote.currency || 'AED')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT:</span>
                  <span className="font-mono">
                    {formatCurrency(totals.vat, quote.currency || 'AED')}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-bold">Grand Total:</span>
                  <span className="font-mono font-bold text-lg text-primary">
                    {formatCurrency(totals.grandTotal, quote.currency || 'AED')}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            {quote.notes && (
              <div>
                <h4 className="font-semibold mb-2">Additional Notes</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded">
                  {quote.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Section */}
        {!alreadyResponded && !tokenExpired && (
          <Card>
            <CardHeader>
              <CardTitle>Your Response</CardTitle>
              <CardDescription>Please accept or reject this quote</CardDescription>
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
                    Accept Quote
                  </Button>
                  <Button
                    size="lg"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => setAction('reject')}
                  >
                    <XCircle className="mr-2 h-5 w-5" />
                    Reject Quote
                  </Button>
                </div>
              )}

              {/* Accept Form */}
              {action === 'accept' && (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      By signing below, you confirm your acceptance of this quote and its terms.
                    </AlertDescription>
                  </Alert>
                  
                  <EnhancedSignaturePad
                    title="Customer Signature"
                    signerName={signerName}
                    onSave={(dataUrl, name) => {
                      setSignatureData({ dataUrl, signerName: name });
                      setSignerName(name);
                    }}
                    disabled={submitting}
                  />

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
                      Please provide a reason for rejecting this quote.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Rejection Reason <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      placeholder="Please explain why you are rejecting this quote..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={4}
                      disabled={submitting}
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

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-6 border-t">
          <p>Autostrad Rent a Car LLC | Dubai, UAE</p>
          <p className="mt-1">For assistance, please contact us at info@autostrad.ae</p>
        </div>
      </div>
    </div>
  );
}
