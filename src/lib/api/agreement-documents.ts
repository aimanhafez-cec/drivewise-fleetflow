import { supabase } from '@/integrations/supabase/client';

export type DocumentType = 'emirates_id' | 'passport' | 'license' | 'visa' | 'additional_driver' | 'other';
export type DocumentSide = 'front' | 'back' | 'bio_page' | 'visa_page';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface AgreementDocument {
  id: string;
  agreement_id: string;
  document_type: DocumentType;
  document_side?: DocumentSide;
  file_url: string;
  uploaded_at: string;
  uploaded_by?: string;
  verification_status: VerificationStatus;
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  extracted_data?: Record<string, any>;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}

export interface UploadDocumentData {
  agreement_id: string;
  document_type: DocumentType;
  document_side?: DocumentSide;
  file: File;
  expiry_date?: string;
}

export interface VerifyDocumentData {
  verification_status: VerificationStatus;
  rejection_reason?: string;
  extracted_data?: Record<string, any>;
}

export const AgreementDocumentsAPI = {
  // List all documents for an agreement
  async listDocuments(agreementId: string) {
    const { data, error } = await supabase
      .from('agreement_documents')
      .select('*')
      .eq('agreement_id', agreementId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as AgreementDocument[];
  },

  // Get a single document
  async getDocument(documentId: string) {
    const { data, error } = await supabase
      .from('agreement_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) throw error;
    return data as AgreementDocument;
  },

  // Upload a document
  async uploadDocument(uploadData: UploadDocumentData) {
    const { agreement_id, document_type, document_side, file, expiry_date } = uploadData;

    // Upload file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${agreement_id}/${document_type}_${document_side || 'main'}_${Date.now()}.${fileExt}`;
    
    const { data: uploadResult, error: uploadError } = await supabase.storage
      .from('agreement-documents')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('agreement-documents')
      .getPublicUrl(fileName);

    // Create document record
    const { data, error } = await supabase
      .from('agreement_documents')
      .insert({
        agreement_id,
        document_type,
        document_side,
        file_url: publicUrl,
        expiry_date,
      })
      .select()
      .single();

    if (error) throw error;
    return data as AgreementDocument;
  },

  // Verify a document
  async verifyDocument(documentId: string, verificationData: VerifyDocumentData) {
    const { data, error } = await supabase
      .from('agreement_documents')
      .update({
        verification_status: verificationData.verification_status,
        rejection_reason: verificationData.rejection_reason,
        extracted_data: verificationData.extracted_data,
        verified_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .select()
      .single();

    if (error) throw error;
    return data as AgreementDocument;
  },

  // Delete a document
  async deleteDocument(documentId: string) {
    const { error } = await supabase
      .from('agreement_documents')
      .delete()
      .eq('id', documentId);

    if (error) throw error;
  },

  // Check if required documents are uploaded
  async checkRequiredDocuments(agreementId: string) {
    const documents = await this.listDocuments(agreementId);
    
    const hasEmiratesId = documents.some(
      d => d.document_type === 'emirates_id' && 
      ['front', 'back'].every(side => 
        documents.some(doc => doc.document_type === 'emirates_id' && doc.document_side === side)
      )
    );

    const hasPassport = documents.some(d => d.document_type === 'passport');
    const hasLicense = documents.some(d => d.document_type === 'license');
    
    return {
      hasEmiratesId,
      hasPassport,
      hasLicense,
      hasRequiredDocs: hasEmiratesId && hasPassport && hasLicense,
      allVerified: documents
        .filter(d => ['emirates_id', 'passport', 'license'].includes(d.document_type))
        .every(d => d.verification_status === 'verified'),
    };
  },
};
