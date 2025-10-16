-- Create quote_attachments table
CREATE TABLE quote_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  attachment_type TEXT NOT NULL CHECK (attachment_type IN ('url', 'file', 'image', 'video')),
  description TEXT,
  file_name TEXT,
  file_path TEXT,
  file_size INTEGER,
  file_url TEXT,
  mime_type TEXT,
  entered_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_quote_attachments_quote_id ON quote_attachments(quote_id);
CREATE INDEX idx_quote_attachments_type ON quote_attachments(attachment_type);

-- Enable RLS
ALTER TABLE quote_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can manage all attachments"
ON quote_attachments
FOR ALL
USING (true);

CREATE POLICY "Customers can view their quote attachments"
ON quote_attachments
FOR SELECT
USING (
  quote_id IN (
    SELECT id FROM quotes 
    WHERE customer_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  )
);

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('quote-attachments', 'quote-attachments', false);

-- Storage RLS Policies
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'quote-attachments');

CREATE POLICY "Users can view their quote attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'quote-attachments');

CREATE POLICY "Staff can delete attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'quote-attachments');

-- Update trigger
CREATE TRIGGER update_quote_attachments_updated_at
BEFORE UPDATE ON quote_attachments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();