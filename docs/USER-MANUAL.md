# Cost & Compliance Module - User Manual

## Welcome

This manual will guide you through using the Cost & Compliance module for managing tolls, fines, exceptions, and billing cycles.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Tolls & Fines](#managing-tolls--fines)
4. [Handling Exceptions](#handling-exceptions)
5. [Billing Cycles](#billing-cycles)
6. [UAE-Specific Features](#uae-specific-features)
7. [Reports & Exports](#reports--exports)
8. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### Accessing the Module

1. Log in to your account
2. Navigate to **Transactions** in the main menu
3. Click on **Cost & Compliance**

### Dashboard Layout

The module is organized into five main tabs:
- **Dashboard**: Overview and quick actions
- **Expenses**: Vehicle-related expenses (coming soon)
- **Tolls & Fines**: Toll charges and traffic violations
- **Exceptions**: Compliance issues requiring attention
- **Billing Cycles**: Contract billing management

---

## Dashboard Overview

### Key Performance Indicators (KPIs)

The dashboard displays important metrics at a glance:

#### Tolls & Fines Card
- **Total Count**: All toll and fine records
- **Pending Amount**: Outstanding payments
- Click to view detailed list

#### Exceptions Card
- **Open Exceptions**: Issues requiring attention
- **Severity Breakdown**: Critical, high, medium, low
- Click to manage exceptions

#### Billing Cycles Card
- **Active Cycles**: Current billing periods
- **Pending Amount**: Amount to be invoiced
- Click to view cycles

### Quick Actions

Use these buttons for common tasks:
- **New Toll/Fine**: Record a new charge
- **Generate Billing**: Create billing preview
- **Run Exception Detection**: Scan for issues
- **View Reports**: Access analytics

### Recent Activity

Shows the latest 10 activities:
- New tolls/fines added
- Exceptions flagged
- Payments recorded
- Status changes

---

## Managing Tolls & Fines

### Creating a New Record

#### Method 1: Manual Entry

1. Click **New Toll/Fine** button
2. Fill in the required fields:
   - **Type**: Toll or Fine
   - **Vehicle**: Select from dropdown
   - **Amount**: Enter charge amount
   - **Date**: Incident date
   - **Authority**: Select issuing authority
3. Optional fields:
   - Driver
   - Customer
   - Contract
   - Location
   - Notes
4. Click **Save**

#### Method 2: UAE Violation Lookup (for fines)

1. Click **New Toll/Fine**
2. Select **Fine** as type
3. Click **Lookup Violation Code**
4. Search for violation:
   - By code (e.g., "1-001")
   - By description (e.g., "speeding")
   - In Arabic
5. Click on a violation to auto-fill:
   - Amount
   - Description
   - Black points
6. Complete remaining fields
7. Click **Save**

#### Method 3: Toll Gate Selection

1. Click **New Toll/Fine**
2. Select **Toll** as type
3. Click **Select Toll Gate**
4. Choose system: Salik or Darb
5. Select a gate from the list
6. Auto-fills:
   - Location
   - Amount (rate)
   - Authority
7. Complete remaining fields
8. Click **Save**

### Viewing Records

The Tolls & Fines table shows:
- **Reference Number**: Unique identifier
- **Date**: When it occurred
- **Vehicle**: Plate number and details
- **Type**: Toll or Fine
- **Amount**: Charge amount
- **Status**: Current status
- **Actions**: Available operations

### Filtering Records

Use filters to find specific records:
- **Type**: Toll or Fine
- **Status**: Pending, Acknowledged, Paid, Disputed, Closed
- **Date Range**: From/To dates
- **Vehicle**: Specific vehicle
- **Customer**: Specific customer
- **Authority**: Issuing authority

Click **Apply Filters** to search.

### Updating Status

#### Acknowledge Fine
1. Select record(s)
2. Click **Acknowledge** button
3. Add notes (optional)
4. Confirm

Status changes to: **Acknowledged**

#### Mark as Paid
1. Select record(s)
2. Click **Mark Paid** button
3. Enter:
   - Payment reference
   - Payment date
4. Confirm

Status changes to: **Paid**

#### Dispute Fine
1. Select record
2. Click **Actions** > **Dispute**
3. Enter reason for dispute
4. Submit

Status changes to: **Disputed**

### Bulk Operations

To perform actions on multiple records:

1. **Select Records**: 
   - Check boxes next to records
   - Or use "Select All" checkbox
2. **Choose Action**:
   - Acknowledge
   - Mark Paid
   - Assign Responsibility
   - Link to Contract
3. **Confirm**: Review and execute

**Tip**: Bulk operations save time when processing multiple records.

### Responsibility Assignment

Assign who pays the charge:
- **Customer**: Bill to customer
- **Company**: Company absorbs cost
- **Driver**: Driver responsible

To assign:
1. Select record(s)
2. Click **Assign Responsibility**
3. Choose: Customer/Company/Driver
4. Confirm

### Linking to Contracts

Link charges to customer contracts:
1. Select record(s)
2. Click **Link to Contract**
3. Select contract from dropdown
4. Confirm

Linked charges appear in billing cycles.

---

## Handling Exceptions

### What Are Exceptions?

Exceptions are compliance issues that need attention:
- Unpaid fines past due date
- Missing vehicle assignment
- High black points warning
- Duplicate charges
- Unusual patterns

### Exception Severity Levels

- **Critical** 🔴: Immediate attention required
- **High** 🟠: Address within 24 hours
- **Medium** 🟡: Address within 3 days
- **Low** 🟢: Review when convenient

### Viewing Exceptions

Navigate to the **Exceptions** tab to see:
- Exception number
- Source (where it originated)
- Type and reason
- Severity level
- Status
- Assigned user
- Flagged date

### Filtering Exceptions

Filter by:
- **Status**: Open, Under Review, Resolved, Dismissed
- **Severity**: Critical, High, Medium, Low
- **Source Module**: Expense, Toll/Fine, Other
- **Assigned User**: Your team members

### Working with Exceptions

#### Take Ownership
1. Find exception you want to handle
2. Click **Actions** > **Assign to Me**
3. Status changes to: **Under Review**

#### Resolve Exception
1. Take necessary corrective action
2. Click **Actions** > **Resolve**
3. Enter resolution notes
4. Click **Confirm**

Status changes to: **Resolved**

#### Dismiss Exception
If exception is not valid:
1. Click **Actions** > **Dismiss**
2. Enter reason for dismissal
3. Click **Confirm**

Status changes to: **Dismissed**

### Auto-Detection

The system automatically detects exceptions:
- **Schedule**: Runs daily at 2 AM
- **Manual Trigger**: Click "Run Exception Detection"

Common auto-detected issues:
- Tolls without vehicle assignment
- Fines approaching due date
- Black points threshold warnings
- Duplicate records

---

## Billing Cycles

### Understanding Billing Cycles

A billing cycle:
- Covers a specific time period (usually monthly)
- Groups all charges for a contract
- Generates an invoice
- Tracks payment status

### Creating a Billing Cycle

1. Click **New Billing Cycle**
2. Fill in:
   - **Contract**: Select customer contract
   - **Period Start**: Beginning of billing period
   - **Period End**: End of billing period
   - **Billing Date**: When invoice is due
3. Click **Create**

Cycle is created with status: **Open**

### Generating Preview

Before finalizing, preview the billing:

1. Open billing cycle
2. Click **Generate Preview**
3. Review:
   - Expenses (if any)
   - Toll charges
   - Fine charges
   - Exceptions
   - Summary totals
4. Verify amounts are correct

### Finalizing Billing

Once verified:
1. Click **Finalize** button
2. Optional: Link invoice number
3. Confirm

Status changes to: **Finalized**

**Important**: Finalized cycles cannot be edited. Only finalize after verification.

### Marking as Invoiced

After creating invoice:
1. Open finalized cycle
2. Click **Mark as Invoiced**
3. Enter invoice reference number
4. Confirm

Status changes to: **Invoiced**

### Batch Generation

Generate billing for multiple contracts:

1. Click **Batch Generate**
2. Select contracts
3. Set common period dates
4. Click **Generate All**
5. System processes each contract

Review results:
- ✓ Success count
- ✗ Failed count
- Error details

### Exporting Billing Data

Export cycle data in multiple formats:

1. Open billing cycle preview
2. Click **Export** button
3. Choose format:
   - **PDF**: Printable invoice
   - **Excel**: Detailed breakdown
   - **CSV**: Raw data
4. File downloads automatically

---

## UAE-Specific Features

### RTA Violation Lookup

Access comprehensive RTA violation database:

1. Navigate to **UAE Tools** (if available) or
2. Use lookup during fine creation
3. Search features:
   - By violation code
   - By description
   - In Arabic (عربي)
   - By category

Each violation shows:
- Official code
- English description
- Arabic description
- Fine amount (AED)
- Black points

### Toll Gate Selection

Quick selection of Salik and Darb gates:

**Salik (Dubai) - 8 Gates:**
- Al Maktoum Bridge
- Al Garhoud Bridge
- Al Shindagha Tunnel
- And 5 more...

**Darb (Abu Dhabi) - 4 Gates:**
- Abu Dhabi - Mussafah
- Abu Dhabi - Al Falah
- And 2 more...

Each gate displays:
- English name
- Arabic name (عربي)
- Location
- Current rate (AED)

### Black Points Tracking

Monitor driver black points:

**Thresholds:**
- ⚠️ Warning: 12 points
- 🚫 3-Month Suspension: 24 points
- 🚫 6-Month Suspension: 48 points
- ⛔ License Cancellation: 72+ points

View black points tracker:
1. Navigate to driver profile
2. View "Black Points" section
3. See:
   - Current total
   - Progress bar
   - Status indicator
   - Threshold warnings

---

## Reports & Exports

### Available Reports

#### Tolls & Fines Summary
- Total charges by period
- Breakdown by type (toll/fine)
- By authority
- By vehicle
- Payment status

#### Exceptions Report
- Open vs. resolved
- By severity level
- By source module
- Average resolution time

#### Billing Summary
- Total billed amount
- By contract
- By period
- Payment status

### Exporting Data

#### Quick Export
From any table:
1. Click **Export** button
2. Choose format (Excel/CSV/PDF)
3. File downloads

#### Custom Export
For specific data:
1. Apply filters
2. Select columns needed
3. Click **Export Filtered**
4. Choose format

### Scheduled Reports

Set up automatic reports:
1. Go to Settings > Reports
2. Click **New Schedule**
3. Configure:
   - Report type
   - Frequency (daily/weekly/monthly)
   - Recipients (email)
   - Format
4. Save

Reports email automatically.

---

## Tips & Best Practices

### Daily Workflow

**Morning Routine:**
1. Check dashboard for alerts
2. Review new exceptions
3. Process overnight sync data
4. Acknowledge new fines

**End of Day:**
1. Record any manual tolls/fines
2. Update payment statuses
3. Resolve assigned exceptions
4. Review tomorrow's tasks

### Data Entry Best Practices

✅ **Do:**
- Enter records same day as incident
- Double-check vehicle/driver
- Add notes for context
- Use violation lookup for accuracy
- Link to contracts when possible

❌ **Don't:**
- Leave fields blank unnecessarily
- Use inconsistent naming
- Delay data entry
- Skip verification
- Ignore warnings

### Exception Management

**Prioritize by:**
1. Severity (Critical first)
2. Age (Older first)
3. Financial impact (Larger amounts)
4. Customer importance

**Resolution Tips:**
- Document your actions
- Communicate with team
- Update status promptly
- Add detailed notes
- Follow up when needed

### Billing Cycle Best Practices

**Monthly Billing:**
- Create cycle on 1st of month
- Generate preview by 5th
- Finalize by 10th
- Invoice by 15th

**Verification Checklist:**
- [ ] All tolls included
- [ ] All fines included
- [ ] Correct contract
- [ ] Dates accurate
- [ ] Totals correct
- [ ] No duplicates

### Performance Tips

**Speed up workflows:**
- Use keyboard shortcuts
- Save common filters
- Utilize bulk operations
- Set up quick actions
- Use templates

**Search efficiently:**
- Use specific filters
- Combine multiple filters
- Save filter presets
- Use reference numbers
- Filter by date range

---

## Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|--------------|-----|
| New Record | Ctrl + N | Cmd + N |
| Save | Ctrl + S | Cmd + S |
| Search | Ctrl + K | Cmd + K |
| Close Dialog | Esc | Esc |
| Refresh | F5 | Cmd + R |

---

## Getting Help

### In-App Help
- Click **?** icon for context help
- Hover tooltips on fields
- View tutorial videos

### Documentation
- [Admin Setup Guide](./ADMIN-SETUP-GUIDE.md)
- [API Documentation](./API-DOCUMENTATION.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

### Support Channels
- **Email**: support@yourcompany.com
- **Phone**: +971-XX-XXX-XXXX
- **Internal**: IT Help Desk

### Training Resources
- Video tutorials
- Webinar recordings
- Quick reference cards
- FAQ document

---

## Frequently Asked Questions

**Q: How do I know if a record is already paid?**
A: Check the Status column. Paid records show "Paid" status and have a payment date.

**Q: Can I edit a finalized billing cycle?**
A: No, finalized cycles are locked. Contact your administrator if corrections are needed.

**Q: What happens if I dismiss an exception by mistake?**
A: Dismissed exceptions can be reopened by administrators.

**Q: How often should I check for exceptions?**
A: Check daily, especially critical and high severity ones.

**Q: Can I delete records?**
A: Only administrators can delete. Regular users can close or archive records.

**Q: How far back can I search?**
A: All historical data is searchable. Use date filters for faster searches.

---

**Document Version:** 1.0  
**Last Updated:** December 2025  
**For:** All Users
