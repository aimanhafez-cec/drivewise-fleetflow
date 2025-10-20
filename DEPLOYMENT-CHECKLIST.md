# Custody Management System - Deployment Checklist

## 🎯 Phase 12: Deployment & Rollout

This document provides a comprehensive checklist for deploying the Custody Management System to production.

---

## Pre-Deployment Checklist

### 1. Database Verification ✓
- [ ] All migrations have been run successfully
- [ ] Database indexes are created for performance
- [ ] RLS policies are enabled and tested
- [ ] Foreign key constraints are in place
- [ ] Triggers and functions are working correctly
- [ ] Run linter: Check for security issues
- [ ] Verify no critical security warnings remain

**Verification Command:**
```bash
# Check migration status in Supabase Dashboard
# Navigate to: Database > Migrations
```

### 2. Security Review ✓
- [ ] All RLS policies reviewed and tested
- [ ] Service role keys are not exposed in frontend code
- [ ] Environment variables are properly configured
- [ ] CORS settings are appropriate for production
- [ ] Authentication flows tested end-to-end
- [ ] API endpoints require proper authentication
- [ ] SQL injection prevention verified
- [ ] XSS protection in place

**Security Verification:**
```sql
-- Run in Supabase SQL Editor
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename NOT IN (
  SELECT tablename 
  FROM pg_policies 
  WHERE schemaname = 'public'
);
-- Should return empty if all tables have RLS
```

### 3. Edge Functions ✓
- [ ] All edge functions deployed
- [ ] Edge function secrets configured
- [ ] CORS headers set correctly
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Test each function with production-like data

**Deployed Functions:**
- `calculate-cost-sheet`
- `submit-cost-sheet-approval`
- `approve-cost-sheet`
- `apply-cost-sheet-rates`
- `submit-quote-approval`
- `send-quote-to-customer`
- `custody-webhook`
- `custody-notifications`
- `custody-scheduler`

**Test Edge Functions:**
```bash
# Test via Supabase client
await supabase.functions.invoke('function-name', {
  body: { test: true }
})
```

### 4. Environment Configuration ✓
- [ ] Production Supabase project created
- [ ] Environment variables set:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
- [ ] Service role key stored securely (server-side only)
- [ ] Edge function secrets configured
- [ ] Email templates configured (if using)

### 5. Testing ✓
- [ ] All unit tests passing (`npm test`)
- [ ] Integration tests completed
- [ ] End-to-end user flows tested
- [ ] Cross-browser testing done
- [ ] Mobile responsiveness verified
- [ ] Performance testing completed
- [ ] Load testing performed

**Run Tests:**
```bash
npm test
npm run test:ui  # Interactive UI
```

### 6. Performance Optimization ✓
- [ ] Images optimized and lazy-loaded
- [ ] Bundle size analyzed and optimized
- [ ] Database queries optimized with indexes
- [ ] Caching strategies implemented
- [ ] CDN configured (if applicable)
- [ ] Lighthouse audit score > 90

**Performance Check:**
```bash
npm run build
# Check bundle size in dist/
```

### 7. Monitoring & Logging ✓
- [ ] Error tracking setup (via Supabase logs)
- [ ] Database query monitoring enabled
- [ ] Edge function logs reviewed
- [ ] Analytics configured (optional)
- [ ] Uptime monitoring configured

**Monitor Locations:**
- Edge Functions: Supabase Dashboard > Functions > Logs
- Database: Supabase Dashboard > Database > Logs
- Auth: Supabase Dashboard > Authentication > Logs

### 8. Documentation ✓
- [ ] API documentation complete
- [ ] User guide created
- [ ] Admin guide created
- [ ] Deployment guide reviewed
- [ ] Rollback procedures documented
- [ ] Troubleshooting guide available

---

## Deployment Steps

### Step 1: Final Code Review
1. Review all code changes in the last sprint
2. Ensure no debug code or console.logs remain
3. Verify all TODOs are addressed or documented
4. Check for hardcoded values that should be env variables

### Step 2: Build Production Version
```bash
npm run build
```

**Verify Build:**
- [ ] Build completes without errors
- [ ] No warnings about missing dependencies
- [ ] Bundle size is acceptable

### Step 3: Deploy to Lovable
1. Click the **Publish** button in Lovable editor
2. Wait for deployment to complete
3. Note the deployment URL

### Step 4: Verify Deployment
- [ ] Application loads without errors
- [ ] Authentication works
- [ ] Database operations function correctly
- [ ] Edge functions are accessible
- [ ] All pages render correctly
- [ ] Forms submit successfully

### Step 5: Setup Scheduled Tasks
Run this SQL in Supabase SQL Editor to enable the custody scheduler:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule custody-scheduler to run every hour
SELECT cron.schedule(
  'custody-scheduler-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT net.http_post(
    url:='https://tbmcmbldoaespjlhpfys.supabase.co/functions/v1/custody-scheduler',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRibWNtYmxkb2Flc3BqbGhwZnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTQzMzcsImV4cCI6MjA2OTM5MDMzN30.4uJ4xpyZENd15IPQ-ctaouZ0Q7HFNr-CsRtJ0O7bqNs"}'::jsonb,
    body:='{"scheduled": true}'::jsonb
  ) as request_id;
  $$
);

-- Verify the cron job was created
SELECT * FROM cron.job;
```

### Step 6: Post-Deployment Verification
Complete the [Post-Deployment Verification](#post-deployment-verification) checklist below.

---

## Post-Deployment Verification

### Functional Testing
- [ ] **Authentication**
  - Sign up new user
  - Sign in existing user
  - Password reset flow
  - Sign out

- [ ] **Custody Management**
  - Create new custody transaction
  - Update custody status
  - Add charges and payments
  - Upload documents
  - View custody history

- [ ] **Approvals Workflow**
  - Submit for approval
  - Receive approval notification
  - Approve/reject custody
  - Auto-approval for within-limits

- [ ] **Cost Sheets**
  - Create cost sheet
  - Calculate costs
  - Submit for approval
  - Apply rates to quote

- [ ] **Quotes**
  - Generate quote
  - Submit for approval
  - Send to customer

- [ ] **Integrations**
  - Test webhook endpoints
  - Verify notifications
  - Check scheduler tasks

### Performance Testing
- [ ] Page load times < 3 seconds
- [ ] Time to Interactive < 5 seconds
- [ ] Database queries complete quickly
- [ ] No memory leaks observed
- [ ] Concurrent user testing passed

### Security Testing
- [ ] Unauthorized access blocked
- [ ] RLS policies enforced
- [ ] SQL injection attempts blocked
- [ ] XSS attempts blocked
- [ ] CSRF protection working

---

## Rollback Procedures

### If Critical Issues Arise:

#### Option 1: Revert to Previous Version (Lovable)
1. Open Lovable editor
2. Navigate to History
3. Click on previous stable version
4. Click "Revert to this version"
5. Click Publish

#### Option 2: Rollback Database (Supabase)
1. Go to Supabase Dashboard > Database > Migrations
2. Identify the problematic migration
3. Create a rollback migration
4. Apply the rollback

**Example Rollback Migration:**
```sql
-- Rollback example
DROP TRIGGER IF EXISTS trigger_name ON table_name;
DROP FUNCTION IF EXISTS function_name;
ALTER TABLE table_name DROP COLUMN IF EXISTS column_name;
```

#### Option 3: Disable Problematic Feature
1. Create a feature flag in code
2. Deploy with feature disabled
3. Fix issue in development
4. Re-enable feature

---

## Monitoring Plan

### Daily Monitoring (First Week)
- [ ] Check error logs
- [ ] Review edge function logs
- [ ] Monitor database performance
- [ ] Check user feedback
- [ ] Verify scheduler runs

### Weekly Monitoring (First Month)
- [ ] Review security logs
- [ ] Analyze performance metrics
- [ ] Check storage usage
- [ ] Review cost/usage
- [ ] Update documentation

### Monthly Monitoring (Ongoing)
- [ ] Security audit
- [ ] Performance optimization review
- [ ] User feedback analysis
- [ ] Dependency updates
- [ ] Backup verification

---

## Support & Maintenance

### User Support
- **Documentation**: [README.md](./README.md)
- **Testing Guide**: [README-TESTING.md](./README-TESTING.md)
- **API Guide**: [README-API.md](./README-API.md)

### Technical Support
- **Supabase Dashboard**: https://supabase.com/dashboard/project/tbmcmbldoaespjlhpfys
- **Edge Function Logs**: https://supabase.com/dashboard/project/tbmcmbldoaespjlhpfys/functions
- **Database Logs**: https://supabase.com/dashboard/project/tbmcmbldoaespjlhpfys/logs/postgres-logs

### Emergency Contacts
- **Database Issues**: Check Supabase status page
- **Edge Function Issues**: Review function logs
- **Frontend Issues**: Check browser console and network tab

---

## Success Criteria

The deployment is considered successful when:
- ✅ All tests passing
- ✅ No critical security warnings
- ✅ All edge functions operational
- ✅ RLS policies enforced
- ✅ Performance metrics met
- ✅ Zero downtime during deployment
- ✅ All user flows functional
- ✅ Monitoring in place
- ✅ Documentation complete
- ✅ Team trained on system

---

## Next Steps After Deployment

1. **Monitor closely for first 48 hours**
2. **Gather user feedback**
3. **Address any issues immediately**
4. **Document lessons learned**
5. **Plan next iteration**

---

**Deployment Date**: _____________
**Deployed By**: _____________
**Verified By**: _____________
**Sign-off**: _____________
