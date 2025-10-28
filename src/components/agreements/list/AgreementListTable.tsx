import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  FileText, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  FileDown, 
  Send, 
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

interface Agreement {
  id: string;
  agreement_no: string | null;
  status: string;
  customer_id: string;
  vehicle_id: string | null;
  agreement_date: string;
  checkout_datetime: string | null;
  return_datetime: string | null;
  total_amount: number;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  } | null;
  vehicles?: {
    make: string;
    model: string;
    license_plate: string;
  } | null;
}

interface AgreementListTableProps {
  agreements: Agreement[];
}

export const AgreementListTable: React.FC<AgreementListTableProps> = ({ agreements }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string, returnDate: string | null) => {
    const today = new Date();
    const isOverdue = returnDate && new Date(returnDate) < today && status === 'active';
    
    if (isOverdue) {
      const daysOverdue = differenceInDays(today, new Date(returnDate));
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Overdue ({daysOverdue}d)
        </Badge>
      );
    }

    const variants: Record<string, any> = {
      draft: 'secondary',
      active: 'default',
      pending_return: 'outline',
      completed: 'secondary',
      terminated: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getDaysOut = (checkoutDate: string | null, returnDate: string | null) => {
    if (!checkoutDate) return null;
    const checkout = new Date(checkoutDate);
    const returnD = returnDate ? new Date(returnDate) : new Date();
    const days = differenceInDays(returnD, checkout);
    return days > 0 ? `${days}d` : '0d';
  };

  if (agreements.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No agreements found</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your filters or create a new agreement.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Agreements ({agreements.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px]">Agreement No.</TableHead>
                <TableHead className="min-w-[180px]">Customer</TableHead>
                <TableHead className="min-w-[160px]">Vehicle</TableHead>
                <TableHead className="min-w-[140px]">Status</TableHead>
                <TableHead className="min-w-[100px]">Check-out</TableHead>
                <TableHead className="min-w-[100px]">Expected Return</TableHead>
                <TableHead className="min-w-[80px]">Days Out</TableHead>
                <TableHead className="min-w-[120px] text-right">Total Amount</TableHead>
                <TableHead className="min-w-[120px] text-right">Balance Due</TableHead>
                <TableHead className="min-w-[100px]">Created</TableHead>
                <TableHead className="w-[60px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agreements.map((agreement) => {
                const isOverdue = agreement.return_datetime && 
                  new Date(agreement.return_datetime) < new Date() && 
                  agreement.status === 'active';

                return (
                  <TableRow
                    key={agreement.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/agreements/${agreement.id}`)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {agreement.agreement_no || `AGR-${agreement.id.slice(0, 8)}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">
                        {agreement.profiles?.full_name || 'Unknown'}
                      </p>
                    </TableCell>
                    <TableCell>
                      {agreement.vehicles ? (
                        <div>
                          <p className="font-medium">
                            {agreement.vehicles.make} {agreement.vehicles.model}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {agreement.vehicles.license_plate}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No vehicle</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(agreement.status, agreement.return_datetime)}
                    </TableCell>
                    <TableCell>
                      {agreement.checkout_datetime ? (
                        <div className="text-sm">
                          <p>{format(new Date(agreement.checkout_datetime), 'MMM dd, yyyy')}</p>
                          <p className="text-muted-foreground">
                            {format(new Date(agreement.checkout_datetime), 'HH:mm')}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">TBD</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {agreement.return_datetime ? (
                        <div className="text-sm">
                          <p className={isOverdue ? 'text-destructive font-medium' : ''}>
                            {format(new Date(agreement.return_datetime), 'MMM dd, yyyy')}
                          </p>
                          <p className="text-muted-foreground">
                            {format(new Date(agreement.return_datetime), 'HH:mm')}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">TBD</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {agreement.status === 'active' && (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {getDaysOut(agreement.checkout_datetime, new Date().toISOString())}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(agreement.total_amount || 0)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-destructive">
                      {formatCurrency(agreement.total_amount || 0)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(agreement.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate(`/agreements/${agreement.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/agreements/${agreement.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {agreement.status === 'active' && (
                            <DropdownMenuItem>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Extend
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <FileDown className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send className="mr-2 h-4 w-4" />
                            Send to Customer
                          </DropdownMenuItem>
                          {agreement.status === 'draft' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <XCircle className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
