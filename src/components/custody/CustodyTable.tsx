import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, FileText, AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { StatusBadge } from "./StatusBadge";
import type { CustodyTransaction } from "@/lib/api/custody";

interface CustodyTableProps {
  data: CustodyTransaction[];
  isLoading?: boolean;
  pagination: { 
    page: number; 
    pageSize: number; 
    totalCount: number; 
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

export function CustodyTable({ data, isLoading, pagination, onPageChange }: CustodyTableProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/10">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
        <h3 className="text-lg font-semibold mb-1">No custody transactions found</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Try adjusting your filters or create a new custody transaction
        </p>
        <Button onClick={() => navigate("/custody/new")}>
          Create New Custody Transaction
        </Button>
      </div>
    );
  }

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return format(new Date(date), "dd MMM yyyy");
  };

  const isOverdue = (expectedReturn: string | null) => {
    if (!expectedReturn) return false;
    return new Date(expectedReturn) < new Date();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Custody No</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Agreement</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Custodian</TableHead>
              <TableHead>Effective From</TableHead>
              <TableHead>Expected Return</TableHead>
              <TableHead>SLA</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((custody) => (
              <TableRow key={custody.id}>
                <TableCell className="font-medium">{custody.custody_no}</TableCell>
                <TableCell>
                  <StatusBadge status={custody.status} />
                </TableCell>
                <TableCell>
                  {custody.original_vehicle_id ? (
                    <div className="text-sm">
                      <div className="font-medium">{custody.original_vehicle_id}</div>
                      {custody.replacement_vehicle_id && (
                        <div className="text-muted-foreground">
                          → {custody.replacement_vehicle_id}
                        </div>
                      )}
                    </div>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  {custody.agreement_id ? (
                    <span className="text-sm">{custody.agreement_id}</span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  {custody.customer_id ? (
                    <span className="text-sm">{custody.customer_id}</span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {custody.reason_code.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium capitalize">
                      {custody.custodian_type.replace(/_/g, " ")}
                    </div>
                    {custody.custodian_name && (
                      <div className="text-muted-foreground">{custody.custodian_name}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatDate(custody.effective_from)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {formatDate(custody.expected_return_date)}
                    {isOverdue(custody.expected_return_date) && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {custody.sla_breached ? (
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Breached
                    </Badge>
                  ) : custody.status === 'pending_approval' || custody.status === 'approved' ? (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      <Clock className="h-3 w-3 mr-1" />
                      On Track
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      N/A
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/custody/${custody.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
            {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of{" "}
            {pagination.totalCount} transactions
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(pagination.totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={pagination.page === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(i + 1)}
                  className="w-8 h-8 p-0"
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
