import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/currency";

interface QuoteAddOnsDisplayProps {
  quote: any;
}

export const QuoteAddOnsDisplay: React.FC<QuoteAddOnsDisplayProps> = ({ quote }) => {
  const defaultAddons = quote.default_addons || [];

  if (defaultAddons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Default Add-Ons & Extras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No default add-ons configured</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Default Add-Ons & Extras
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {defaultAddons.map((addon: any, index: number) => (
            <div
              key={addon.id || index}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {addon.enabled && <CheckCircle className="h-4 w-4 text-green-600" />}
                <div>
                  <p className="font-medium">{addon.name}</p>
                  <Badge variant="outline" className="mt-1">
                    {addon.type === "monthly" ? "Monthly" : "One-Time"}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {formatCurrency(addon.amount, quote.currency || "AED")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {addon.type === "monthly" ? "per month" : "one-time"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {quote.default_addons_summary && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-1">Add-Ons Summary</p>
            <p className="text-sm">{quote.default_addons_summary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
