import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { InspectionMaster, InspectionType } from '@/types/inspection';
import { INSPECTION_TYPES } from '@/types/inspection';

interface InspectionDataTableProps {
  inspections: (InspectionMaster & { vehicles?: any })[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function InspectionDataTable({ inspections, onView, onEdit, onDelete }: InspectionDataTableProps) {
  const getTypeLabel = (type: InspectionType) => {
    return INSPECTION_TYPES.find((t) => t.value === type)?.label || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Inspection No.</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>VIN</TableHead>
            <TableHead>Item Code & Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Entry Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inspections.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No inspections found
              </TableCell>
            </TableRow>
          ) : (
            inspections.map((inspection) => (
              <TableRow key={inspection.id}>
                <TableCell className="font-medium">{inspection.inspection_no}</TableCell>
                <TableCell>{getTypeLabel(inspection.inspection_type)}</TableCell>
                <TableCell className="font-mono text-sm">{inspection.vin || '-'}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{inspection.item_code || '-'}</div>
                    <div className="text-sm text-muted-foreground">
                      {inspection.vehicles
                        ? `${inspection.vehicles.make} ${inspection.vehicles.model} ${inspection.vehicles.year}`
                        : '-'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStatusColor(inspection.status)}>
                    {inspection.status}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(inspection.entry_date), 'dd MMM yyyy')}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onView(inspection.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {inspection.status !== 'APPROVED' && (
                      <Button variant="ghost" size="icon" onClick={() => onEdit(inspection.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {inspection.status === 'DRAFT' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(inspection.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
