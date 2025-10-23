import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface InspectionNotesAttachmentsProps {
  notes: string;
  attachments: Array<{
    id: string;
    url: string;
    filename: string;
    type: string;
  }>;
  onChange: (notes: string, attachments: any[]) => void;
}

export function InspectionNotesAttachments({
  notes,
  attachments,
  onChange
}: InspectionNotesAttachmentsProps) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      filename: file.name,
      type: file.type
    }));
    onChange(notes, [...attachments, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    onChange(notes, attachments.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-dashed p-4 bg-muted/50">
        <p className="text-sm font-medium mb-2">Additional Information:</p>
        <p className="text-sm text-muted-foreground">
          Add any notes and upload documents like printed inspection cards or supporting files
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Enter any additional notes or observations..."
          value={notes}
          onChange={(e) => onChange(e.target.value, attachments)}
          rows={6}
        />
        <p className="text-sm text-muted-foreground">
          Add any relevant information about the inspection
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Label>Attachments</Label>
            <Badge variant="secondary">{attachments.length} files</Badge>
          </div>

          <Button variant="outline" size="sm" className="relative w-full">
            <Upload className="h-4 w-4 mr-2" />
            Upload Files (PDF, Images, Documents)
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileUpload}
            />
          </Button>

          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <Card key={attachment.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{attachment.filename}</p>
                          <p className="text-xs text-muted-foreground">{attachment.type}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => removeAttachment(attachment.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Upload printed inspection cards or any supporting documentation
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
