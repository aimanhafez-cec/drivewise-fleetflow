import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, Check, X, AlertTriangle, FileText, Eye, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DriverDocument {
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

interface DocumentUploadProps {
  driverId: string;
  documentType: string;
  label: string;
  isRequired: boolean;
  existingDocument?: DriverDocument;
  expiryDate?: string;
  onUploadComplete: () => void;
  allowCustomType?: boolean;
}

export const DriverDocumentUpload: React.FC<DocumentUploadProps> = ({
  driverId,
  documentType,
  label,
  isRequired,
  existingDocument,
  expiryDate,
  onUploadComplete,
  allowCustomType = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [selectedDocType, setSelectedDocType] = useState(documentType);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Only JPEG, PNG, and PDF files are allowed');
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !driverId) return;
    
    setUploading(true);
    try {
      const docType = allowCustomType ? selectedDocType : documentType;
      const fileName = `${driverId}/${docType}_${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('driver-documents')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('driver-documents')
        .getPublicUrl(fileName);
      
      const { error: dbError } = await supabase
        .from('driver_documents')
        .insert([{
          driver_id: driverId,
          document_type: docType as any,
          file_url: publicUrl,
          file_name: file.name,
          file_size_bytes: file.size,
          mime_type: file.type,
          expiry_date: expiryDate || null
        }]);
      
      if (dbError) throw dbError;
      
      toast.success(`${label} uploaded successfully`);
      setFile(null);
      setSelectedDocType(documentType);
      onUploadComplete();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = () => {
    if (!existingDocument) {
      return <Badge variant="destructive">Missing</Badge>;
    }
    if (existingDocument.is_verified) {
      return <Badge className="bg-green-500">Verified</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  const isExpired = existingDocument?.expiry_date && new Date(existingDocument.expiry_date) < new Date();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {label}
          {isRequired && <span className="text-destructive">*</span>}
        </CardTitle>
        {getStatusBadge()}
      </CardHeader>
      <CardContent>
        {existingDocument ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground truncate flex-1 mr-2">
                {existingDocument.file_name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(existingDocument.file_url, '_blank')}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </div>
            {existingDocument.expiry_date && (
              <Alert variant={isExpired ? 'destructive' : 'default'}>
                <AlertDescription>
                  {isExpired ? 'Expired: ' : 'Expires: '}
                  {new Date(existingDocument.expiry_date).toLocaleDateString()}
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {allowCustomType && (
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="w-full p-2 text-sm border rounded-md bg-background"
                disabled={!driverId}
              >
                <option value="other">Other Document</option>
                <option value="emirates_id_front">Emirates ID (Front)</option>
                <option value="emirates_id_back">Emirates ID (Back)</option>
                <option value="driving_license_front">Driving License (Front)</option>
                <option value="driving_license_back">Driving License (Back)</option>
                <option value="passport_bio_page">Passport (Bio Page)</option>
                <option value="visa_page">Visa Page</option>
                <option value="residence_permit">Residence Permit</option>
                <option value="employment_letter">Employment Letter</option>
                <option value="salary_certificate">Salary Certificate</option>
              </select>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              onChange={handleFileSelect}
              className="text-sm w-full"
              disabled={!driverId}
            />
            {!driverId && (
              <p className="text-xs text-muted-foreground">
                Save the driver first to enable document uploads
              </p>
            )}
            {file && driverId && (
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
