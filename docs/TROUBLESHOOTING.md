# Cost & Compliance Module - Troubleshooting Guide

## Quick Diagnostics

### Is the module loading?
- Clear browser cache (Ctrl+Shift+Delete)
- Try different browser
- Check internet connection
- Verify you're logged in

### Are you seeing errors?
- Check browser console (F12)
- Screenshot the error
- Note what you were doing
- Try to reproduce

---

## Common Issues & Solutions

### 1. Data Not Loading

#### Symptom
- Tables show "Loading..." indefinitely
- Dashboard shows no data
- Filters don't work

#### Causes & Solutions

**Cause: Slow Network**
- Check internet speed
- Wait for complete load
- Refresh page (F5)

**Cause: Database Connection**
- Verify Supabase status
- Check RLS policies
- Confirm user permissions

**Cause: Browser Cache**
```
Solution:
1. Open browser settings
2. Clear cache and cookies
3. Close browser
4. Reopen and try again
```

---

### 2. Unable to Create Records

#### Symptom
- "Save" button doesn't work
- Error message on submit
- Form fields turn red

#### Solutions

**Missing Required Fields**
```
Check these required fields:
□ Type (toll/fine)
□ Amount
□ Date
□ Issuing Authority

Fill in all required fields marked with *
```

**Invalid Data Format**
- Amount: Must be positive number
- Date: Must be valid date (YYYY-MM-DD)
- Vehicle: Must select from dropdown

**Permission Issue**
- Verify you have create permission
- Contact administrator
- Check role assignment

---

### 3. Sync Issues

#### Symptom
- Salik/Darb data not syncing
- "Last sync" shows old date
- Manual sync fails

#### Solutions

**Check API Credentials**
```sql
-- Verify secrets exist
SELECT * FROM secrets 
WHERE name IN ('SALIK_API_KEY', 'DARB_API_KEY');
```

**Test Connection**
1. Go to Settings > Integrations
2. Click "Test Connection"
3. If fails, check:
   - API key validity
   - Account status
   - Network access

**Force Manual Sync**
1. Navigate to Tolls & Fines
2. Click "Sync Now"
3. Select system (Salik/Darb)
4. Wait for completion
5. Check error logs if failed

**Review Sync Logs**
```javascript
// Check edge function logs
// Navigate to: Settings > Logs > Edge Functions
// Filter: sync-salik-tolls or sync-darb-tolls
// Look for error messages
```

---

### 4. Duplicate Records

#### Symptom
- Same toll appears multiple times
- Duplicate exception alerts
- Billing includes duplicates

#### Solutions

**Prevent Duplicates**
- System checks: External reference number
- Use sync instead of manual entry
- Verify before manual creation

**Clean Up Duplicates**
```
1. Identify duplicates:
   - Same vehicle + date + amount + authority
2. Keep earliest record
3. Delete or archive duplicates
4. Admin tool: Merge Duplicates
```

**Why Duplicates Happen:**
- Manual entry + auto sync
- Multiple sync jobs
- External system issues
- Clock time differences

---

### 5. Billing Cycle Errors

#### Symptom
- Preview generation fails
- "Cannot finalize" error
- Amounts don't match

#### Solutions

**Preview Generation Fails**
```
Check:
□ Contract exists and active
□ Date range is valid
□ Period start < period end
□ No overlapping cycles
□ Charges exist in period
```

**Cannot Finalize**
Possible reasons:
1. Missing required data
2. Validation errors
3. Cycle already finalized
4. Insufficient permissions

**Amounts Don't Match**
Reconciliation steps:
```
1. Compare:
   - Expected total
   - Preview total
   - Individual items
2. Check:
   - All charges included?
   - Correct date range?
   - Proper filters applied?
3. Regenerate preview
4. Contact support if persists
```

---

### 6. Exception Detection Not Working

#### Symptom
- No exceptions created
- Detection runs but finds nothing
- Expected exceptions missing

#### Solutions

**Manual Detection**
```
1. Go to Exceptions tab
2. Click "Run Detection"
3. Wait for completion
4. Check "Created" count
```

**Review Detection Rules**
```javascript
// Common detection rules:
- Tolls without vehicle: vehicle_id IS NULL
- Overdue fines: due_date < CURRENT_DATE AND status = 'pending'
- High black points: total_points >= 12
- Duplicate charges: multiple with same reference
```

**Configure Detection Schedule**
```
Settings > Automation > Exception Detection
□ Enabled
□ Schedule: Daily at 2:00 AM
□ Email alerts: Yes/No
□ Severity threshold: Medium+
```

---

### 7. Search Not Finding Records

#### Symptom
- Search returns no results
- Known records not showing
- Filters don't work

#### Solutions

**Clear All Filters**
```
1. Click "Clear Filters" button
2. Try search again
3. Apply one filter at a time
```

**Check Search Syntax**
```
Correct:
✓ "ABC123" (exact match)
✓ "dubai" (case-insensitive)
✓ "سالك" (Arabic text)

Incorrect:
✗ ABC-123 (wrong format)
✗ abc 123 (extra space)
```

**Index Rebuild** (Admin only)
```sql
-- Rebuild search indexes
REINDEX TABLE tolls_fines;
REINDEX TABLE compliance_exceptions;
REINDEX TABLE contract_billing_cycles;
```

---

### 8. Export Failures

#### Symptom
- Export button does nothing
- Download fails
- File is corrupted/empty

#### Solutions

**Browser Popup Blocker**
```
1. Check popup blocker settings
2. Allow popups for this site
3. Try export again
```

**Large Dataset**
- Reduce date range
- Apply filters first
- Export in smaller batches
- Use CSV for large exports

**File Format Issues**
```
If Excel won't open:
1. Try CSV format instead
2. Open with Google Sheets
3. Check file size < 10MB
```

---

### 9. Permissions Errors

#### Symptom
- "Access Denied" message
- Missing buttons/features
- Cannot edit records

#### Solutions

**Verify Your Role**
```
Profile > Settings > My Role
Expected roles:
- Administrator (full access)
- Finance Manager (billing)
- Operations Staff (create/edit)
- Read-Only User (view only)
```

**Contact Administrator**
If you need different permissions:
1. Note what you're trying to do
2. Screenshot the error
3. Contact IT/Admin
4. Request role change

**Session Expired**
- Log out completely
- Clear browser cache
- Log back in
- Try again

---

### 10. Performance Issues

#### Symptom
- Page loads slowly
- Actions take long time
- Browser freezes

#### Solutions

**Browser Optimization**
```
1. Close unused tabs
2. Clear cache
3. Disable extensions
4. Update browser
5. Restart browser
```

**Data Volume**
```
Reduce visible data:
□ Use date filters (last 30 days)
□ Filter by status
□ Limit to specific vehicle
□ Use pagination
□ Export for analysis
```

**System Resources**
```
Check your computer:
- RAM usage: < 80%
- Disk space: > 1GB free
- CPU usage: < 90%
- Close other apps
```

---

## Error Messages Explained

### "Ambiguous relationship" (Supabase)
**Problem:** Database query can't determine which foreign key to use

**Solution:** Use explicit relationship names in query
```typescript
// Wrong:
.select('*, profiles(full_name)')

// Correct:
.select('*, customer:profiles!tolls_fines_customer_id_fkey(full_name)')
```

### "Column does not exist"
**Problem:** Code references non-existent database column

**Solution:** 
1. Check column name spelling
2. Verify table schema
3. Run database migration if needed
4. Contact administrator

### "Row Level Security policy"
**Problem:** Permission denied to access data

**Solution:**
1. Verify you're logged in
2. Check your role
3. Confirm RLS policies
4. Contact administrator

### "Network request failed"
**Problem:** Cannot connect to server

**Solution:**
1. Check internet connection
2. Verify Supabase status
3. Check firewall settings
4. Try VPN if needed

---

## Diagnostic Tools

### Browser Console
```
Open console: F12 or Ctrl+Shift+I

Look for:
□ Red error messages
□ Network failures (failed requests)
□ JavaScript errors
□ API call responses
```

### Network Tab
```
1. Open DevTools (F12)
2. Click Network tab
3. Reproduce issue
4. Check for:
   - Failed requests (red)
   - Status codes (200=OK, 400+=error)
   - Response times (slow?)
```

### Supabase Logs
```
Access logs:
1. Open Supabase dashboard
2. Navigate to Logs
3. Filter by:
   - Date/time
   - Log level
   - Function name
4. Look for errors
```

---

## Data Recovery

### Accidentally Deleted Record

**If just deleted:**
1. Check if in trash/archive
2. Contact administrator
3. Restore from backup

**If need history:**
```sql
-- Check audit log
SELECT * FROM audit_log 
WHERE table_name = 'tolls_fines'
AND action = 'DELETE'
ORDER BY created_at DESC;
```

### Lost Unsaved Changes

**Prevention:**
- Auto-save every 30 seconds
- Use "Save Draft" feature
- Don't close browser mid-edit

**Recovery:**
- Check draft folder
- Restore previous version
- Re-enter data if needed

---

## When to Contact Support

Contact support if:
- Issue persists after troubleshooting
- Data corruption suspected
- System-wide problem
- Permission changes needed
- Integration failures
- Security concerns

**Include in support ticket:**
1. Your username
2. What you were doing
3. Error message (screenshot)
4. Browser and version
5. Date/time of issue
6. Steps to reproduce

---

## Preventive Measures

### Regular Maintenance
- Weekly: Clear browser cache
- Monthly: Review error logs
- Quarterly: Update documentation
- Annually: Security audit

### Best Practices
- Save work frequently
- Use filters to reduce load
- Keep browser updated
- Report issues promptly
- Document workarounds

### Backup Strategy
- Database: Daily automated
- Documents: Weekly backup
- Configurations: Version control
- Test restores: Monthly

---

## Quick Reference

### Important Numbers
- Support Email: support@company.com
- IT Help Desk: ext. 1234
- Emergency: +971-XX-XXX-XXXX

### Useful Links
- [User Manual](./USER-MANUAL.md)
- [Admin Guide](./ADMIN-SETUP-GUIDE.md)
- [API Docs](./API-DOCUMENTATION.md)
- Lovable Docs: https://docs.lovable.dev

### Status Pages
- Lovable Status: https://status.lovable.dev
- Supabase Status: https://status.supabase.com

---

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Next Review:** March 2026
