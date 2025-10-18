import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/currency";

interface QuoteMaintenanceDetailsProps {
  quote: any;
}

export const QuoteMaintenanceDetails: React.FC<QuoteMaintenanceDetailsProps> = ({ quote }) => {
  const getPackageLabel = (pkg: string) => {
    const labels: Record<string, string> = {
      none: "Not Included",
      basic: "Basic Maintenance",
      standard: "Standard Maintenance",
      comprehensive: "Comprehensive Maintenance",
      full: "Full Maintenance & Wear",
    };
    return labels[pkg] || pkg;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Maintenance & Services
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Maintenance Status</p>
              <div className="flex items-center gap-2 mt-1">
                {quote.maintenance_included ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">
                  {quote.maintenance_included ? "Included" : "Not Included"}
                </span>
              </div>
            </div>

            {quote.maintenance_included && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Package Type</p>
                  <Badge variant="secondary" className="mt-1">
                    {getPackageLabel(quote.maintenance_package_type || "standard")}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Cost (per vehicle)</p>
                  <p className="font-medium">
                    {formatCurrency(
                      quote.monthly_maintenance_cost_per_vehicle || 250,
                      quote.currency || "AED"
                    )}
                  </p>
                </div>
              </>
            )}
          </div>

          {quote.maintenance_included && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Plan Source</p>
                <p className="font-medium">
                  {quote.maintenance_plan_source === "internal" ? "Internal" : "External Provider"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Billing Display</p>
                <p className="font-medium">
                  {quote.show_maintenance_separate_line
                    ? "Separate Line Item"
                    : "Included in Rental Rate"}
                </p>
              </div>
            </div>
          )}
        </div>

        {quote.maintenance_coverage_summary && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Coverage Summary</p>
            <p className="text-sm">{quote.maintenance_coverage_summary}</p>
          </div>
        )}

        {/* Additional Services */}
        <div className="pt-4 border-t space-y-4">
          <h4 className="text-sm font-semibold">Additional Services</h4>
          
          {/* Roadside Assistance */}
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium">Roadside Assistance</p>
              <p className="text-sm text-muted-foreground">24/7 emergency support</p>
            </div>
            <div className="text-right">
              <Badge variant={quote.roadside_assistance_included !== false ? "default" : "secondary"}>
                {quote.roadside_assistance_included !== false ? "Included" : "Not Included"}
              </Badge>
              {quote.roadside_assistance_included !== false && quote.roadside_assistance_cost_monthly && (
                <p className="text-sm text-muted-foreground mt-1">
                  {formatCurrency(quote.roadside_assistance_cost_monthly, quote.currency || "AED")}/month per vehicle
                </p>
              )}
            </div>
          </div>

          {/* Replacement Vehicle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Replacement Vehicle</p>
              <p className="text-sm text-muted-foreground">
                Courtesy car during repairs
                {quote.replacement_sla_hours && ` (${quote.replacement_sla_hours}h SLA)`}
              </p>
            </div>
            <div className="text-right">
              <Badge variant={quote.replacement_vehicle_included !== false ? "default" : "secondary"}>
                {quote.replacement_vehicle_included !== false ? "Included" : "Not Included"}
              </Badge>
              {quote.replacement_vehicle_included !== false && quote.replacement_vehicle_cost_monthly && (
                <p className="text-sm text-muted-foreground mt-1">
                  {formatCurrency(quote.replacement_vehicle_cost_monthly, quote.currency || "AED")}/month per vehicle
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
