import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Truck, MapPin, Calendar, DollarSign, User, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  useVehicleMovement, 
  useApproveMovement, 
  useRejectMovement, 
  useCompleteMovement,
  useSubmitMovement
} from "@/hooks/useVehicleMovements";
import { ApprovalStatus, MovementType } from "@/lib/api/fleet-operations";
import { format } from "date-fns";
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function MovementDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: movement, isLoading } = useVehicleMovement(id);
  
  const approveMutation = useApproveMovement();
  const rejectMutation = useRejectMovement();
  const completeMutation = useCompleteMovement();
  const submitMutation = useSubmitMovement();
  
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const getStatusBadge = (status: ApprovalStatus) => {
    const variants: Record<ApprovalStatus, { variant: any; label: string; icon: any }> = {
      pending: { variant: "secondary", label: "Pending Approval", icon: Clock },
      approved: { variant: "default", label: "Approved", icon: CheckCircle },
      rejected: { variant: "destructive", label: "Rejected", icon: XCircle },
    };
    const config = variants[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1.5 w-fit">
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: MovementType) => {
    const labels: Record<MovementType, string> = {
      ownership_transfer: "Ownership Transfer",
      inter_branch: "Inter-Branch",
      department_reallocation: "Dept. Reallocation",
      third_party: "Third Party",
    };
    return <Badge variant="outline">{labels[type]}</Badge>;
  };

  const handleApprove = async () => {
    if (!id) return;
    await approveMutation.mutateAsync(id);
  };

  const handleReject = async () => {
    if (!id || !rejectionReason.trim()) return;
    await rejectMutation.mutateAsync({ id, reason: rejectionReason });
    setRejectDialogOpen(false);
    setRejectionReason("");
  };

  const handleComplete = async () => {
    if (!id) return;
    await completeMutation.mutateAsync(id);
  };

  const handleSubmit = async () => {
    if (!id) return;
    await submitMutation.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!movement) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Movement Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested movement could not be found.</p>
          <Button onClick={() => navigate("/operations/fleet")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Fleet Operations
          </Button>
        </div>
      </div>
    );
  }

  const canApprove = movement.status === 'pending' && movement.submitted_at;
  const canComplete = movement.status === 'approved' && !movement.completed_at;
  const canSubmit = movement.status === 'pending' && !movement.submitted_at;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/operations/fleet")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{movement.movement_no}</h1>
              {getStatusBadge(movement.status)}
              {getTypeBadge(movement.movement_type)}
            </div>
            <p className="text-muted-foreground mt-1">
              Vehicle Movement Details
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          {canSubmit && (
            <Button 
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Submit for Approval
            </Button>
          )}
          {canApprove && (
            <>
              <Button 
                variant="default"
                onClick={handleApprove}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Approve
              </Button>
              <Button 
                variant="destructive"
                onClick={() => setRejectDialogOpen(true)}
                disabled={rejectMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </>
          )}
          {canComplete && (
            <Button 
              onClick={handleComplete}
              disabled={completeMutation.isPending}
            >
              {completeMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Mark as Completed
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Movement Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Movement Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Movement Number</Label>
              <p className="font-medium">{movement.movement_no}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Type</Label>
              <div className="mt-1">{getTypeBadge(movement.movement_type)}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Reason</Label>
              <p className="font-medium">{movement.reason_code}</p>
              {movement.reason_description && (
                <p className="text-sm text-muted-foreground mt-1">{movement.reason_description}</p>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground">Vehicles</Label>
              <p className="font-medium">{movement.vehicle_ids?.length || 0} vehicle(s)</p>
            </div>
          </CardContent>
        </Card>

        {/* Location Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location & Transfer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">From</Label>
              <p className="font-medium">
                {movement.from_branch_id || movement.from_owner || movement.from_department || "—"}
              </p>
              {movement.from_cost_center && (
                <p className="text-sm text-muted-foreground">Cost Center: {movement.from_cost_center}</p>
              )}
            </div>
            <Separator />
            <div>
              <Label className="text-muted-foreground">To</Label>
              <p className="font-medium">
                {movement.to_branch_id || movement.to_owner || movement.to_department || "—"}
              </p>
              {movement.to_cost_center && (
                <p className="text-sm text-muted-foreground">Cost Center: {movement.to_cost_center}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Effective From</Label>
              <p className="font-medium">
                {movement.effective_from ? format(new Date(movement.effective_from), "PPP") : "—"}
              </p>
            </div>
            {movement.expected_arrival && (
              <div>
                <Label className="text-muted-foreground">Expected Arrival</Label>
                <p className="font-medium">
                  {format(new Date(movement.expected_arrival), "PPP")}
                </p>
              </div>
            )}
            {movement.actual_arrival && (
              <div>
                <Label className="text-muted-foreground">Actual Arrival</Label>
                <p className="font-medium">
                  {format(new Date(movement.actual_arrival), "PPP")}
                </p>
              </div>
            )}
            {movement.completed_at && (
              <div>
                <Label className="text-muted-foreground">Completed</Label>
                <p className="font-medium">
                  {format(new Date(movement.completed_at), "PPP")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transport Details */}
        {(movement.transport_job_ref || movement.carrier_vendor || movement.tracking_ref) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Transport Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {movement.transport_job_ref && (
                <div>
                  <Label className="text-muted-foreground">Job Reference</Label>
                  <p className="font-medium">{movement.transport_job_ref}</p>
                </div>
              )}
              {movement.carrier_vendor && (
                <div>
                  <Label className="text-muted-foreground">Carrier</Label>
                  <p className="font-medium">{movement.carrier_vendor}</p>
                </div>
              )}
              {movement.tracking_ref && (
                <div>
                  <Label className="text-muted-foreground">Tracking Reference</Label>
                  <p className="font-medium">{movement.tracking_ref}</p>
                </div>
              )}
              {movement.odometer_at_dispatch && (
                <div>
                  <Label className="text-muted-foreground">Odometer at Dispatch</Label>
                  <p className="font-medium">{movement.odometer_at_dispatch.toLocaleString()} km</p>
                </div>
              )}
              {movement.fuel_level_at_dispatch && (
                <div>
                  <Label className="text-muted-foreground">Fuel Level at Dispatch</Label>
                  <p className="font-medium">{movement.fuel_level_at_dispatch}%</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Financial Details */}
        {(movement.transfer_price || movement.requires_finance_approval) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {movement.transfer_price && (
                <div>
                  <Label className="text-muted-foreground">Transfer Price</Label>
                  <p className="font-medium">${movement.transfer_price.toLocaleString()}</p>
                </div>
              )}
              {movement.requires_finance_approval && (
                <div>
                  <Badge variant="outline">Requires Finance Approval</Badge>
                </div>
              )}
              {movement.cost_center_change && (
                <div>
                  <Badge variant="outline">Cost Center Change</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Approval History */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Approval History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {movement.created_at && (
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <p className="font-medium text-sm">
                    {format(new Date(movement.created_at), "PPp")}
                  </p>
                  {movement.created_by && (
                    <p className="text-xs text-muted-foreground">by {movement.created_by}</p>
                  )}
                </div>
              )}
              {movement.submitted_at && (
                <div>
                  <Label className="text-muted-foreground">Submitted</Label>
                  <p className="font-medium text-sm">
                    {format(new Date(movement.submitted_at), "PPp")}
                  </p>
                  {movement.submitted_by && (
                    <p className="text-xs text-muted-foreground">by {movement.submitted_by}</p>
                  )}
                </div>
              )}
              {movement.approved_at && (
                <div>
                  <Label className="text-muted-foreground">Approved</Label>
                  <p className="font-medium text-sm">
                    {format(new Date(movement.approved_at), "PPp")}
                  </p>
                  {movement.approved_by && (
                    <p className="text-xs text-muted-foreground">by {movement.approved_by}</p>
                  )}
                </div>
              )}
              {movement.rejected_at && (
                <div>
                  <Label className="text-muted-foreground">Rejected</Label>
                  <p className="font-medium text-sm">
                    {format(new Date(movement.rejected_at), "PPp")}
                  </p>
                  {movement.rejected_by && (
                    <p className="text-xs text-muted-foreground">by {movement.rejected_by}</p>
                  )}
                </div>
              )}
            </div>
            {movement.rejection_reason && (
              <div className="mt-4 p-4 bg-destructive/10 rounded-lg">
                <Label className="text-destructive font-medium">Rejection Reason</Label>
                <p className="text-sm mt-1">{movement.rejection_reason}</p>
              </div>
            )}
            {movement.handover_notes && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <Label className="font-medium">Handover Notes</Label>
                <p className="text-sm mt-1">{movement.handover_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Movement</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this movement request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectionReason.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Reject Movement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
