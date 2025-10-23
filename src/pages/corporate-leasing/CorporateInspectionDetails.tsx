import { useParams, useNavigate } from 'react-router-dom';
import { useInspection, useDeleteInspection } from '@/hooks/useInspectionMaster';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Trash2, Printer, CheckCircle2, XCircle, Gauge, FileText, PenTool, Paperclip } from 'lucide-react';
import { useState } from 'react';
import { PrintBlankCardModal } from '@/components/inspection/PrintBlankCardModal';
import { toast } from 'sonner';

export default function CorporateInspectionDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: inspection, isLoading } = useInspection(id || '');
  const deleteInspection = useDeleteInspection();
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteInspection.mutateAsync(id);
      toast.success('Inspection deleted successfully');
      navigate('/corporate-leasing-operations/manage-inspections');
    } catch (error) {
      toast.error('Failed to delete inspection');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading inspection details...</p>
        </div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Inspection not found</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/corporate-leasing-operations/manage-inspections')}
        >
          Back to List
        </Button>
      </div>
    );
  }

  const isEditable = inspection.status === 'DRAFT' || inspection.status === 'IN_PROGRESS';
  const statusColor = {
    DRAFT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
    APPROVED: 'bg-green-100 text-green-800 border-green-200'
  }[inspection.status];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/corporate-leasing-operations/manage-inspections')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Inspection Details</h1>
            <p className="text-muted-foreground">#{inspection.inspection_no}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColor}>{inspection.status}</Badge>
          <Badge variant="outline">{inspection.inspection_type}</Badge>
        </div>
      </div>

      {/* Action Buttons */}
      <Card className="p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setShowPrintModal(true)}>
            <Printer className="h-4 w-4 mr-2" />
            Print Blank Card
          </Button>
          {isEditable && (
            <>
              <Button onClick={() => navigate(`/corporate-leasing-operations/manage-inspections/edit/${id}`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Inspection
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}
          <Button variant="outline" onClick={() => navigate('/corporate-leasing-operations/manage-inspections')}>
            Back to List
          </Button>
        </div>
      </Card>

      {/* Vehicle Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Vehicle Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">VIN</p>
            <p className="font-medium">{inspection.vin || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Item Code</p>
            <p className="font-medium">{inspection.item_code || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Entry Date</p>
            <p className="font-medium">{new Date(inspection.entry_date).toLocaleDateString()}</p>
          </div>
          {inspection.completed_date && (
            <div>
              <p className="text-sm text-muted-foreground">Completed Date</p>
              <p className="font-medium">{new Date(inspection.completed_date).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Inspection Checklist */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold">Inspection Checklist</h2>
        </div>
        <div className="space-y-2">
          {Object.entries(inspection.checklist || {}).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
              <span className="capitalize">{key.replace('_', ' ')}</span>
              {value === 'OK' ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">OK</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">DAMAGE</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Metrics */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Gauge className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Vehicle Metrics</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Odometer</p>
            <p className="text-2xl font-bold">{inspection.metrics?.odometer || 'N/A'} km</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fuel Level</p>
            <p className="text-2xl font-bold">{inspection.metrics?.fuelLevel || 'N/A'}</p>
          </div>
        </div>
      </Card>

      {/* Photos */}
      {inspection.media && inspection.media.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Photo Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {inspection.media.map((item: any, index: number) => (
              <div key={item.id || index} className="aspect-square rounded-lg overflow-hidden border">
                <img 
                  src={item.url} 
                  alt={item.label || `Photo ${index + 1}`}
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => window.open(item.url, '_blank')}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Notes */}
      {inspection.notes && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Notes</h2>
          </div>
          <p className="text-muted-foreground whitespace-pre-wrap">{inspection.notes}</p>
        </Card>
      )}

      {/* Attachments */}
      {inspection.attachments && inspection.attachments.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Paperclip className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Attachments</h2>
          </div>
          <div className="space-y-2">
            {inspection.attachments.map((file: any, index: number) => (
              <div key={file.id || index} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">{file.filename}</p>
                  <p className="text-sm text-muted-foreground">{file.type}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.open(file.url, '_blank')}>
                  Download
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Signature */}
      {inspection.signature && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <PenTool className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Signature</h2>
          </div>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-white max-w-md">
              <img 
                src={inspection.signature.imageUrl} 
                alt="Inspector signature"
                className="w-full"
              />
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground">
                Signed by <strong>{inspection.signature.name}</strong>
              </p>
              <p className="text-muted-foreground">
                {new Date(inspection.signature.signedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      )}

      <PrintBlankCardModal
        open={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        mode="prefilled"
        inspectionData={inspection}
      />

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-2">Delete Inspection?</h3>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to delete this inspection? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
