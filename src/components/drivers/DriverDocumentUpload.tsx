import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Upload, Eye, Trash2, Clock, CheckCircle, CalendarIcon, Plus, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DriverDocument {
  id: string;
  driver_id: string;
  document_type: string;
  file_url: string;
  file_name: string;
  file_size_bytes?: number;
  mime_type?: string;
  uploaded_at: string;
  uploaded_by?: string;
  expiry_date?: string;
  is_verified: boolean;
  verified_at?: string;
  verified_by?: string;
  verification_notes?: string;
}

export interface PendingDocument {
  id: string;
  type: string;
  file: File;
  expiryDate?: string;
}

interface DocumentUploadProps {
  driverId?: string;
  documents: DriverDocument[];
  pendingDocuments?: PendingDocument[];
  onDocumentChange: () => void;
  onPendingDocumentAdd?: (pendingDoc: Omit<PendingDocument, 'id'>) => void;
  onPendingDocumentRemove?: (id: string) => void;
}

const DOCUMENT_TYPES = [
  { value: 'emirates_id_front', label: 'Emirates ID (Front)' },
  { value: 'emirates_id_back', label: 'Emirates ID (Back)' },
  { value: 'driving_license_front', label: 'Driving License (Front)' },
  { value: 'driving_license_back', label: 'Driving License (Back)' },
  { value: 'passport_bio_page', label: 'Passport (Bio Page)' },
  { value: 'visa_page', label: 'Visa Page' },
  { value: 'residence_permit', label: 'Residence Permit' },
  { value: 'employment_letter', label: 'Employment Letter' },
  { value: 'salary_certificate', label: 'Salary Certificate' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'utility_bill', label: 'Utility Bill' },
  { value: 'other', label: 'Other Document' }
];

export const DriverDocumentUpload: React.FC<DocumentUploadProps> = ({
  driverId,
  documents,
  pendingDocuments = [],
  onDocumentChange,
  onPendingDocumentAdd,
  onPendingDocumentRemove
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and PDF files are allowed');
      return;
    }

    setSelectedFile(file);
  };

  const handleAddDocument = async () => {
    if (!selectedType || !selectedFile) {
      toast.error('Please select document type and file');
      return;
    }

    // If driver is not saved yet, add to pending queue
    if (!driverId && onPendingDocumentAdd) {
      onPendingDocumentAdd({
        type: selectedType,
        file: selectedFile,
        expiryDate: expiryDate?.toISOString()
      });
      toast.success('Document added to queue. It will be uploaded when you save the driver.');
      resetModal();
      return;
    }

    // If driver exists, upload immediately
    if (!driverId) {
      toast.error('Driver must be saved before uploading documents');
      return;
    }

    setUploading(true);
    try {
      const fileName = `${driverId}/${selectedType}_${Date.now()}_${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('driver-documents')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('driver-documents')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('driver_documents')
        .insert([{
          driver_id: driverId,
          document_type: selectedType as any,
          file_url: publicUrl,
          file_name: selectedFile.name,
          file_size_bytes: selectedFile.size,
          mime_type: selectedFile.type,
          expiry_date: expiryDate?.toISOString() || null
        }]);

      if (dbError) throw dbError;

      toast.success('Document uploaded successfully');
      onDocumentChange();
      resetModal();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      const { error } = await supabase
        .from('driver_documents')
        .delete()
        .eq('id', docId);

      if (error) throw error;

      toast.success('Document deleted successfully');
      onDocumentChange();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setSelectedType('');
    setSelectedFile(null);
    setExpiryDate(undefined);
  };

  const getDocumentTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find(dt => dt.value === type)?.label || type;
  };

  const totalDocuments = documents.length + pendingDocuments.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Documents</h3>
          <p className="text-sm text-muted-foreground">
            {documents.length} uploaded{pendingDocuments.length > 0 && `, ${pendingDocuments.length} pending`}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Document
        </Button>
      </div>

      {totalDocuments > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Uploaded documents */}
              {documents.map((doc) => {
                const isExpired = doc.expiry_date && new Date(doc.expiry_date) < new Date();
                return (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {getDocumentTypeLabel(doc.document_type)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{doc.file_name}</TableCell>
                    <TableCell>
                      {doc.is_verified ? (
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Uploaded</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {doc.expiry_date ? (
                        <span className={isExpired ? 'text-destructive' : ''}>
                          {format(new Date(doc.expiry_date), 'PP')}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(doc.file_url, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* Pending documents */}
              {pendingDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {getDocumentTypeLabel(doc.type)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{doc.file.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending Upload
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {doc.expiryDate ? (
                      <span>{format(new Date(doc.expiryDate), 'PP')}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPendingDocumentRemove?.(doc.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="border rounded-lg border-dashed p-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No documents added yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click "Add Document" to upload driver documents
          </p>
        </div>
      )}

      {/* Add Document Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">File</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                onChange={handleFileSelect}
                className="w-full text-sm"
              />
              {selectedFile && (
                <p className="text-xs text-muted-foreground">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Expiry Date (Optional)</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expiryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDate ? format(expiryDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expiryDate}
                    onSelect={setExpiryDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetModal}>
              Cancel
            </Button>
            <Button onClick={handleAddDocument} disabled={uploading || !selectedType || !selectedFile}>
              {uploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Add Document
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
