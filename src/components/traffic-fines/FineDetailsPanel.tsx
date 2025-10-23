import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTrafficFineCorporate } from '@/hooks/useTrafficFinesCorporate';
import { AlertTriangle, Calendar, Clock, FileText, User, Car, Link as LinkIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface FineDetailsPanelProps {
  fineId: string;
  onClose: () => void;
}

const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'paid': return 'default';
    case 'unpaid': return 'destructive';
    case 'disputed': return 'secondary';
    case 'cancelled': return 'outline';
    default: return 'outline';
  }
};

const getEmirateBadgeColor = (emirate: string) => {
  const colors: Record<string, string> = {
    'DXB': 'bg-blue-100 text-blue-800',
    'AUH': 'bg-green-100 text-green-800',
    'SHJ': 'bg-red-100 text-red-800',
    'AJM': 'bg-purple-100 text-purple-800',
    'RAK': 'bg-orange-100 text-orange-800',
    'UAQ': 'bg-teal-100 text-teal-800',
    'FUJ': 'bg-indigo-100 text-indigo-800',
  };
  return colors[emirate] || 'bg-gray-100 text-gray-800';
};

export function FineDetailsPanel({ fineId, onClose }: FineDetailsPanelProps) {
  const { data: fine, isLoading } = useTrafficFineCorporate(fineId);

  if (isLoading) {
    return (
      <Sheet open={true} onOpenChange={onClose}>
        <SheetContent className="w-[600px] overflow-y-auto">
          <SheetHeader>
            <Skeleton className="h-8 w-48" />
          </SheetHeader>
          <div className="space-y-4 mt-6">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!fine) return null;

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-[600px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <SheetTitle>{fine.fine_no}</SheetTitle>
            <Badge className={getEmirateBadgeColor(fine.emirate)} variant="outline">
              {fine.emirate}
            </Badge>
            <Badge variant="secondary">{fine.authority_source}</Badge>
          </div>
          <div className="mt-2">
            <Badge variant={getStatusBadgeVariant(fine.status)} className="capitalize text-base px-3 py-1">
              {fine.status}
            </Badge>
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Violation Details */}
          <div>
            <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Violation Details</h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-lg font-medium mb-2">{fine.violation_description}</p>
              {fine.legal_article && (
                <p className="text-sm text-muted-foreground">Legal Article: {fine.legal_article}</p>
              )}
              {fine.violation_code && (
                <p className="text-sm text-muted-foreground">Violation Code: {fine.violation_code}</p>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Date & Time</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Violation Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(fine.violation_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              {fine.violation_time && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">{fine.violation_time}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Information */}
          <div>
            <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Vehicle Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Car className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Plate Number</p>
                  <p className="text-sm">
                    {fine.plate_code && <span className="font-semibold">{fine.plate_code} </span>}
                    {fine.plate_number}
                  </p>
                </div>
              </div>
              {fine.vin && (
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">VIN</p>
                    <p className="text-sm text-muted-foreground">{fine.vin}</p>
                  </div>
                </div>
              )}
              {fine.vehicle && (
                <div className="flex items-center gap-3">
                  <Car className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Vehicle</p>
                    <p className="text-sm">
                      {fine.vehicle.make} {fine.vehicle.model} ({fine.vehicle.license_plate})
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Fine Information */}
          <div>
            <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Fine Information</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Fine Amount</span>
                <span className="text-lg font-bold">AED {fine.amount.toLocaleString()}</span>
              </div>
              {fine.penalty_amount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Penalty Amount</span>
                  <span className="text-lg font-bold text-red-600">AED {fine.penalty_amount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Total Amount</span>
                <span className="text-xl font-bold">AED {fine.total_amount.toLocaleString()}</span>
              </div>
              {fine.confiscation_days > 0 && (
                <div className="flex items-center justify-between bg-red-50 p-3 rounded-lg">
                  <span className="text-sm font-medium">Confiscation Period</span>
                  <Badge variant="destructive" className="text-base">
                    {fine.confiscation_days} days
                  </Badge>
                </div>
              )}
              {fine.black_points > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Black Points</span>
                  <Badge variant="secondary">{fine.black_points} points</Badge>
                </div>
              )}
              {fine.due_date && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Due Date</span>
                  <span className="text-sm font-medium">
                    {format(new Date(fine.due_date), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
              {fine.paid_date && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Paid Date</span>
                  <span className="text-sm font-medium text-green-600">
                    {format(new Date(fine.paid_date), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
              {fine.payment_reference && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Payment Reference</span>
                  <span className="text-sm font-mono">{fine.payment_reference}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Contract Linkage */}
          <div>
            <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Contract Linkage</h3>
            {fine.contract_id ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <LinkIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Contract No</p>
                    <p className="text-sm text-primary cursor-pointer hover:underline">
                      {fine.contract?.agreement_no || 'N/A'}
                    </p>
                  </div>
                </div>
                {fine.customer && (
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Customer</p>
                      <p className="text-sm text-primary cursor-pointer hover:underline">
                        {fine.customer.full_name}
                      </p>
                    </div>
                  </div>
                )}
                {fine.driver && (
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Driver</p>
                      <p className="text-sm text-primary cursor-pointer hover:underline">
                        {fine.driver.full_name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <p className="text-sm font-medium">This fine is not linked to a contract</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Manual linkage may be required
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          {fine.notes && (
            <div>
              <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Notes</h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap">{fine.notes}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-4">
            <Button variant="outline" className="w-full" disabled>
              Mark as Disputed (Demo)
            </Button>
            <Button variant="outline" className="w-full" disabled>
              Link to Contract (Demo)
            </Button>
            <Button variant="outline" className="w-full" disabled>
              Add Note (Demo)
            </Button>
            <Button variant="default" className="w-full" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
