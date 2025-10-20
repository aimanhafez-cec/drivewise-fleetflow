import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { custodyApi } from "@/lib/api/custody";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  StatusBadge,
  CustodyTimeline,
  VehicleCard,
  ChargeTable,
  ApprovalStepper,
  AuditLogViewer,
  SLAIndicator,
} from "@/components/custody";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CustodyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: custody, isLoading } = useQuery({
    queryKey: ["custody", id],
    queryFn: () => custodyApi.getCustodyTransaction(id!),
    enabled: !!id,
  });

  const { data: documents } = useQuery({
    queryKey: ["custody-documents", id],
    queryFn: () => custodyApi.getDocuments(id!),
    enabled: !!id,
  });

  const { data: charges } = useQuery({
    queryKey: ["custody-charges", id],
    queryFn: () => custodyApi.getCharges(id!),
    enabled: !!id,
  });

  const { data: approvals } = useQuery({
    queryKey: ["custody-approvals", id],
    queryFn: () => custodyApi.getApprovalMatrix(id!),
    enabled: !!id,
  });

  const { data: auditLog } = useQuery({
    queryKey: ["custody-audit", id],
    queryFn: () => custodyApi.getAuditLog(id!),
    enabled: !!id,
  });

  const approveMutation = useMutation({
    mutationFn: ({ userId, notes }: { userId: string; notes: string }) =>
      custodyApi.approveCustody(id!, userId, notes),
    onSuccess: () => {
      toast({ title: "Custody approved successfully" });
      queryClient.invalidateQueries({ queryKey: ["custody", id] });
    },
    onError: () => {
      toast({ title: "Failed to approve custody", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      custodyApi.rejectCustody(id!, userId, reason),
    onSuccess: () => {
      toast({ title: "Custody rejected" });
      queryClient.invalidateQueries({ queryKey: ["custody", id] });
    },
    onError: () => {
      toast({ title: "Failed to reject custody", variant: "destructive" });
    },
  });

  const voidMutation = useMutation({
    mutationFn: ({ reason, userId }: { reason: string; userId: string }) => 
      custodyApi.voidCustody(id!, reason, userId),
    onSuccess: () => {
      toast({ title: "Custody voided" });
      queryClient.invalidateQueries({ queryKey: ["custody", id] });
    },
    onError: () => {
      toast({ title: "Failed to void custody", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!custody) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Custody transaction not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/custody")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{custody.custody_no}</h1>
            <p className="text-muted-foreground">
              Custody Transaction Details
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={custody.status} />
          {custody.status === "pending_approval" && (
            <>
              <Button
                variant="default"
                onClick={() => approveMutation.mutate({ userId: "current-user-id", notes: "" })}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => rejectMutation.mutate({ userId: "current-user-id", reason: "" })}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </>
          )}
          {custody.status === "draft" && (
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {["draft", "pending_approval"].includes(custody.status) && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Void
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Void Custody Transaction?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The custody transaction will be marked as void.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => voidMutation.mutate({ reason: "Voided by user", userId: "current-user-id" })}>
                    Void Transaction
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* SLA Indicator */}
      {custody.sla_target_approve_by && (
        <SLAIndicator
          targetTime={custody.sla_target_approve_by}
          label="Approval SLA"
          breached={custody.sla_breached || false}
        />
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="charges">Charges</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Custody No:</span>
                  <span className="font-medium">{custody.custody_no}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Agreement:</span>
                  <span className="font-medium">{custody.agreement_id || "N/A"}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reason:</span>
                  <span className="font-medium">{custody.reason_code}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Custodian Type:</span>
                  <span className="font-medium">{custody.custodian_type}</span>
                </div>
                {custody.custodian_name && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Custodian:</span>
                      <span className="font-medium">{custody.custodian_name}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dates & Duration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Effective From:</span>
                  <span className="font-medium">
                    {new Date(custody.effective_from).toLocaleDateString()}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Return:</span>
                  <span className="font-medium">
                    {new Date(custody.expected_return_date).toLocaleDateString()}
                  </span>
                </div>
                {custody.actual_return_date && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Actual Return:</span>
                      <span className="font-medium">
                        {new Date(custody.actual_return_date).toLocaleDateString()}
                      </span>
                    </div>
                  </>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">
                    {Math.ceil(
                      (new Date(custody.expected_return_date).getTime() -
                        new Date(custody.effective_from).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rate Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Policy:</span>
                  <span className="font-medium capitalize">{custody.rate_policy}</span>
                </div>
                {custody.special_rate_code && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Special Rate Code:</span>
                      <span className="font-medium">{custody.special_rate_code}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {custody.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{custody.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Custody Timeline</CardTitle>
              <CardDescription>
                Track the lifecycle of this custody transaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustodyTimeline custody={custody} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
              <CardDescription>Details about vehicles involved in custody</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {custody.original_vehicle_id && (
                <div>
                  <h4 className="font-semibold mb-2">Original Vehicle</h4>
                  <p className="text-sm text-muted-foreground">ID: {custody.original_vehicle_id}</p>
                </div>
              )}
              {custody.replacement_vehicle_id && (
                <div>
                  <h4 className="font-semibold mb-2">Replacement Vehicle</h4>
                  <p className="text-sm text-muted-foreground">ID: {custody.replacement_vehicle_id}</p>
                </div>
              )}
              {!custody.original_vehicle_id && !custody.replacement_vehicle_id && (
                <p className="text-muted-foreground text-center py-8">
                  No vehicle information available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                All documents related to this custody transaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documents && documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{doc.document_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.document_category}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No documents uploaded yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Charges Tab */}
        <TabsContent value="charges">
          <Card>
            <CardHeader>
              <CardTitle>Charges</CardTitle>
              <CardDescription>
                Financial charges associated with this custody
              </CardDescription>
            </CardHeader>
            <CardContent>
              {charges && charges.length > 0 ? (
                <ChargeTable 
                  charges={charges} 
                  onChargesChange={() => {}}
                  canEdit={false}
                  canPost={false}
                />
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No charges recorded
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>Approval Workflow</CardTitle>
              <CardDescription>
                Track approval progress and decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approvals && approvals.length > 0 ? (
                <ApprovalStepper
                  approvals={approvals.map((a, index) => ({
                    id: `approval-${index}`,
                    custody_id: id!,
                    approval_level: a.approval_level,
                    approver_role: a.approver_role,
                    approver_user_id: a.approver_user_id,
                    required: a.required,
                    status: a.status,
                    decision_timestamp: undefined,
                    decision_notes: undefined,
                    due_by: undefined,
                    created_at: new Date().toISOString(),
                  }))}
                  currentUserCanApprove={custody.status === "pending_approval"}
                  onApprove={(approvalId, notes) => {
                    approveMutation.mutate({ userId: "current-user-id", notes });
                  }}
                  onReject={(approvalId, notes) => {
                    rejectMutation.mutate({ userId: "current-user-id", reason: notes });
                  }}
                />
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No approvals required or initiated
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>
                Complete history of changes and actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditLog ? (
                <AuditLogViewer logs={auditLog} />
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No audit log entries
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
