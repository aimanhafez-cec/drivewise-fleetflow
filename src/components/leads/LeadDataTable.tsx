import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { LeadSourceBadge } from './LeadSourceBadge';
import { Lead } from '@/hooks/useLeadsRealtime';
import { leadSources } from '@/data/leadSources';
import { 
  MoreVertical, 
  Eye, 
  CheckCircle2, 
  Mail, 
  Phone,
  ArrowUpDown,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface LeadDataTableProps {
  leads: Lead[];
}

type SortField = 'created_at' | 'estimated_value' | 'duration_days' | 'priority';
type SortDirection = 'asc' | 'desc';

export const LeadDataTable = ({ leads }: LeadDataTableProps) => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedLeads = [...leads].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'created_at') {
      comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else if (sortField === 'estimated_value') {
      comparison = a.estimated_value - b.estimated_value;
    } else if (sortField === 'duration_days') {
      comparison = a.duration_days - b.duration_days;
    } else if (sortField === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const getStatusBadge = (status: Lead['status']) => {
    const statusConfig = {
      new: { label: 'New', className: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
      contacted: { label: 'Contacted', className: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
      quoted: { label: 'Quoted', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
      confirmed: { label: 'Confirmed', className: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
      expired: { label: 'Expired', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    };

    const config = statusConfig[status];
    return <Badge className={`${config.className} border-0`}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: Lead['priority']) => {
    const priorityConfig = {
      high: { label: 'High', className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
      medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' },
      low: { label: 'Low', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    };

    const config = priorityConfig[priority];
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const handleQuickConfirm = (e: React.MouseEvent, leadId: string) => {
    e.stopPropagation();
    // TODO: Implement quick confirm logic
    console.log('Quick confirm lead:', leadId);
  };

  if (leads.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No leads found matching your filters.</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead ID</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('duration_days')}
              >
                <div className="flex items-center gap-1">
                  Duration
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('estimated_value')}
              >
                <div className="flex items-center gap-1">
                  Est. Value
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center gap-1">
                  Priority
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center gap-1">
                  Created
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLeads.map((lead) => (
              <TableRow
                key={lead.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/leads-intake/${lead.id}`)}
              >
                <TableCell className="font-mono text-sm">
                  {lead.lead_no}
                </TableCell>
            <TableCell>
              <LeadSourceBadge sourceId={lead.source_name} />
            </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{lead.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{lead.customer_email}</p>
                    <p className="text-xs text-muted-foreground">{lead.customer_phone}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{lead.vehicle_category}</p>
                    {lead.alternative_categories && (
                      <p className="text-xs text-muted-foreground">
                        Alt: {lead.alternative_categories.join(', ')}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(lead.pickup_datetime), 'MMM dd, HH:mm')}</span>
                    </div>
                    <p className="text-muted-foreground truncate max-w-[150px]">
                      {lead.pickup_location}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{lead.duration_days}d</Badge>
                </TableCell>
                <TableCell className="font-semibold">
                  AED {lead.estimated_value.toLocaleString()}
                </TableCell>
                <TableCell>{getPriorityBadge(lead.priority)}</TableCell>
                <TableCell>{getStatusBadge(lead.status)}</TableCell>
                <TableCell>
                  <p className="text-xs">
                    {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                  </p>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {(lead.status === 'new' || lead.status === 'contacted' || lead.status === 'quoted') && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={(e) => handleQuickConfirm(e, lead.id)}
                        className="gap-1"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Confirm
                      </Button>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/leads-intake/${lead.id}`);
                        }}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Phone className="mr-2 h-4 w-4" />
                          Call Customer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
