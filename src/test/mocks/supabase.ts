import { vi } from 'vitest';

export const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  })),
  rpc: vi.fn(),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(),
      remove: vi.fn(),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/file.pdf' } })),
    })),
  },
  auth: {
    getUser: vi.fn(),
    getSession: vi.fn(),
  },
  functions: {
    invoke: vi.fn(),
  },
};

export const mockCustodyTransaction = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  custody_no: 'CST-000001',
  status: 'draft' as const,
  customer_id: '123e4567-e89b-12d3-a456-426614174001',
  custodian_type: 'customer' as const,
  custodian_name: 'John Doe',
  custodian_contact: {
    phone: '+971501234567',
    email: 'john@example.com',
  },
  reason_code: 'maintenance' as const,
  incident_date: '2025-10-20T10:00:00Z',
  effective_from: '2025-10-20T10:00:00Z',
  expected_return_date: '2025-10-25T10:00:00Z',
  until_original_ready: false,
  rate_policy: 'inherit' as const,
  deposit_carryover: false,
  sla_breached: false,
  created_at: '2025-10-20T09:00:00Z',
  updated_at: '2025-10-20T09:00:00Z',
};

export const mockCustodyDocument = {
  id: '123e4567-e89b-12d3-a456-426614174002',
  custody_id: '123e4567-e89b-12d3-a456-426614174000',
  document_type: 'customer_acknowledgment' as const,
  document_category: 'required' as const,
  file_url: 'https://example.com/doc.pdf',
  file_name: 'acknowledgment.pdf',
  file_size: 102400,
  mime_type: 'application/pdf',
  uploaded_at: '2025-10-20T09:00:00Z',
  metadata: {},
};

export const mockCustodyCharge = {
  id: '123e4567-e89b-12d3-a456-426614174003',
  custody_id: '123e4567-e89b-12d3-a456-426614174000',
  charge_type: 'admin_fee' as const,
  description: 'Administrative fee',
  quantity: 1,
  unit_price: 50,
  tax_rate: 5,
  tax_amount: 2.5,
  total_amount: 52.5,
  responsibility: 'customer' as const,
  status: 'draft' as const,
  created_at: '2025-10-20T09:00:00Z',
};

export const mockVehicle = {
  id: '123e4567-e89b-12d3-a456-426614174004',
  make: 'Toyota',
  model: 'Camry',
  year: 2023,
  license_plate: 'ABC123',
  vin: '1HGBH41JXMN109186',
  status: 'available',
  condition: 'excellent',
  registration_expiry: '2026-10-20',
};
