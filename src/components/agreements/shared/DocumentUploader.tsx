import { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Upload, Camera, FileText, CheckCircle, XCircle, Clock, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { DocumentType, DocumentSide, VerificationStatus } from '@/lib/api/agreement-documents';

interface Document {
  id: string;
  type: DocumentType;
  side?: DocumentSide;
  url: string;
  status: VerificationStatus;
  rejectionReason?: string;
}

interface DocumentUploaderProps {
  documents: Document[];
  onUpload: (type: DocumentType, side: DocumentSide | undefined, file: File) => Promise<void>;
  onRemove: (id: string) => void;
  onPreview: (document: Document) => void;
  disabled?: boolean;
}

const requiredDocuments = [
  { type: 'emirates_id' as DocumentType, label: 'Emirates ID', sides: ['front', 'back'] as DocumentSide[] },
  { type: 'passport' as DocumentType, label: 'Passport', sides: ['bio_page'] as DocumentSide[] },
  { type: 'license' as DocumentType, label: 'Driving License', sides: ['front', 'back'] as DocumentSide[] },
];

const getStatusIcon = (status: VerificationStatus) => {
  switch (status) {
    case 'verified':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-yellow-500" />;
  }
};

const getStatusBadge = (status: VerificationStatus) => {
  const variants = {
    verified: 'bg-green-500/10 text-green-700 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-700 border-red-500/20',
    pending: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  };

  return (
    <Badge variant="outline" className={variants[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export const DocumentUploader = ({
  documents,
  onUpload,
  onRemove,
  onPreview,
  disabled = false,
}: DocumentUploaderProps) => {
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const cameraInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const getDocument = (type: DocumentType, side?: DocumentSide) => {
    return documents.find(d => d.type === type && d.side === side);
  };

  const handleFileSelect = async (type: DocumentType, side: DocumentSide | undefined, file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload JPEG, PNG, HEIC, or PDF');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadingType(`${type}_${side || 'main'}`);

    try {
      await onUpload(type, side, file);
      toast.success('Document uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload document');
      console.error(error);
    } finally {
      setUploadingType(null);
    }
  };

  const triggerFileUpload = (type: DocumentType, side?: DocumentSide) => {
    const key = `${type}_${side || 'main'}`;
    fileInputRefs.current[key]?.click();
  };

  const triggerCameraCapture = (type: DocumentType, side?: DocumentSide) => {
    const key = `${type}_${side || 'main'}`;
    cameraInputRefs.current[key]?.click();
  };

  return (
    <div className="space-y-6">
      {requiredDocuments.map((docConfig) => (
        <Card key={docConfig.type}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">{docConfig.label}</Label>
                {docConfig.sides.every(side => getDocument(docConfig.type, side)) && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {docConfig.sides.map((side) => {
                  const document = getDocument(docConfig.type, side);
                  const key = `${docConfig.type}_${side}`;
                  const isUploading = uploadingType === key;

                  return (
                    <div key={side} className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        {side.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </Label>

                      {document ? (
                        <div className="relative border-2 border-input rounded-lg overflow-hidden group">
                          <img
                            src={document.url}
                            alt={`${docConfig.label} ${side}`}
                            className="w-full aspect-video object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => onPreview(document)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!disabled && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => onRemove(document.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <div className="absolute top-2 right-2">
                            {getStatusBadge(document.status)}
                          </div>
                          {document.status === 'rejected' && document.rejectionReason && (
                            <div className="absolute bottom-0 left-0 right-0 bg-red-500/90 text-white p-2 text-xs">
                              {document.rejectionReason}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-input rounded-lg p-4">
                          <div className="flex flex-col items-center gap-2 text-center">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              {isUploading ? 'Uploading...' : 'No document uploaded'}
                            </p>
                            {!disabled && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => triggerCameraCapture(docConfig.type, side)}
                                  disabled={isUploading}
                                >
                                  <Camera className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => triggerFileUpload(docConfig.type, side)}
                                  disabled={isUploading}
                                >
                                  <Upload className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Hidden inputs */}
                      <input
                        ref={(el) => (fileInputRefs.current[key] = el)}
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(docConfig.type, side, file);
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                      <input
                        ref={(el) => (cameraInputRefs.current[key] = el)}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(docConfig.type, side, file);
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Document Verification Status</p>
              <p className="text-sm text-muted-foreground">
                {documents.filter(d => d.status === 'verified').length} of{' '}
                {requiredDocuments.reduce((acc, doc) => acc + doc.sides.length, 0)} documents verified
              </p>
            </div>
            <div className="flex gap-2">
              {getStatusIcon(
                documents.every(d => d.status === 'verified')
                  ? 'verified'
                  : documents.some(d => d.status === 'rejected')
                  ? 'rejected'
                  : 'pending'
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
