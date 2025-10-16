import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, User, Briefcase } from "lucide-react";
import { format } from "date-fns";

interface QuoteHeaderInfoProps {
  quote: any;
  legalEntity?: any;
  businessUnit?: any;
  salesOffice?: any;
  salesRep?: any;
  opportunity?: any;
  contactPerson?: any;
}

export const QuoteHeaderInfo: React.FC<QuoteHeaderInfoProps> = ({
  quote,
  legalEntity,
  businessUnit,
  salesOffice,
  salesRep,
  opportunity,
  contactPerson,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Quote Header Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Legal Entity</p>
            <p className="font-medium">{legalEntity?.name || "Not specified"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Business Unit</p>
            <p className="font-medium">{businessUnit?.name || "Not specified"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Quote Entry Date</p>
            <p className="font-medium">
              {quote.quote_entry_date ? format(new Date(quote.quote_entry_date), "MMM d, yyyy") : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Version</p>
            <p className="font-medium">v{quote.version || 1}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Sales Office</p>
            <p className="font-medium">{salesOffice?.name || "Not specified"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sales Representative</p>
            <p className="font-medium">{salesRep?.full_name || "Not specified"}</p>
          </div>
          {opportunity && (
            <div>
              <p className="text-sm text-muted-foreground">Opportunity</p>
              <p className="font-medium">{opportunity.opportunity_no}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {quote.account_name && (
            <div>
              <p className="text-sm text-muted-foreground">Account Name</p>
              <p className="font-medium">{quote.account_name}</p>
            </div>
          )}
          {quote.customer_bill_to && (
            <div>
              <p className="text-sm text-muted-foreground">Bill To</p>
              <p className="font-medium">{quote.customer_bill_to}</p>
            </div>
          )}
          {contactPerson && (
            <div>
              <p className="text-sm text-muted-foreground">Contact Person</p>
              <p className="font-medium">{contactPerson.full_name}</p>
            </div>
          )}
          {quote.project && (
            <div>
              <p className="text-sm text-muted-foreground">Project</p>
              <p className="font-medium">{quote.project}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
