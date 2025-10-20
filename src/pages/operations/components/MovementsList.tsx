import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Trash2,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useVehicleMovements, useApproveMovement, useRejectMovement, useDeleteMovement } from "@/hooks/useVehicleMovements";
import { MovementFilters, ApprovalStatus, MovementType } from "@/lib/api/fleet-operations";
import { MovementFiltersBar } from "./MovementFiltersBar";

interface MovementsListProps {
  filters?: Partial<MovementFilters>;
}

export function MovementsList({ filters: initialFilters }: MovementsListProps) {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<MovementFilters>(initialFilters || {});
  const { data: movements, isLoading } = useVehicleMovements(filters);
  const approveMutation = useApproveMovement();
  const rejectMutation = useRejectMovement();
  const deleteMutation = useDeleteMovement();

  const getStatusBadge = (status: ApprovalStatus) => {
    const variants: Record<ApprovalStatus, { variant: any; label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      approved: { variant: "default", label: "Approved" },
      rejected: { variant: "destructive", label: "Rejected" },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: MovementType) => {
    const labels: Record<MovementType, string> = {
      ownership_transfer: "Ownership Transfer",
      inter_branch: "Inter-Branch",
      department_reallocation: "Dept. Reallocation",
      third_party: "Third Party",
    };
    return <Badge variant="outline">{labels[type]}</Badge>;
  };

  const handleApprove = async (id: string) => {
    if (confirm("Are you sure you want to approve this movement?")) {
      await approveMutation.mutateAsync(id);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      await rejectMutation.mutateAsync({ id, reason });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this movement?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading movements...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <MovementFiltersBar filters={filters} onFiltersChange={setFilters} />

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Movements</CardTitle>
        </CardHeader>
        <CardContent>
          {movements && movements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Movement ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Vehicles</TableHead>
                  <TableHead>From → To</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell className="font-medium">
                      {movement.movement_no}
                    </TableCell>
                    <TableCell>{getTypeBadge(movement.movement_type)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {movement.vehicle_ids.length} vehicle(s)
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{movement.from_branch_id || movement.from_owner || "—"}</div>
                        <div className="text-muted-foreground">↓</div>
                        <div>{movement.to_branch_id || movement.to_owner || "—"}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(movement.effective_from), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell>{getStatusBadge(movement.status)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {movement.reason_code}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => navigate(`/operations/movements/${movement.id}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {movement.status === 'pending' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => navigate(`/operations/movements/${movement.id}/edit`)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleApprove(movement.id)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleReject(movement.id)}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Print Handover
                          </DropdownMenuItem>
                          {movement.status === 'pending' && (
                            <DropdownMenuItem
                              onClick={() => handleDelete(movement.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No movements found. Create your first movement to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
