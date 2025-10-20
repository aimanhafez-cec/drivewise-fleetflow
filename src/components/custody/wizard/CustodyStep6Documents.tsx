import { DocumentUploader } from "../DocumentUploader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText } from "lucide-react";
import type { CustodyTransactionCreate } from "@/lib/api/custody";

interface CustodyStep6Props {
  formData: Partial<CustodyTransactionCreate>;
  updateFormData: (data: Partial<CustodyTransactionCreate>) => void;
  documentIds: string[];
  setDocumentIds: (ids: string[]) => void;
}

export function CustodyStep6Documents({
  formData,
  updateFormData,
  documentIds,
  setDocumentIds,
}: CustodyStep6Props) {
  return (
    <div className="space-y-6">
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Upload relevant documents such as incident reports, photos of damage, police
          reports, customer acknowledgment forms, etc. Documents can also be added after
          creating the custody transaction.
        </AlertDescription>
      </Alert>

      <DocumentUploader
        documents={[]}
        onUpload={async (file, type, category) => {
          console.log("Upload", file, type, category);
          // Implementation will be added when custody ID is available
        }}
        onDelete={(docId) => {
          setDocumentIds(documentIds.filter((id) => id !== docId));
        }}
        onView={(url) => {
          window.open(url, "_blank");
        }}
      />

      {documentIds.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <h4 className="font-medium mb-1">No documents uploaded yet</h4>
          <p className="text-sm text-muted-foreground">
            You can upload documents now or add them later
          </p>
        </div>
      )}

      {documentIds.length > 0 && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <h4 className="font-medium mb-2">Uploaded Documents</h4>
          <div className="space-y-2">
            {documentIds.map((docId, index) => (
              <div
                key={docId}
                className="flex items-center justify-between text-sm p-2 bg-background rounded"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Document {index + 1}</span>
                </div>
                <span className="text-xs text-muted-foreground">{docId}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
