import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock, User, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { ApprovalStatus } from '@/lib/api/custody';

interface ApprovalStepperProps {
  approvals: Array<{
    id: string;
    approval_level: number;
    approver_role: string;
    approver_user_id?: string;
    status: ApprovalStatus;
    decision_timestamp?: string;
    decision_notes?: string;
    due_by?: string;
  }>;
  currentUserCanApprove?: boolean;
  onApprove?: (approvalId: string, notes: string) => void;
  onReject?: (approvalId: string, reason: string) => void;
}

export function ApprovalStepper({
  approvals,
  currentUserCanApprove = false,
  onApprove,
  onReject,
}: ApprovalStepperProps) {
  const [activeApproval, setActiveApproval] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const getStatusIcon = (status: ApprovalStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-6 w-6 text-red-600" />;
      case 'escalated':
        return <AlertCircle className="h-6 w-6 text-orange-600" />;
      default:
        return <Clock className="h-6 w-6 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    const config = {
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Approved', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
      escalated: { label: 'Escalated', className: 'bg-orange-100 text-orange-800' },
    };

    const { label, className } = config[status];
    return <Badge className={className}>{label}</Badge>;
  };

  const isOverdue = (dueBy?: string) => {
    if (!dueBy) return false;
    return new Date(dueBy) < new Date();
  };

  return (
    <div className="space-y-4">
      {approvals.map((approval, index) => {
        const isActive = activeApproval === approval.id;
        const overdue = approval.status === 'pending' && isOverdue(approval.due_by);

        return (
          <Card key={approval.id} className={overdue ? 'border-red-300' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Step Indicator */}
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    {getStatusIcon(approval.status)}
                  </div>
                  {index < approvals.length - 1 && (
                    <div className="mt-2 h-12 w-0.5 bg-muted" />
                  )}
                </div>

                {/* Approval Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">
                        Level {approval.approval_level} Approval
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {approval.approver_role.replace(/_/g, ' ').toUpperCase()}
                      </p>
                    </div>
                    {getStatusBadge(approval.status)}
                  </div>

                  {/* Approver Info */}
                  {approval.approver_user_id && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        User ID: {approval.approver_user_id}
                      </span>
                    </div>
                  )}

                  {/* Due Date */}
                  {approval.status === 'pending' && approval.due_by && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span
                        className={
                          overdue ? 'font-medium text-red-600' : 'text-muted-foreground'
                        }
                      >
                        {overdue ? 'Overdue: ' : 'Due by: '}
                        {format(new Date(approval.due_by), 'PPp')}
                      </span>
                    </div>
                  )}

                  {/* Decision Info */}
                  {approval.decision_timestamp && (
                    <div className="rounded-md bg-muted p-3 text-sm">
                      <p className="mb-1 text-muted-foreground">
                        Decided on {format(new Date(approval.decision_timestamp), 'PPp')}
                      </p>
                      {approval.decision_notes && (
                        <p className="text-foreground">{approval.decision_notes}</p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  {currentUserCanApprove &&
                    approval.status === 'pending' &&
                    !isActive && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveApproval(approval.id)}
                        >
                          Take Action
                        </Button>
                      </div>
                    )}

                  {/* Action Form */}
                  {isActive && (
                    <div className="space-y-3 rounded-md border p-3">
                      <Textarea
                        placeholder="Add notes (optional)..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            onApprove?.(approval.id, notes);
                            setActiveApproval(null);
                            setNotes('');
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (notes.trim()) {
                              onReject?.(approval.id, notes);
                              setActiveApproval(null);
                              setNotes('');
                            } else {
                              alert('Please provide a reason for rejection');
                            }
                          }}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setActiveApproval(null);
                            setNotes('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
