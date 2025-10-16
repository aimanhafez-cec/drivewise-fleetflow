import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface QuotePickupReturnInfoProps {
  quote: any;
  pickupLocation?: any;
  returnLocation?: any;
  pickupSite?: any;
  returnSite?: any;
}

export const QuotePickupReturnInfo: React.FC<QuotePickupReturnInfoProps> = ({
  quote,
  pickupLocation,
  returnLocation,
  pickupSite,
  returnSite,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Pickup & Return Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pickup Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">Pickup</h4>
              <Badge variant="outline">
                {quote.pickup_type === "company_location" ? "Company Location" : "Customer Site"}
              </Badge>
            </div>
            {quote.pickup_type === "company_location" && pickupLocation && (
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{pickupLocation.name}</p>
                {pickupLocation.address && (
                  <p className="text-sm text-muted-foreground mt-1">{pickupLocation.address}</p>
                )}
              </div>
            )}
            {quote.pickup_type === "customer_site" && pickupSite && (
              <div>
                <p className="text-sm text-muted-foreground">Customer Site</p>
                <p className="font-medium">{pickupSite.site_name}</p>
                {pickupSite.site_code && (
                  <p className="text-xs text-muted-foreground">Code: {pickupSite.site_code}</p>
                )}
                {pickupSite.address && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {typeof pickupSite.address === "string"
                      ? pickupSite.address
                      : pickupSite.address.street || "N/A"}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Return Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">Return</h4>
              <Badge variant="outline">
                {quote.return_type === "company_location" ? "Company Location" : "Customer Site"}
              </Badge>
            </div>
            {quote.return_type === "company_location" && returnLocation && (
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{returnLocation.name}</p>
                {returnLocation.address && (
                  <p className="text-sm text-muted-foreground mt-1">{returnLocation.address}</p>
                )}
              </div>
            )}
            {quote.return_type === "customer_site" && returnSite && (
              <div>
                <p className="text-sm text-muted-foreground">Customer Site</p>
                <p className="font-medium">{returnSite.site_name}</p>
                {returnSite.site_code && (
                  <p className="text-xs text-muted-foreground">Code: {returnSite.site_code}</p>
                )}
                {returnSite.address && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {typeof returnSite.address === "string"
                      ? returnSite.address
                      : returnSite.address.street || "N/A"}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
