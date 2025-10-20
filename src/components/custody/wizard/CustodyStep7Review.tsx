import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import type { CustodyTransactionCreate } from "@/lib/api/custody";

interface CustodyStep7Props {
  formData: Partial<CustodyTransactionCreate>;
  updateFormData: (data: Partial<CustodyTransactionCreate>) => void;
  documentIds?: string[];
}

export function CustodyStep7Review({ formData, documentIds }: CustodyStep7Props) {
  const isComplete =
    formData.customer_id &&
    formData.custodian_name &&
    formData.reason_code &&
    formData.incident_date &&
    formData.effective_from;

  const formatDate = (date?: string) => {
    if (!date) return "Not set";
    return format(new Date(date), "MMM dd, yyyy HH:mm");
  };

  return (
    <div className="space-y-6">
      {/* Validation Status */}
      {isComplete ? (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            All required fields are complete. Ready to submit for approval.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Missing required fields. Please complete all mandatory information before
            submitting.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Agreement & Customer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agreement & Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer:</span>
              <span className="font-medium">{formData.customer_id || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Agreement:</span>
              <span className="font-medium">{formData.agreement_id || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Branch:</span>
              <span className="font-medium">{formData.branch_id || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Original Vehicle:</span>
              <span className="font-medium">{formData.original_vehicle_id || "—"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Custody Reason */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Custody Reason</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reason:</span>
              <Badge variant="outline" className="capitalize">
                {formData.reason_code?.replace(/_/g, " ") || "—"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Incident Date:</span>
              <span className="font-medium">{formatDate(formData.incident_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Effective From:</span>
              <span className="font-medium">{formatDate(formData.effective_from)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expected Return:</span>
              <span className="font-medium">
                {formatDate(formData.expected_return_date)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Custodian */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Custodian</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <Badge variant="secondary" className="capitalize">
                {formData.custodian_type?.replace(/_/g, " ") || "—"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{formData.custodian_name || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contact:</span>
              <span className="font-medium">
                {formData.custodian_contact?.person || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium">
                {formData.custodian_contact?.phone || "—"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Replacement Vehicle */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Replacement Vehicle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Provide Replacement:</span>
              <Badge variant={formData.until_original_ready ? "default" : "secondary"}>
                {formData.until_original_ready ? "Yes" : "No"}
              </Badge>
            </div>
            {formData.until_original_ready && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vehicle:</span>
                  <span className="font-medium">
                    {formData.replacement_vehicle_id || "Not assigned"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate Policy:</span>
                  <Badge variant="outline" className="capitalize">
                    {formData.rate_policy?.replace(/_/g, " ") || "—"}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Financial */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Financial Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deposit Carryover:</span>
                <Badge variant={formData.deposit_carryover ? "default" : "secondary"}>
                  {formData.deposit_carryover ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Damage Pre-auth:</span>
                <span className="font-medium">
                  {formData.damage_preauth_hold
                    ? `AED ${formData.damage_preauth_hold}`
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Special Rate Code:</span>
                <span className="font-medium">{formData.special_rate_code || "—"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Documents uploaded:</span>
              <Badge variant="secondary">{documentIds?.length || 0}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {formData.notes && (
        <>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">Additional Notes</h4>
            <p className="text-sm text-muted-foreground">{formData.notes}</p>
          </div>
        </>
      )}

      {formData.incident_narrative && (
        <>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">Incident Details</h4>
            <p className="text-sm text-muted-foreground">{formData.incident_narrative}</p>
          </div>
        </>
      )}
    </div>
  );
}
