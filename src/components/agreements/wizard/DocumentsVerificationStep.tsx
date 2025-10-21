import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DocumentUploader } from '@/components/agreements/shared/DocumentUploader';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { EnhancedWizardData } from '@/types/agreement-wizard';
import type { DocumentType, DocumentSide } from '@/lib/api/agreement-documents';

interface DocumentsVerificationStepProps {
  data: EnhancedWizardData['step6'];
  onChange: (field: keyof EnhancedWizardData['step6'], value: any) => void;
  errors?: string[];
}

export const DocumentsVerificationStep: React.FC<DocumentsVerificationStepProps> = ({
  data,
  onChange,
  errors = [],
}) => {
  const [previewDocument, setPreviewDocument] = useState<any | null>(null);

  // Convert DocumentUpload[] to Document[] format expected by DocumentUploader
  const documentsForUploader = data.documents.map((doc, index) => ({
    id: `doc-${doc.type}-${doc.side || 'main'}-${index}`,
    type: doc.type,
    side: doc.side,
    url: doc.url,
    status: doc.verificationStatus,
    rejectionReason: doc.rejectionReason,
  }));

  const handleUpload = async (type: DocumentType, side: DocumentSide | undefined, file: File) => {
    // In production, upload to storage and get URL
    // For now, create a mock URL from the file
    const reader = new FileReader();
    reader.onload = (e) => {
      const newDocument = {
        type,
        side,
        url: e.target?.result as string,
        uploadedAt: new Date().toISOString(),
        verificationStatus: 'pending' as const,
      };
      onChange('documents', [...data.documents, newDocument]);

      // Auto-verify for demo purposes
      if (type === 'emirates_id') {
        onChange('emiratesIdVerified', true);
      } else if (type === 'license') {
        onChange('licenseVerified', true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (id: string) => {
    // Extract type and side from the id
    const [, type, side] = id.match(/doc-(\w+)-(\w+)-/) || [];
    onChange('documents', data.documents.filter((doc, index) => 
      `doc-${doc.type}-${doc.side || 'main'}-${index}` !== id
    ));
  };

  const handlePreview = (document: any) => {
    setPreviewDocument(document);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Documents & Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentUploader
            documents={documentsForUploader}
            onUpload={handleUpload}
            onRemove={handleRemove}
            onPreview={handlePreview}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Emirates ID Verification</Label>
            <Badge variant={data.emiratesIdVerified ? 'default' : 'secondary'}>
              {data.emiratesIdVerified ? '✅ Verified' : '⏳ Pending'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <Label>License Verification</Label>
            <Badge variant={data.licenseVerified ? 'default' : 'secondary'}>
              {data.licenseVerified ? '✅ Verified' : '⏳ Pending'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <Label>Black Points Check</Label>
            <Badge variant={data.blackPointsChecked ? 'default' : 'secondary'}>
              {data.blackPointsChecked 
                ? `✅ Checked (${data.blackPointsCount || 0} points)` 
                : '⏳ Pending'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <Label>Eligibility Status</Label>
            <Badge variant={data.eligibilityStatus === 'eligible' ? 'default' : 'destructive'}>
              {data.eligibilityStatus.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewDocument} onOpenChange={() => setPreviewDocument(null)}>
        <DialogContent className="max-w-4xl">
          {previewDocument && (
            <img
              src={previewDocument.url}
              alt="Document preview"
              className="w-full h-auto"
            />
          )}
        </DialogContent>
      </Dialog>

      {errors.length > 0 && (
        <div className="text-sm text-destructive">
          {errors.map((error, i) => (
            <div key={i}>{error}</div>
          ))}
        </div>
      )}
    </div>
  );
};
