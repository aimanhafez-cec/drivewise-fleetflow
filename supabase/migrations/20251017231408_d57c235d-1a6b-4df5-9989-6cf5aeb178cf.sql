-- Add 'obsolete' status to cost_sheet_status enum
ALTER TYPE cost_sheet_status ADD VALUE IF NOT EXISTS 'obsolete';