import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/currency";
import { format } from "date-fns";
import { FileText } from "lucide-react";

interface MasterAgreementLinesProps {
  lines: any[];
  currency?: string;
}

export const MasterAgreementLines: React.FC<MasterAgreementLinesProps> = ({
  lines = [],
  currency = "AED",
}) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-muted",
      active: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      terminated: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
      completed: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
    };
    return colors[status] || "bg-muted";
  };

  if (lines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contract Lines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No contract lines available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Contract Lines ({lines.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract No</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Monthly Rate</TableHead>
              <TableHead>Term (Months)</TableHead>
              <TableHead>Mileage</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((line) => (
              <TableRow key={line.id}>
                <TableCell className="font-medium">{line.contract_no || "TBD"}</TableCell>
                <TableCell>
                  {line.make && line.model ? (
                    <div>
                      <p className="font-medium">{line.model_year} {line.make} {line.model}</p>
                      {line.exterior_color && (
                        <p className="text-sm text-muted-foreground">{line.exterior_color}</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Vehicle TBD</span>
                  )}
                </TableCell>
                <TableCell>{formatCurrency(line.monthly_rate_aed || 0, currency)}</TableCell>
                <TableCell>{line.contract_months || "N/A"}</TableCell>
                <TableCell>
                  {line.mileage_allowance_km_month ? (
                    <div>
                      <p>{line.mileage_allowance_km_month.toLocaleString()} km/mo</p>
                      {line.excess_km_rate_aed && (
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(line.excess_km_rate_aed, currency)}/km excess
                        </p>
                      )}
                    </div>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell>
                  {line.lease_start_date ? format(new Date(line.lease_start_date), "MMM d, yyyy") : "N/A"}
                </TableCell>
                <TableCell>
                  {line.lease_end_date ? format(new Date(line.lease_end_date), "MMM d, yyyy") : "N/A"}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(line.line_status || "draft")}>
                    {line.line_status || "draft"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
