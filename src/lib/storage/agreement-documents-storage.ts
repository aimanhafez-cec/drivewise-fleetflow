import { supabase } from '@/integrations/supabase/client';

/**
 * Storage utilities for agreement documents
 * Bucket: agreement-documents
 * Structure: {agreement_id}/{document_type}_{timestamp}.{ext}
 */

export const STORAGE_BUCKET = 'agreement-documents';

export interface UploadOptions {
  agreementId: string;
  documentType: string;
  file: File;
  onProgress?: (progress: number) => void;
}

export const AgreementDocumentsStorage = {
  /**
   * Upload a document to storage
   */
  async uploadDocument(options: UploadOptions): Promise<string> {
    const { agreementId, documentType, file, onProgress } = options;
    
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${agreementId}/${documentType}_${timestamp}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    return publicUrl;
  },

  /**
   * Delete a document from storage
   */
  async deleteDocument(fileUrl: string): Promise<void> {
    // Extract file path from URL
    const urlParts = fileUrl.split(`/${STORAGE_BUCKET}/`);
    if (urlParts.length !== 2) {
      throw new Error('Invalid file URL');
    }
    
    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) throw error;
  },

  /**
   * List all documents for an agreement
   */
  async listDocuments(agreementId: string): Promise<string[]> {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(agreementId);

    if (error) throw error;

    return data.map(file => {
      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(`${agreementId}/${file.name}`);
      return publicUrl;
    });
  },

  /**
   * Get signed URL for private document access (if bucket becomes private)
   */
  async getSignedUrl(fileUrl: string, expiresIn: number = 3600): Promise<string> {
    const urlParts = fileUrl.split(`/${STORAGE_BUCKET}/`);
    if (urlParts.length !== 2) {
      throw new Error('Invalid file URL');
    }
    
    const filePath = urlParts[1];

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, expiresIn);

    if (error) throw error;

    return data.signedUrl;
  },

  /**
   * Check if storage bucket exists and is accessible
   */
  async checkBucketAccess(): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage.getBucket(STORAGE_BUCKET);
      return !error && !!data;
    } catch {
      return false;
    }
  },
};
