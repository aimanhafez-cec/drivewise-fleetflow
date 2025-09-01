import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MoreHorizontal, FileText, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { useCorporateLeasingAgreements } from '@/hooks/useCorporateLeasingLOVs';
import { format } from 'date-fns';

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'default';
    case 'pending_approval':
      return 'secondary';
    case 'draft':
      return 'outline';
    case 'suspended':
      return 'destructive';
    case 'terminated':
    case 'expired':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending_approval':
      return 'Pending Approval';
    case 'active':
      return 'Active';
    case 'draft':
      return 'Draft';
    case 'suspended':
      return 'Suspended';
    case 'terminated':
      return 'Terminated';
    case 'expired':
      return 'Expired';
    default:
      return status;
  }
};

export const CorporateLeasingList: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { items: agreements, isLoading, error, updateSearch } = useCorporateLeasingAgreements(statusFilter);

  React.useEffect(() => {
    updateSearch(searchQuery);
  }, [searchQuery, updateSearch]);

  const handleCreateNew = () => {
    navigate('/corporate-leasing/new');
  };

  const handleView = (agreementId: string) => {
    navigate(`/corporate-leasing/${agreementId}`);
  };

  const handleEdit = (agreementId: string) => {
    navigate(`/corporate-leasing/${agreementId}/edit`);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-destructive">Error loading corporate leasing agreements</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Corporate Leasing Agreements</h1>
          <p className="text-muted-foreground mt-2">
            Manage long-term corporate vehicle leasing agreements
          </p>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Agreement
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agreements</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by agreement number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-muted-foreground"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-card-foreground">Loading agreements...</p>
            </div>
          ) : agreements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <FileText className="h-8 w-8 text-card-foreground mb-2" />
              <p className="text-card-foreground">No corporate leasing agreements found</p>
              <Button 
                variant="link" 
                onClick={handleCreateNew}
                className="mt-2"
              >
                Create your first agreement
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead>Agreement No.</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agreements.map((agreement) => (
                    <TableRow key={agreement.id}>
                      <TableCell className="font-medium">
                        {agreement.agreement_no || `Draft-${agreement.id.substring(0, 8)}`}
                      </TableCell>
                      <TableCell>
                        {agreement.customer_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>{agreement.master_term}</TableCell>
                      <TableCell>
                        {agreement.contract_start_date 
                          ? format(new Date(agreement.contract_start_date), 'MMM d, yyyy')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {agreement.contract_end_date 
                          ? format(new Date(agreement.contract_end_date), 'MMM d, yyyy')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(agreement.status)}>
                          {getStatusLabel(agreement.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(agreement.id)}>
                              <FileText className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(agreement.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {agreement.status === 'draft' && (
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};