# Cost & Compliance Module - Admin Setup Guide

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Database Setup](#database-setup)
3. [Initial Configuration](#initial-configuration)
4. [User Permissions](#user-permissions)
5. [Integration Setup](#integration-setup)
6. [Data Migration](#data-migration)
7. [Testing & Validation](#testing--validation)

---

## System Requirements

### Technical Requirements
- Node.js 18+ 
- Supabase account (Lovable Cloud)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Minimum 2GB RAM for optimal performance

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Database Setup

### 1. Required Tables

The Cost & Compliance module requires the following database tables:

#### tolls_fines
```sql
CREATE TABLE public.tolls_fines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  toll_fine_no TEXT UNIQUE NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id),
  driver_id UUID REFERENCES drivers(id),
  customer_id UUID REFERENCES profiles(id),
  contract_id UUID REFERENCES contracts(id),
  type TEXT CHECK (type IN ('toll', 'fine')),
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'AED',
  penalty_amount DECIMAL(10,2),
  total_amount DECIMAL(10,2) NOT NULL,
  incident_date DATE NOT NULL,
  incident_time TIME,
  location TEXT,
  gate_id TEXT,
  plate_number TEXT,
  status TEXT CHECK (status IN ('pending', 'acknowledged', 'paid', 'disputed', 'closed')),
  external_reference_no TEXT,
  issuing_authority TEXT NOT NULL,
  violation_code TEXT,
  due_date DATE,
  paid_date DATE,
  payment_reference TEXT,
  responsibility TEXT CHECK (responsibility IN ('customer', 'company', 'driver')),
  billable_to_contract BOOLEAN DEFAULT false,
  integration_source TEXT,
  sync_status TEXT DEFAULT 'manual',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);
```

#### compliance_exceptions
```sql
CREATE TABLE public.compliance_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exception_no TEXT UNIQUE NOT NULL,
  source_module TEXT CHECK (source_module IN ('expense', 'toll_fine', 'other')),
  source_record_id UUID NOT NULL,
  exception_type TEXT NOT NULL,
  exception_reason TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT CHECK (status IN ('open', 'under_review', 'resolved', 'dismissed')),
  vehicle_id UUID REFERENCES vehicles(id),
  customer_id UUID REFERENCES profiles(id),
  contract_id UUID REFERENCES contracts(id),
  amount_involved DECIMAL(10,2),
  auto_detected BOOLEAN DEFAULT false,
  detection_rule TEXT,
  flagged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  flagged_by UUID REFERENCES profiles(id),
  assigned_to UUID REFERENCES profiles(id),
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### contract_billing_cycles
```sql
CREATE TABLE public.contract_billing_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_cycle_no TEXT UNIQUE NOT NULL,
  contract_id UUID REFERENCES contracts(id),
  status TEXT CHECK (status IN ('open', 'preview', 'finalized', 'invoiced')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  billing_date DATE NOT NULL,
  total_expenses DECIMAL(10,2) DEFAULT 0,
  total_tolls DECIMAL(10,2) DEFAULT 0,
  total_fines DECIMAL(10,2) DEFAULT 0,
  total_exceptions DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  invoice_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Enable Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE tolls_fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_billing_cycles ENABLE ROW LEVEL SECURITY;

-- Create policies (example for authenticated users)
CREATE POLICY "Users can view tolls_fines" 
ON tolls_fines FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create tolls_fines" 
ON tolls_fines FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Repeat similar policies for other tables
```

### 3. Create Indexes for Performance

```sql
-- Tolls & Fines indexes
CREATE INDEX idx_tolls_fines_vehicle ON tolls_fines(vehicle_id);
CREATE INDEX idx_tolls_fines_customer ON tolls_fines(customer_id);
CREATE INDEX idx_tolls_fines_contract ON tolls_fines(contract_id);
CREATE INDEX idx_tolls_fines_date ON tolls_fines(incident_date);
CREATE INDEX idx_tolls_fines_status ON tolls_fines(status);

-- Exceptions indexes
CREATE INDEX idx_exceptions_source ON compliance_exceptions(source_module, source_record_id);
CREATE INDEX idx_exceptions_status ON compliance_exceptions(status);
CREATE INDEX idx_exceptions_assigned ON compliance_exceptions(assigned_to);

-- Billing cycles indexes
CREATE INDEX idx_billing_contract ON contract_billing_cycles(contract_id);
CREATE INDEX idx_billing_period ON contract_billing_cycles(period_start, period_end);
```

---

## Initial Configuration

### 1. Module Access Setup

Navigate to `/transactions/cost-compliance` to access the module.

### 2. Configure UAE Settings

If operating in the UAE, ensure UAE-specific features are enabled:

1. Go to Project Settings
2. Navigate to "Custom Knowledge"
3. Add UAE compliance requirements
4. Configure default issuing authorities
5. Set currency to AED

### 3. Set Up Issuing Authorities

Add your region's issuing authorities:
- Dubai: Salik, RTA Dubai, Dubai Police
- Abu Dhabi: Darb, Abu Dhabi Police, DoT
- Add custom authorities as needed

### 4. Configure Number Sequences

Set up automatic numbering:
```javascript
// Toll/Fine numbers: TF-YYYYMM-XXXX
// Exception numbers: EX-YYYYMM-XXXX
// Billing cycle numbers: BC-YYYYMM-XXXX
```

### 5. Default Values

Configure system defaults:
- Currency: AED (or your currency)
- Default responsibility: Customer
- Auto-sync: Enabled/Disabled
- Exception detection frequency: Daily
- Late fee percentage: 10% (UAE standard)

---

## User Permissions

### Role-Based Access Control

#### Administrator
- Full access to all features
- Can create, edit, delete all records
- Can manage system settings
- Can run exception detection
- Can export data

#### Finance Manager
- View all records
- Create and edit billing cycles
- Finalize billing
- Export reports
- Cannot delete records

#### Operations Staff
- Create toll/fine records
- Acknowledge violations
- Update payment status
- Cannot finalize billing
- Cannot delete records

#### Read-Only User
- View records only
- Generate reports
- No edit/delete permissions

### Setting Up Permissions

1. Create user roles in Supabase
2. Assign users to roles
3. Configure RLS policies per role
4. Test permissions thoroughly

---

## Integration Setup

### 1. Salik Integration (Dubai Toll System)

**Prerequisites:**
- Salik business account
- API credentials

**Setup Steps:**
1. Obtain API key from Salik portal
2. Add credentials to Lovable Secrets:
   - Navigate to Project Settings > Secrets
   - Add `SALIK_API_KEY`
   - Add `SALIK_ACCOUNT_NUMBER`
3. Configure sync schedule (recommended: hourly)
4. Test connection with sample data

**API Configuration:**
```typescript
// Edge function: sync-salik-tolls
const SALIK_API_URL = 'https://api.salik.ae/v1';
const headers = {
  'Authorization': `Bearer ${Deno.env.get('SALIK_API_KEY')}`,
  'Content-Type': 'application/json'
};
```

### 2. RTA Integration (Dubai Traffic Fines)

**Prerequisites:**
- RTA business account
- API access approval

**Setup Steps:**
1. Register for RTA API access
2. Add credentials to secrets:
   - `RTA_API_KEY`
   - `RTA_CLIENT_ID`
3. Configure webhook for real-time updates
4. Map RTA violation codes to system

### 3. Darb Integration (Abu Dhabi Toll)

Similar setup to Salik with Darb-specific credentials.

---

## Data Migration

### Migrating from Existing System

#### Step 1: Export Data
Export data from your current system in CSV format with these columns:
- Toll/Fine records: date, vehicle, amount, type, status
- Historical payments
- Driver violations

#### Step 2: Data Cleanup
- Remove duplicates
- Validate dates and amounts
- Standardize vehicle identifiers
- Map old categories to new ones

#### Step 3: Prepare Import Files
Format CSV with required columns:
```csv
incident_date,vehicle_id,type,amount,issuing_authority,status
2025-01-15,vehicle-uuid-1,toll,4,salik,paid
2025-01-20,vehicle-uuid-2,fine,500,rta_dubai,pending
```

#### Step 4: Import Data
Use the bulk import tool:
1. Navigate to Settings > Data Import
2. Upload CSV file
3. Map columns to system fields
4. Validate preview
5. Execute import
6. Verify imported records

#### Step 5: Reconciliation
- Compare counts: source vs. imported
- Verify totals match
- Check status distributions
- Validate relationships

---

## Testing & Validation

### 1. Functional Testing Checklist

#### Tolls & Fines
- [ ] Create new toll record
- [ ] Create new fine record
- [ ] Update status (acknowledge, pay, dispute)
- [ ] Bulk acknowledge records
- [ ] Search and filter functionality
- [ ] Export to Excel/PDF

#### Exceptions
- [ ] Auto-detect exceptions
- [ ] Manually flag exception
- [ ] Assign to user
- [ ] Resolve exception
- [ ] Dismiss exception
- [ ] Bulk operations

#### Billing Cycles
- [ ] Create billing cycle
- [ ] Generate preview
- [ ] Finalize cycle
- [ ] Export billing data
- [ ] Batch generation
- [ ] Link to invoice

### 2. Integration Testing

#### Salik/Darb Sync
- [ ] Manual sync successful
- [ ] Scheduled sync working
- [ ] Duplicate detection
- [ ] Error handling
- [ ] Transaction matching

#### RTA Integration
- [ ] Fine retrieval
- [ ] Violation code mapping
- [ ] Payment status update
- [ ] Real-time webhook

### 3. Performance Testing

Test with realistic data volumes:
- 10,000+ toll/fine records
- 1,000+ exceptions
- 100+ billing cycles
- Multiple concurrent users

Monitor:
- Page load times (<2 seconds)
- Search response (<1 second)
- Export generation (<5 seconds)
- Bulk operations (<10 seconds for 100 records)

### 4. Security Testing

- [ ] RLS policies enforced
- [ ] Unauthorized access blocked
- [ ] API keys secured
- [ ] Data encryption at rest
- [ ] Audit trail working
- [ ] Role permissions correct

---

## Go-Live Checklist

Before production deployment:

### Pre-Launch
- [ ] All tables created and indexed
- [ ] RLS policies configured
- [ ] User roles assigned
- [ ] Integrations tested
- [ ] Data migrated and verified
- [ ] Performance tested
- [ ] Security audit completed
- [ ] Backup strategy in place

### Launch Day
- [ ] Final backup taken
- [ ] Users notified
- [ ] Support team briefed
- [ ] Monitoring enabled
- [ ] Incident response plan ready

### Post-Launch
- [ ] Monitor for errors (first 48 hours)
- [ ] Gather user feedback
- [ ] Address urgent issues
- [ ] Schedule training sessions
- [ ] Document lessons learned

---

## Maintenance & Monitoring

### Daily Tasks
- Review exception alerts
- Monitor sync job status
- Check error logs
- Respond to user issues

### Weekly Tasks
- Review performance metrics
- Analyze usage patterns
- Update violation code database
- Backup verification

### Monthly Tasks
- Generate compliance reports
- Review system capacity
- Update documentation
- Security review
- Performance optimization

---

## Support & Escalation

### Internal Support
- Level 1: Operations staff (basic questions)
- Level 2: System admin (configuration issues)
- Level 3: Development team (technical issues)

### External Support
- Lovable Support: support@lovable.dev
- Documentation: https://docs.lovable.dev
- Discord Community: https://discord.gg/lovable

### Common Issues & Solutions

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed troubleshooting guide.

---

## Appendix

### A. Environment Variables
```
SALIK_API_KEY=your_salik_key
RTA_API_KEY=your_rta_key
DARB_API_KEY=your_darb_key
DEFAULT_CURRENCY=AED
LATE_FEE_PERCENTAGE=10
```

### B. Useful Queries

**Total pending fines by vehicle:**
```sql
SELECT 
  vehicle_id,
  COUNT(*) as fine_count,
  SUM(total_amount) as total_amount
FROM tolls_fines
WHERE status = 'pending' AND type = 'fine'
GROUP BY vehicle_id
ORDER BY total_amount DESC;
```

**Exceptions by severity:**
```sql
SELECT 
  severity,
  COUNT(*) as count,
  COUNT(CASE WHEN status = 'open' THEN 1 END) as open_count
FROM compliance_exceptions
GROUP BY severity;
```

### C. Keyboard Shortcuts
- `Ctrl/Cmd + K`: Quick search
- `Ctrl/Cmd + N`: New record
- `Ctrl/Cmd + S`: Save
- `Esc`: Close dialog

---

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Next Review:** March 2026
