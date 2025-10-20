# Custody Management System - API Documentation

## Overview

This document provides comprehensive documentation for the Custody Management System API, including Edge Functions, database queries, and integration points.

---

## Table of Contents

1. [Edge Functions](#edge-functions)
2. [Database Tables](#database-tables)
3. [RLS Policies](#rls-policies)
4. [Webhooks](#webhooks)
5. [Integrations](#integrations)
6. [Error Handling](#error-handling)

---

## Edge Functions

All Edge Functions are deployed to Supabase and accessible via:
```
https://tbmcmbldoaespjlhpfys.supabase.co/functions/v1/{function-name}
```

### Authentication

Most functions require authentication via JWT token:
```typescript
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { /* payload */ }
});
```

---

## 1. Cost Sheet Functions

### calculate-cost-sheet

**Purpose**: Calculate total costs for a cost sheet based on rates and quantities.

**Request:**
```typescript
{
  costSheetId: string;  // UUID of cost sheet
}
```

**Response:**
```typescript
{
  success: boolean;
  costSheet: {
    id: string;
    total_cost: number;
    total_price: number;
    items: CostSheetItem[];
  };
}
```

**Example:**
```typescript
const { data, error } = await supabase.functions.invoke('calculate-cost-sheet', {
  body: { costSheetId: 'abc-123-def-456' }
});
```

---

### submit-cost-sheet-approval

**Purpose**: Submit a cost sheet for approval workflow.

**Request:**
```typescript
{
  costSheetId: string;
  requestedBy: string;  // User ID
  notes?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  approvalId: string;
  status: 'pending' | 'approved' | 'rejected';
}
```

---

### approve-cost-sheet

**Purpose**: Approve or reject a cost sheet approval request.

**Request:**
```typescript
{
  approvalId: string;
  action: 'approve' | 'reject';
  comments?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  approval: {
    id: string;
    status: string;
    approved_at?: string;
    rejected_at?: string;
  };
}
```

---

### apply-cost-sheet-rates

**Purpose**: Apply approved cost sheet rates to a quote.

**Request:**
```typescript
{
  costSheetId: string;
  quoteId: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  quote: {
    id: string;
    items: QuoteItem[];
    total: number;
  };
}
```

---

## 2. Quote Functions

### submit-quote-approval

**Purpose**: Submit a quote for approval before sending to customer.

**Request:**
```typescript
{
  quoteId: string;
  requestedBy: string;
  notes?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  approvalId: string;
  status: 'pending' | 'approved' | 'rejected';
}
```

---

### send-quote-to-customer

**Purpose**: Send an approved quote to the customer via email.

**Request:**
```typescript
{
  quoteId: string;
  customerEmail: string;
  message?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  sentAt: string;
  emailId: string;
}
```

---

## 3. Custody Functions

### custody-webhook

**Purpose**: Handle custody-related webhook events from external systems.

**Request:**
```typescript
{
  custody_id: string;
  integration_type: 'fleet' | 'billing' | 'claims';
  action: string;
  data?: Record<string, any>;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  log_id: string;
}
```

**Webhook Events:**
- `update_vehicle_status`: Update fleet management system
- `create_invoice`: Create billing invoice
- `submit_claim`: Submit insurance claim

---

### custody-notifications

**Purpose**: Send custody-related notifications to users.

**Request:**
```typescript
{
  custody_id: string;
  event_type: 'created' | 'status_changed' | 'document_uploaded' | 'approval_required' | 'sla_warning' | 'overdue';
  recipients?: string[];  // User IDs
  metadata?: Record<string, any>;
}
```

**Response:**
```typescript
{
  success: boolean;
  notificationsSent: number;
  recipients: string[];
}
```

---

### custody-scheduler

**Purpose**: Scheduled task runner for custody maintenance operations.

**Runs Automatically**: Every hour via pg_cron

**Operations Performed:**
- SLA checks and warnings
- Document expiry monitoring
- Failed webhook retries
- Auto-close overdue custodies

**Manual Invocation:**
```typescript
const { data } = await supabase.functions.invoke('custody-scheduler', {
  body: { manual: true }
});
```

**Response:**
```typescript
{
  success: boolean;
  results: {
    slaChecks: number;
    documentChecks: number;
    webhookRetries: number;
    autoClosed: number;
  };
}
```

---

## Database Tables

### Core Tables

#### custody_transactions
Main custody transaction records.

**Columns:**
- `id` (UUID, PK)
- `custody_number` (TEXT, UNIQUE)
- `customer_id` (UUID, FK)
- `vehicle_id` (UUID, FK)
- `status` (custody_status_enum)
- `start_date` (DATE)
- `expected_end_date` (DATE)
- `actual_end_date` (DATE)
- `total_charges` (DECIMAL)
- `total_paid` (DECIMAL)
- `balance` (DECIMAL)
- `created_by` (UUID)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Status Values:**
- `draft`
- `active`
- `on_hold`
- `completed`
- `cancelled`

---

#### custody_charges
Charges associated with custody transactions.

**Columns:**
- `id` (UUID, PK)
- `custody_id` (UUID, FK)
- `charge_type` (charge_type_enum)
- `description` (TEXT)
- `amount` (DECIMAL)
- `quantity` (DECIMAL)
- `total` (DECIMAL)
- `charge_date` (DATE)
- `created_at` (TIMESTAMPTZ)

**Charge Types:**
- `daily_rate`
- `storage_fee`
- `maintenance`
- `damage`
- `late_fee`
- `other`

---

#### custody_documents
Documents associated with custody transactions.

**Columns:**
- `id` (UUID, PK)
- `custody_id` (UUID, FK)
- `document_type` (TEXT)
- `file_name` (TEXT)
- `file_path` (TEXT)
- `file_size` (INTEGER)
- `uploaded_by` (UUID)
- `uploaded_at` (TIMESTAMPTZ)
- `expires_at` (TIMESTAMPTZ)

---

#### custody_approvals
Approval workflow records.

**Columns:**
- `id` (UUID, PK)
- `custody_id` (UUID, FK)
- `approval_type` (TEXT)
- `status` (approval_status_enum)
- `requested_by` (UUID)
- `approved_by` (UUID)
- `requested_at` (TIMESTAMPTZ)
- `approved_at` (TIMESTAMPTZ)
- `rejected_at` (TIMESTAMPTZ)
- `comments` (TEXT)

---

### Integration Tables

#### custody_integration_settings
External integration configurations.

**Columns:**
- `id` (UUID, PK)
- `integration_type` (TEXT)
- `integration_name` (TEXT)
- `webhook_url` (TEXT)
- `api_key` (TEXT)
- `settings` (JSONB)
- `is_active` (BOOLEAN)

---

#### custody_webhook_logs
Webhook call audit trail.

**Columns:**
- `id` (UUID, PK)
- `custody_id` (UUID, FK)
- `integration_id` (UUID, FK)
- `webhook_url` (TEXT)
- `payload` (JSONB)
- `response` (JSONB)
- `status_code` (INTEGER)
- `success` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)

---

## RLS Policies

### custody_transactions
- **SELECT**: Users can view their own custodies or if they have admin role
- **INSERT**: Authenticated users can create custodies
- **UPDATE**: Users can update their own custodies or if they have admin role
- **DELETE**: Admin role only

### custody_charges
- **SELECT**: Users can view charges for custodies they can access
- **INSERT**: Users can create charges for custodies they can access
- **UPDATE**: Users can update charges for custodies they can access
- **DELETE**: Admin role only

### custody_documents
- **SELECT**: Users can view documents for custodies they can access
- **INSERT**: Users can upload documents for custodies they can access
- **DELETE**: Users can delete their own documents or admin role

---

## Webhooks

### Registering Webhooks

1. Insert into `custody_integration_settings`:
```sql
INSERT INTO custody_integration_settings (
  integration_type,
  integration_name,
  webhook_url,
  api_key,
  is_active
) VALUES (
  'fleet',
  'Fleet Management System',
  'https://your-system.com/webhook',
  'your-api-key',
  true
);
```

2. Webhook will be called automatically on custody events

### Webhook Payload Format

```typescript
{
  event: string;
  custody: {
    id: string;
    custody_number: string;
    status: string;
    // ... other custody fields
  };
  action_data?: Record<string, any>;
  timestamp: string;
}
```

---

## Error Handling

### Standard Error Response

```typescript
{
  error: {
    code: string;
    message: string;
    details?: any;
  }
}
```

### Common Error Codes

- `AUTH_ERROR`: Authentication failed
- `PERMISSION_DENIED`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Input validation failed
- `DUPLICATE_ENTRY`: Unique constraint violation
- `INTERNAL_ERROR`: Server error

### Example Error Handling

```typescript
const { data, error } = await supabase.functions.invoke('function-name', {
  body: payload
});

if (error) {
  console.error('Function error:', error);
  if (error.message.includes('AUTH_ERROR')) {
    // Handle authentication error
  }
}
```

---

## Rate Limits

- **Edge Functions**: 500 requests per minute per IP
- **Database Queries**: No hard limit, but optimize for performance
- **Webhook Retries**: Maximum 3 retries with exponential backoff

---

## Best Practices

1. **Always handle errors gracefully**
2. **Use TypeScript types from `@/integrations/supabase/types`**
3. **Cache frequently accessed data**
4. **Batch operations when possible**
5. **Use RLS policies instead of application-level checks**
6. **Log important operations**
7. **Use transactions for multi-step operations**

---

## Support

For API issues:
- Check Edge Function logs: https://supabase.com/dashboard/project/tbmcmbldoaespjlhpfys/functions
- Review database logs: https://supabase.com/dashboard/project/tbmcmbldoaespjlhpfys/logs
- Check network requests in browser DevTools
