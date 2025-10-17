import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
  const [showObsolete, setShowObsolete] = useState(false);

  const filteredCostSheets = useMemo(() => {
    return costSheets.filter(cs => showObsolete || cs.status !== 'obsolete');
  }, [costSheets, showObsolete]);

  const obsoleteCount = useMemo(() => {
    return costSheets.filter(cs => cs.status === 'obsolete').length;
  }, [costSheets]);

  if (costSheets.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No cost sheets yet. Create your first cost sheet below.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {obsoleteCount > 0 && (
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-obsolete" 
            checked={showObsolete} 
            onCheckedChange={(checked) => setShowObsolete(checked as boolean)}
          />
          <Label htmlFor="show-obsolete" className="text-sm text-muted-foreground cursor-pointer">
            Show obsolete cost sheets ({obsoleteCount})
          </Label>
        </div>
      )}
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
          {filteredCostSheets.map((sheet) => (
            <TableRow key={sheet.id} className={sheet.status === 'obsolete' ? 'opacity-60' : ''}>
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
    </div>
  );
};
