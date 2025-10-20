import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building } from "lucide-react";
import { format } from "date-fns";
import { 
  getBillingDayLabel, 
  getLineItemGranularityLabel, 
  getBillingStartTriggerLabel 
} from "@/lib/constants/billingOptions";

interface MasterAgreementHeaderInfoProps {
  agreement: any;
  legalEntity?: any;
  customer?: any;
  billToSite?: any;
}

export const MasterAgreementHeaderInfo: React.FC<MasterAgreementHeaderInfoProps> = ({
  agreement,
  legalEntity,
  customer,
  billToSite,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Agreement Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Agreement Number</p>
            <p className="font-medium">{agreement.agreement_no || "Pending"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Legal Entity</p>
            <p className="font-medium">{legalEntity?.name || "Not specified"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Customer</p>
            <p className="font-medium">{customer?.full_name || "Unknown"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Credit Terms</p>
            <p className="font-medium">{agreement.credit_terms || "N/A"}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Framework Model</p>
            <p className="font-medium">{agreement.framework_model || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Master Term</p>
            <p className="font-medium">{agreement.master_term || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Billing Cycle</p>
            <p className="font-medium">{agreement.billing_cycle || "Monthly"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Invoice Format</p>
            <p className="font-medium">{agreement.invoice_format || "N/A"}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Contract Start</p>
            <p className="font-medium">
              {agreement.contract_start_date ? format(new Date(agreement.contract_start_date), "MMM d, yyyy") : "Not set"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Contract End</p>
            <p className="font-medium">
              {agreement.contract_end_date ? format(new Date(agreement.contract_end_date), "MMM d, yyyy") : "Not set"}
            </p>
          </div>
          {billToSite && (
            <div>
              <p className="text-sm text-muted-foreground">Bill To</p>
              <p className="font-medium">{billToSite.site_name}</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardHeader className="border-t pt-4">
        <CardTitle className="text-base">Billing Configuration</CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-3 gap-6">
        <div>
          <p className="text-sm text-muted-foreground">Billing Day</p>
          <p className="font-medium">{getBillingDayLabel(agreement.billing_day)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Invoice Granularity</p>
          <p className="font-medium">{getLineItemGranularityLabel(agreement.line_item_granularity)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Billing Start Trigger</p>
          <p className="font-medium">{getBillingStartTriggerLabel(agreement.billing_start_trigger)}</p>
        </div>
      </CardContent>
    </Card>
  );
};
