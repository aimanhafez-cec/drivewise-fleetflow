import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AgreementDocumentsAPI, UploadDocumentData, VerifyDocumentData } from '@/lib/api/agreement-documents';
import { toast } from 'sonner';

export const useAgreementDocuments = (agreementId?: string) => {
  return useQuery({
    queryKey: ['agreement-documents', agreementId],
    queryFn: () => AgreementDocumentsAPI.listDocuments(agreementId!),
    enabled: !!agreementId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useAgreementDocument = (documentId?: string) => {
  return useQuery({
    queryKey: ['agreement-documents', documentId],
    queryFn: () => AgreementDocumentsAPI.getDocument(documentId!),
    enabled: !!documentId,
    staleTime: 30 * 1000,
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UploadDocumentData) => AgreementDocumentsAPI.uploadDocument(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agreement-documents', data.agreement_id] });
      queryClient.invalidateQueries({ queryKey: ['agreement-documents', 'requirements', data.agreement_id] });
      toast.success('Document uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to upload document: ${error.message}`);
    },
  });
};

export const useVerifyDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, data }: { documentId: string; data: VerifyDocumentData }) =>
      AgreementDocumentsAPI.verifyDocument(documentId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agreement-documents'] });
      queryClient.invalidateQueries({ queryKey: ['agreement-documents', 'requirements', data.agreement_id] });
      toast.success(`Document ${data.verification_status === 'verified' ? 'verified' : 'rejected'}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to verify document: ${error.message}`);
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => AgreementDocumentsAPI.deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agreement-documents'] });
      toast.success('Document deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete document: ${error.message}`);
    },
  });
};

export const useRequiredDocumentsCheck = (agreementId?: string) => {
  return useQuery({
    queryKey: ['agreement-documents', 'requirements', agreementId],
    queryFn: () => AgreementDocumentsAPI.checkRequiredDocuments(agreementId!),
    enabled: !!agreementId,
    staleTime: 30 * 1000,
  });
};
