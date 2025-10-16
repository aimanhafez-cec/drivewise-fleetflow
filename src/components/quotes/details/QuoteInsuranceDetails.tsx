import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/currency";

interface QuoteInsuranceDetailsProps {
  quote: any;
}

export const QuoteInsuranceDetails: React.FC<QuoteInsuranceDetailsProps> = ({ quote }) => {
  const getCoverageLabel = (pkg: string) => {
    const labels: Record<string, string> = {
      cdw: "Collision Damage Waiver",
      comprehensive: "Comprehensive Coverage",
      "full-zero-excess": "Full Coverage (Zero Excess)",
    };
    return labels[pkg] || pkg;
  };

  const getTerritorialLabel = (coverage: string) => {
    const labels: Record<string, string> = {
      "uae-only": "UAE Only",
      gcc: "GCC Countries",
    };
    return labels[coverage] || coverage;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Insurance & Coverage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Coverage Package</p>
              <Badge variant="secondary" className="mt-1">
                {getCoverageLabel(quote.insurance_coverage_package || "comprehensive")}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Excess Amount</p>
              <p className="font-medium">
                {formatCurrency(quote.insurance_excess_aed || 1500, quote.currency || "AED")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Territorial Coverage</p>
              <p className="font-medium">
                {getTerritorialLabel(quote.insurance_territorial_coverage || "uae-only")}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold">Included Coverage</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {quote.insurance_glass_tire_cover ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">Glass & Tire Cover</span>
              </div>
              <div className="flex items-center gap-2">
                {quote.insurance_pai_enabled ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">Personal Accident Insurance (PAI)</span>
              </div>
              <div className="flex items-center gap-2">
                {quote.insurance_damage_waiver ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">Damage Waiver</span>
              </div>
              <div className="flex items-center gap-2">
                {quote.insurance_theft_protection ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">Theft Protection</span>
              </div>
              <div className="flex items-center gap-2">
                {quote.insurance_third_party_liability ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">Third Party Liability</span>
              </div>
              <div className="flex items-center gap-2">
                {quote.insurance_additional_driver ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">Additional Driver</span>
              </div>
              <div className="flex items-center gap-2">
                {quote.insurance_cross_border ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">Cross Border</span>
              </div>
            </div>
          </div>
        </div>

        {quote.insurance_coverage_summary && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Coverage Summary</p>
            <p className="text-sm">{quote.insurance_coverage_summary}</p>
          </div>
        )}

        {quote.insurance_notes && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Insurance Notes</p>
            <p className="text-sm">{quote.insurance_notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
