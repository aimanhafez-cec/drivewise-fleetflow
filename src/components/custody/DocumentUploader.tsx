import { useState, useCallback } from 'react';
import { Upload, File, X, CheckCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DocumentType, DocumentCategory } from '@/lib/api/custody';

interface DocumentUploaderProps {
  documents: Array<{
    id: string;
    document_type: DocumentType;
    document_category: DocumentCategory;
    file_name: string;
    file_url: string;
    esign_status?: 'pending' | 'signed' | 'declined';
  }>;
  onUpload: (file: File, type: DocumentType, category: DocumentCategory) => Promise<void>;
  onDelete: (docId: string) => void;
  onView: (url: string) => void;
  disabled?: boolean;
}

const requiredDocTypes: Array<{ type: DocumentType; label: string }> = [
  { type: 'customer_acknowledgment', label: 'Customer Acknowledgment' },
  { type: 'incident_report', label: 'Incident Report' },
  { type: 'handover_checklist', label: 'Handover Checklist' },
];

const optionalDocTypes: Array<{ type: DocumentType; label: string }> = [
  { type: 'photos', label: 'Photos' },
  { type: 'police_report', label: 'Police Report' },
  { type: 'insurance_docs', label: 'Insurance Documents' },
  { type: 'signature', label: 'Signature' },
];

export function DocumentUploader({
  documents,
  onUpload,
  onDelete,
  onView,
  disabled = false,
}: DocumentUploaderProps) {
  const [uploading, setUploading] = useState<{ [key: string]: number }>({});
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, type: DocumentType, category: DocumentCategory) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        await handleFiles(files, type, category);
      }
    },
    [disabled]
  );

  const handleFiles = async (
    files: File[],
    type: DocumentType,
    category: DocumentCategory
  ) => {
    for (const file of files) {
      const uploadKey = `${type}-${Date.now()}`;
      
      try {
        setUploading((prev) => ({ ...prev, [uploadKey]: 0 }));
        
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploading((prev) => {
            const current = prev[uploadKey] || 0;
            if (current >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return { ...prev, [uploadKey]: current + 10 };
          });
        }, 200);

        await onUpload(file, type, category);
        
        clearInterval(progressInterval);
        setUploading((prev) => ({ ...prev, [uploadKey]: 100 }));
        
        setTimeout(() => {
          setUploading((prev) => {
            const newState = { ...prev };
            delete newState[uploadKey];
            return newState;
          });
        }, 1000);
      } catch (error) {
        console.error('Upload failed:', error);
        setUploading((prev) => {
          const newState = { ...prev };
          delete newState[uploadKey];
          return newState;
        });
      }
    }
  };

  const getDocsByType = (type: DocumentType) => {
    return documents.filter((d) => d.document_type === type);
  };

  const renderDocumentSection = (
    type: DocumentType,
    label: string,
    category: DocumentCategory
  ) => {
    const docs = getDocsByType(type);
    const hasUploading = Object.keys(uploading).some((key) => key.startsWith(type));

    return (
      <div key={type} className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">{label}</label>
            <Badge variant={category === 'required' ? 'destructive' : 'secondary'}>
              {category === 'required' ? 'Required' : 'Optional'}
            </Badge>
            {category === 'required' && docs.length > 0 && (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </div>
        </div>

        {/* Drop Zone */}
        <div
          className={`
            relative rounded-lg border-2 border-dashed p-4 transition-colors
            ${dragActive ? 'border-primary bg-primary/5' : 'border-muted'}
            ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-primary'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={(e) => handleDrop(e, type, category)}
          onClick={() => {
            if (!disabled) {
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = type === 'photos' ? 'image/*' : '.pdf,.doc,.docx';
              input.onchange = async (e) => {
                const files = Array.from((e.target as HTMLInputElement).files || []);
                await handleFiles(files, type, category);
              };
              input.click();
            }
          }}
        >
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <Upload className="h-8 w-8" />
            <p>
              Drop files here or <span className="text-primary">browse</span>
            </p>
            <p className="text-xs">
              {type === 'photos' ? 'Images only' : 'PDF, Word documents'}
            </p>
          </div>
        </div>

        {/* Upload Progress */}
        {hasUploading && (
          <div className="space-y-2">
            {Object.entries(uploading)
              .filter(([key]) => key.startsWith(type))
              .map(([key, progress]) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-1" />
                </div>
              ))}
          </div>
        )}

        {/* Uploaded Documents */}
        {docs.length > 0 && (
          <div className="space-y-2">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-md border bg-card p-2"
              >
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{doc.file_name}</span>
                  {doc.esign_status === 'signed' && (
                    <Badge className="bg-green-100 text-green-800">Signed</Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(doc.file_url);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {!disabled && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(doc.id);
                      }}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Required Documents */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Required Documents</h3>
        {requiredDocTypes.map((doc) =>
          renderDocumentSection(doc.type, doc.label, 'required')
        )}
      </div>

      {/* Optional Documents */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Optional Documents</h3>
        {optionalDocTypes.map((doc) =>
          renderDocumentSection(doc.type, doc.label, 'optional')
        )}
      </div>
    </div>
  );
}
