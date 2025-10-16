import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, File, Image, Video, Eye, Trash, FileText, Upload, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useQuoteAttachments } from "@/hooks/useQuoteAttachments";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface QuoteAttachmentsProps {
  quoteId?: string;
}

const FILE_TYPES = {
  file: {
    accept: '.pdf,.zip,.jpg,.png,.jpeg',
    maxSize: 6 * 1024 * 1024, // 6MB
    label: 'PDF, ZIP, JPG, PNG, JPEG (max 6MB)'
  },
  image: {
    accept: '.jpg,.png,.jpeg',
    maxSize: 6 * 1024 * 1024,
    label: 'JPG, PNG, JPEG (max 6MB)'
  },
  video: {
    accept: '.mp4,.mov,.avi',
    maxSize: 20 * 1024 * 1024, // 20MB
    label: 'MP4, MOV, AVI (max 20MB)'
  }
};

export const QuoteAttachments: React.FC<QuoteAttachmentsProps> = ({ quoteId }) => {
  const [attachmentType, setAttachmentType] = useState<'url' | 'file' | 'image' | 'video'>('file');
  const [description, setDescription] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<string | null>(null);

  const {
    attachments,
    isLoading,
    addAttachment,
    isAddingAttachment,
    deleteAttachment,
    isDeletingAttachment,
    downloadFile,
  } = useQuoteAttachments(quoteId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const typeConfig = FILE_TYPES[attachmentType as keyof typeof FILE_TYPES];
    if (file.size > typeConfig.maxSize) {
      toast.error(`File size exceeds ${typeConfig.maxSize / (1024 * 1024)}MB limit`);
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleSave = () => {
    if (!quoteId) {
      toast.error("Quote ID is required");
      return;
    }

    if (attachmentType === 'url') {
      if (!urlInput.trim()) {
        toast.error("Please enter a URL");
        return;
      }
      
      try {
        new URL(urlInput);
      } catch {
        toast.error("Please enter a valid URL");
        return;
      }

      addAttachment({
        quote_id: quoteId,
        attachment_type: 'url',
        description,
        file_url: urlInput,
      });
    } else {
      if (!selectedFile) {
        toast.error("Please select a file");
        return;
      }

      addAttachment({
        quote_id: quoteId,
        attachment_type: attachmentType,
        description,
        file: selectedFile,
      });
    }

    // Reset form
    setDescription('');
    setUrlInput('');
    setSelectedFile(null);
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleDeleteClick = (attachmentId: string) => {
    setAttachmentToDelete(attachmentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (attachmentToDelete) {
      deleteAttachment(attachmentToDelete);
      setDeleteDialogOpen(false);
      setAttachmentToDelete(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'url':
        return <Link className="h-4 w-4 text-blue-600" />;
      case 'file':
        return <File className="h-4 w-4 text-gray-600" />;
      case 'image':
        return <Image className="h-4 w-4 text-green-600" />;
      case 'video':
        return <Video className="h-4 w-4 text-purple-600" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Add New Attachment */}
      <Card>
        <CardHeader>
          <CardTitle>Add Attachment</CardTitle>
          <CardDescription>Upload files or add links to supporting documents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Attachment Type Selector */}
          <div className="space-y-2">
            <Label htmlFor="attachment-type">Attachment Type</Label>
            <Select value={attachmentType} onValueChange={(value: any) => setAttachmentType(value)}>
              <SelectTrigger id="attachment-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="file">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    <span>File</span>
                  </div>
                </SelectItem>
                <SelectItem value="image">
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    <span>Image</span>
                  </div>
                </SelectItem>
                <SelectItem value="video">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    <span>Video</span>
                  </div>
                </SelectItem>
                <SelectItem value="url">
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    <span>URL</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dynamic Input Fields */}
          {attachmentType === 'url' ? (
            <div className="space-y-2">
              <Label htmlFor="url-input">URL</Label>
              <Input
                id="url-input"
                type="url"
                placeholder="https://example.com/document.pdf"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="file-input">File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file-input"
                  type="file"
                  accept={FILE_TYPES[attachmentType as keyof typeof FILE_TYPES].accept}
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {selectedFile && (
                  <span className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {FILE_TYPES[attachmentType as keyof typeof FILE_TYPES].label}
              </p>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a description for this attachment..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/500
            </p>
          </div>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={isAddingAttachment || !quoteId}>
            {isAddingAttachment ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Save Attachment
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Attachments List */}
      <Card>
        <CardHeader>
          <CardTitle>Attachments</CardTitle>
          <CardDescription>
            {attachments.length} attachment{attachments.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : attachments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No attachments added yet</p>
              <p className="text-sm mt-1">Add supporting documents, images, or links to this quote</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Entered By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attachments.map((attachment) => (
                    <TableRow key={attachment.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(attachment.attachment_type)}
                          <span className="capitalize">{attachment.attachment_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{attachment.entered_by_name}</TableCell>
                      <TableCell>
                        {format(new Date(attachment.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div>
                          {attachment.file_name || attachment.file_url || 'N/A'}
                          {attachment.file_size && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({formatFileSize(attachment.file_size)})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {attachment.description || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadFile(attachment)}
                            title="View/Download"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(attachment.id)}
                            disabled={isDeletingAttachment}
                            title="Delete"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attachment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this attachment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
