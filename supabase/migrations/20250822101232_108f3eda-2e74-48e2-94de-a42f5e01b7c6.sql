-- Insert sample data for legal entities
INSERT INTO public.legal_entities (name, code, tax_registration_no, country_code, currency, vat_rate) VALUES
('CEC Car Rental LLC', 'CEC001', 'TRN123456789012345', 'AE', 'AED', 5.0),
('CEC Fleet Management', 'CEC002', 'TRN123456789012346', 'AE', 'AED', 5.0),
('CEC Corporate Services', 'CEC003', 'TRN123456789012347', 'AE', 'AED', 5.0);

-- Insert sample customer sites (assuming we have customer IDs from existing customers table)
-- Note: These will need actual customer IDs from your customers table
-- You can run a query to get customer IDs and update these inserts accordingly