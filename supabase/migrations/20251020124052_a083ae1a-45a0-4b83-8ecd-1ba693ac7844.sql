-- Create storage bucket for custody documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('custody-documents', 'custody-documents', false);

-- RLS policies for custody-documents bucket
CREATE POLICY "Staff can upload custody documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'custody-documents');

CREATE POLICY "Staff can view custody documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'custody-documents');

CREATE POLICY "Staff can update custody documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'custody-documents');

CREATE POLICY "Staff can delete custody documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'custody-documents');