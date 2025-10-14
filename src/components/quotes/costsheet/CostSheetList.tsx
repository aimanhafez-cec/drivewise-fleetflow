import React from 'react';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CostSheetStatusBadge } from './CostSheetStatusBadge';
import { CostSheetListItem } from '@/hooks/useCostSheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CostSheetListProps {
  costSheets: CostSheetListItem[];
  onViewCostSheet: (costSheetId: string) => void;
}

export const CostSheetList: React.FC<CostSheetListProps> = ({
  costSheets,
  onViewCostSheet,
}) => {
  if (costSheets.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No cost sheets yet. Create your first cost sheet below.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cost Sheet No.</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Approved/Rejected</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {costSheets.map((sheet) => (
            <TableRow key={sheet.id}>
              <TableCell className="font-medium">{sheet.cost_sheet_no}</TableCell>
              <TableCell>V{sheet.version}</TableCell>
              <TableCell>
                <CostSheetStatusBadge status={sheet.status} />
              </TableCell>
              <TableCell>
                {format(new Date(sheet.created_at), 'MMM dd, yyyy HH:mm')}
              </TableCell>
              <TableCell>
                {sheet.submitted_at 
                  ? format(new Date(sheet.submitted_at), 'MMM dd, yyyy HH:mm')
                  : '-'}
              </TableCell>
              <TableCell>
                {sheet.approved_at 
                  ? format(new Date(sheet.approved_at), 'MMM dd, yyyy HH:mm')
                  : '-'}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewCostSheet(sheet.id)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
