import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Eye, Play, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { useWorkOrders, useStartWorkOrder, useCompleteWorkOrder, useCancelWorkOrder, useDeleteWorkOrder } from '@/hooks/useWorkOrders';
import { WorkOrderFilters } from '@/lib/api/maintenance';
import WorkOrderFiltersBar from './WorkOrderFiltersBar';
import { format } from 'date-fns';

const statusColors = {
  open: 'bg-yellow-500',
  in_progress: 'bg-blue-500',
  waiting_parts: 'bg-orange-500',
  qa: 'bg-purple-500',
  closed: 'bg-green-500',
  cancelled: 'bg-red-500',
};

const priorityColors = {
  low: 'bg-gray-400',
  normal: 'bg-blue-400',
  high: 'bg-orange-500',
  urgent: 'bg-red-600',
};

const reasonLabels = {
  pm: 'Preventive Maintenance',
  breakdown: 'Breakdown',
  accident: 'Accident',
  recall: 'Recall',
  inspection: 'Inspection',
  other: 'Other',
};

const WorkOrdersList: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<WorkOrderFilters>({});
  const { data: workOrders, isLoading } = useWorkOrders(filters);
  const startMutation = useStartWorkOrder();
  const completeMutation = useCompleteWorkOrder();
  const cancelMutation = useCancelWorkOrder();
  const deleteMutation = useDeleteWorkOrder();

  const handleStart = (id: string) => {
    startMutation.mutate(id);
  };

  const handleComplete = (id: string) => {
    completeMutation.mutate({ id });
  };

  const handleCancel = (id: string) => {
    if (confirm('Are you sure you want to cancel this work order?')) {
      cancelMutation.mutate({ id });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this work order? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading work orders...</div>;
  }

  return (
    <div className="space-y-4">
      <WorkOrderFiltersBar filters={filters} onFiltersChange={setFilters} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Work Order #</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead>Est. Cost</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!workOrders || workOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No work orders found
                </TableCell>
              </TableRow>
            ) : (
              workOrders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.wo_number}</TableCell>
                  <TableCell>
                    {order.vehicles ? `${order.vehicles.make} ${order.vehicles.model}` : 'N/A'}
                    <div className="text-xs text-muted-foreground">
                      {order.vehicles?.plate_no}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{reasonLabels[order.reason as keyof typeof reasonLabels]}</Badge>
                  </TableCell>
                  <TableCell>
                    {order.priority && (
                      <Badge className={priorityColors[order.priority as keyof typeof priorityColors]}>
                        {order.priority}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {order.scheduled_start ? format(new Date(order.scheduled_start), 'MMM dd, yyyy') : 'Not scheduled'}
                  </TableCell>
                  <TableCell>
                    {order.estimated_cost ? `AED ${order.estimated_cost.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/operations/maintenance/${order.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {order.status === 'open' && (
                          <DropdownMenuItem onClick={() => handleStart(order.id)}>
                            <Play className="mr-2 h-4 w-4" />
                            Start Work
                          </DropdownMenuItem>
                        )}
                        {order.status === 'in_progress' && (
                          <DropdownMenuItem onClick={() => handleComplete(order.id)}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark Complete
                          </DropdownMenuItem>
                        )}
                        {['open', 'in_progress'].includes(order.status) && (
                          <DropdownMenuItem onClick={() => handleCancel(order.id)}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                          </DropdownMenuItem>
                        )}
                        {order.status === 'open' && (
                          <DropdownMenuItem onClick={() => handleDelete(order.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default WorkOrdersList;
