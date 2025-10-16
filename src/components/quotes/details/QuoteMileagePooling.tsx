import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge, CheckCircle, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";

interface QuoteMileagePoolingProps {
  quote: any;
}

export const QuoteMileagePooling: React.FC<QuoteMileagePoolingProps> = ({ quote }) => {
  if (!quote.mileage_pooling_enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Mileage Pooling
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Mileage pooling not enabled</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          Mileage Pooling Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="font-medium">Mileage Pooling Enabled</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Pooled Mileage Allowance</p>
              <p className="font-medium">
                {quote.pooled_mileage_allowance_km?.toLocaleString() || "0"} km
              </p>
              <p className="text-xs text-muted-foreground mt-1">Total allowance for all vehicles</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Excess KM Rate</p>
              <p className="font-medium">
                {formatCurrency(quote.pooled_excess_km_rate || 0, quote.currency || "AED")} /km
              </p>
              <p className="text-xs text-muted-foreground mt-1">Applied to total pooled excess</p>
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm">
              <strong>Note:</strong> All vehicles in this quote share a common mileage pool. Excess
              kilometers from one vehicle can be offset by unused kilometers from another.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
