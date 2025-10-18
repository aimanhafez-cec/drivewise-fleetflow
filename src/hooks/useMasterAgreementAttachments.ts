import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MasterAgreementAttachment {
  id: string;
  agreement_id: string;
  attachment_type: 'url' | 'file' | 'image' | 'video';
  description: string | null;
  file_name: string | null;
  file_path: string | null;
  file_size: number | null;
  file_url: string | null;
  mime_type: string | null;
  entered_by: string | null;
  created_at: string;
  updated_at: string;
  entered_by_name?: string;
}

export interface AddAttachmentParams {
  agreement_id: string;
  attachment_type: 'url' | 'file' | 'image' | 'video';
  description?: string;
  file?: File;
  file_url?: string;
}

export const useMasterAgreementAttachments = (agreementId?: string) => {
  const queryClient = useQueryClient();

  // Fetch attachments
  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ['master-agreement-attachments', agreementId],
    queryFn: async () => {
      if (!agreementId) return [];

      const { data, error } = await supabase
        .from('master_agreement_attachments')
        .select(`
          *,
          profiles!master_agreement_attachments_entered_by_fkey (
            full_name
          )
        `)
        .eq('agreement_id', agreementId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(att => ({
        ...att,
        entered_by_name: att.profiles?.full_name || 'Unknown'
      })) as MasterAgreementAttachment[];
    },
    enabled: !!agreementId,
  });

  // Upload file to storage
  const uploadFile = async (file: File, agreementId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${agreementId}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('master-agreement-attachments')
      .upload(fileName, file);

    if (error) throw error;
    return fileName;
  };

  // Get download URL for file
  const getDownloadUrl = (filePath: string): string => {
    const { data } = supabase.storage
      .from('master-agreement-attachments')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  // Add attachment mutation
  const addAttachmentMutation = useMutation({
    mutationFn: async (params: AddAttachmentParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get profile id
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let filePath: string | null = null;
      let fileUrl: string | null = null;
      let fileName: string | null = null;
      let fileSize: number | null = null;
      let mimeType: string | null = null;

      // Handle file upload
      if (params.file) {
        filePath = await uploadFile(params.file, params.agreement_id);
        fileUrl = getDownloadUrl(filePath);
        fileName = params.file.name;
        fileSize = params.file.size;
        mimeType = params.file.type;
      } else if (params.file_url) {
        fileUrl = params.file_url;
      }

      const { data, error } = await supabase
        .from('master_agreement_attachments')
        .insert({
          agreement_id: params.agreement_id,
          attachment_type: params.attachment_type,
          description: params.description || null,
          file_name: fileName,
          file_path: filePath,
          file_size: fileSize,
          file_url: fileUrl,
          mime_type: mimeType,
          entered_by: profile?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-agreement-attachments', agreementId] });
      toast.success("Attachment added successfully");
    },
    onError: (error: Error) => {
      console.error("Error adding attachment:", error);
      toast.error("Failed to add attachment: " + error.message);
    },
  });

  // Delete attachment mutation
  const deleteAttachmentMutation = useMutation({
    mutationFn: async (attachmentId: string) => {
      // Get attachment details first
      const { data: attachment, error: fetchError } = await supabase
        .from('master_agreement_attachments')
        .select('file_path')
        .eq('id', attachmentId)
        .single();

      if (fetchError) throw fetchError;

      // Delete file from storage if exists
      if (attachment?.file_path) {
        const { error: storageError } = await supabase.storage
          .from('master-agreement-attachments')
          .remove([attachment.file_path]);
        
        if (storageError) console.error("Storage deletion error:", storageError);
      }

      // Delete database record
      const { error } = await supabase
        .from('master_agreement_attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-agreement-attachments', agreementId] });
      toast.success("Attachment deleted successfully");
    },
    onError: (error: Error) => {
      console.error("Error deleting attachment:", error);
      toast.error("Failed to delete attachment: " + error.message);
    },
  });

  // Download file helper
  const downloadFile = async (attachment: MasterAgreementAttachment) => {
    if (attachment.attachment_type === 'url') {
      window.open(attachment.file_url || '', '_blank');
      return;
    }

    if (attachment.file_path) {
      const { data, error } = await supabase.storage
        .from('master-agreement-attachments')
        .download(attachment.file_path);

      if (error) {
        toast.error("Failed to download file");
        return;
      }

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return {
    attachments,
    isLoading,
    addAttachment: addAttachmentMutation.mutate,
    isAddingAttachment: addAttachmentMutation.isPending,
    deleteAttachment: deleteAttachmentMutation.mutate,
    isDeletingAttachment: deleteAttachmentMutation.isPending,
    downloadFile,
  };
};
