import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useOpportunityPackages } from "@/hooks/useQuoteLOVs";
import { Loader2 } from "lucide-react";

interface OpportunityViewDialogProps {
  opportunityId?: string;
  opportunityNo?: string;
  notesAssumptions?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OpportunityViewDialog: React.FC<OpportunityViewDialogProps> = ({
  opportunityId,
  opportunityNo,
  notesAssumptions,
  open,
  onOpenChange,
}) => {
  const { data: packages = [], isLoading } = useOpportunityPackages(opportunityId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Opportunity Details - {opportunityNo}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Requested Packages Section */}
          <div>
            <h4 className="font-semibold mb-2">Requested Packages:</h4>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : packages.length > 0 ? (
              <ul className="space-y-2">
                {packages.map((pkg) => (
                  <li key={pkg.id} className="text-sm">
                    <span className="font-medium">{pkg.package_name}</span>
                    {" - "}
                    <span>qty {pkg.qty} {pkg.uom}</span>
                    {pkg.description && (
                      <div className="text-muted-foreground ml-4">{pkg.description}</div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No packages defined</p>
            )}
          </div>

          {/* Notes/Assumptions Section */}
          {notesAssumptions && (
            <div>
              <h4 className="font-semibold mb-2">Notes/Assumptions:</h4>
              <p className="text-sm whitespace-pre-wrap">{notesAssumptions}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
