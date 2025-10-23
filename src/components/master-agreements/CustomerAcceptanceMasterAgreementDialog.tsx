import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useMasterAgreementAttachments } from "@/hooks/useMasterAgreementAttachments";

interface CustomerAcceptanceMasterAgreementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agreementId: string;
  agreementNumber: string;
}

export const CustomerAcceptanceMasterAgreementDialog: React.FC<CustomerAcceptanceMasterAgreementDialogProps> = ({
  open,
  onOpenChange,
  agreementId,
  agreementNumber,
}) => {
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { addAttachment, isAddingAttachment } = useMasterAgreementAttachments(agreementId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const maxSize = 6 * 1024 * 1024; // 6MB
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 6MB',
        variant: 'destructive',
      });
      return;
    }
    
    setSelectedFile(file);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Update agreement to customer_signed status
      const { error: updateError } = await supabase
        .from('corporate_leasing_agreements')
        .update({
          customer_acceptance_status: 'signed',
          customer_signed_at: new Date().toISOString(),
          customer_comments: additionalNotes.trim() || null,
          status: 'customer_accepted',
        })
        .eq('id', agreementId);

      if (updateError) throw updateError;

      // Upload file if selected
      if (selectedFile) {
        try {
          await addAttachment({
            agreement_id: agreementId,
            attachment_type: 'file',
            description: 'Customer signed document',
            file: selectedFile,
          });
        } catch (attachmentError: any) {
          console.error('Failed to upload attachment:', attachmentError);
          toast({
            title: 'Warning',
            description: 'Agreement marked as signed, but file upload failed. You can add it manually in the Attachments tab.',
            variant: 'destructive',
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ['master-agreement', agreementId] });
      queryClient.invalidateQueries({ queryKey: ['master-agreements:list'] });

      toast({
        title: 'Customer Signature Recorded',
        description: `Master agreement ${agreementNumber} has been marked as signed.`,
      });

      onOpenChange(false);
      setAdditionalNotes("");
      setSelectedFile(null);
    } catch (error: any) {
      console.error("Failed to process signature:", error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to record customer signature',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Customer Signed Master Agreement
          </DialogTitle>
          <DialogDescription>
            Record that customer has signed master agreement {agreementNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="additional-notes">Signature Notes (Optional)</Label>
            <Textarea
              id="additional-notes"
              placeholder="Add any notes about the signing process..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="signature-attachment">
              Signed Document (Optional)
            </Label>
            <Input
              id="signature-attachment"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.zip"
              onChange={handleFileChange}
              className="mt-2"
            />
            {selectedFile && (
              <p className="text-xs text-muted-foreground mt-1">
                Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              PDF, JPG, PNG, ZIP (max 6MB)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isAddingAttachment}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting || isAddingAttachment ? "Saving..." : "Mark as Signed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
