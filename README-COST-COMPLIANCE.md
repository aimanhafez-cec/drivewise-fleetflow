# Cost & Compliance Module

## Overview
The Cost & Compliance module is a comprehensive solution for managing tolls, fines, compliance exceptions, and billing cycles within the rental management system. This module enables efficient tracking, exception detection, and billing automation.

## Features

### 1. Dashboard
- **KPI Cards**: Display key metrics for tolls/fines, exceptions, and billing cycles
- **Quick Actions**: Fast access to common operations
- **Module Overview**: Summary of each sub-module with direct navigation
- **Recent Activity**: Timeline of recent cost and compliance events

### 2. Expenses Tab (Future Implementation)
- Track vehicle-related expenses
- Link expenses to contracts and vehicles
- Categorize and approve expenses

### 3. Tolls & Fines Tab
- **Data Table**: View all toll and fine records with filtering and sorting
- **Create/Edit**: Add new tolls/fines or update existing records
- **Bulk Actions**: 
  - Acknowledge multiple records
  - Mark as paid
  - Dispute fines
  - Assign responsibility
  - Link to contracts
- **Status Management**: Track pending, acknowledged, paid, disputed, and closed statuses
- **Integration Support**: Sync with external systems (Salik, RTA, etc.)

### 4. Exceptions Tab
- **Auto-Detection**: Automatically flag compliance issues
- **Manual Flagging**: Create custom exception records
- **Severity Levels**: Low, medium, high, and critical
- **Assignment**: Assign exceptions to team members
- **Resolution Tracking**: Document resolution notes and outcomes
- **Bulk Operations**: Approve, dismiss, reassign, or escalate multiple exceptions

### 5. Billing Cycles Tab
- **Cycle Management**: Create and manage billing periods
- **Preview Generation**: Generate billing previews for contracts
- **Finalization**: Lock and finalize billing cycles
- **Export**: Export billing data in PDF, Excel, or CSV formats
- **Batch Processing**: Generate billing for multiple contracts simultaneously
- **Invoice Tracking**: Link billing cycles to invoices

## Architecture

### API Layer (`src/lib/api/`)
- **costCompliance.ts**: Billing cycles and dashboard statistics
- **tollsFines.ts**: Toll and fine management
- **complianceExceptions.ts**: Exception detection and management

### Hooks Layer (`src/hooks/`)
- **useCostCompliance.ts**: React Query hooks for billing and dashboard
- **useTollsFines.ts**: React Query hooks for toll/fine operations
- **useComplianceExceptions.ts**: React Query hooks for exception management

### Components Layer (`src/components/cost-compliance/`)
- **CostComplianceDashboard.tsx**: Main dashboard component
- **ExpensesTab.tsx**: Expenses management (future)
- **TollsFinesTab.tsx**: Tolls and fines table and actions
- **ExceptionsTab.tsx**: Exceptions table and management
- **BillingCyclesTab.tsx**: Billing cycle management
- **Shared Components**:
  - StatusBadge: Display status with color coding
  - FilterPanel: Advanced filtering interface
  - DataTable: Reusable data table with sorting/filtering
  - BulkActionToolbar: Bulk operation controls
  - ExceptionAlert: Exception notifications
  - SyncStatusIndicator: External system sync status

### Form Dialogs
- **TollFineFormDialog.tsx**: Create/edit toll/fine records
- **ExceptionFormDialog.tsx**: Create/edit exception records
- **BillingCycleFormDialog.tsx**: Create/edit billing cycles

## Database Schema

### Tables
1. **tolls_fines**: Store toll and fine records
2. **compliance_exceptions**: Track compliance violations and exceptions
3. **contract_billing_cycles**: Manage billing periods for contracts

### Key Foreign Keys
- `tolls_fines.customer_id` → `profiles.id`
- `tolls_fines.vehicle_id` → `vehicles.id`
- `compliance_exceptions.customer_id` → `profiles.id`
- `compliance_exceptions.vehicle_id` → `vehicles.id`
- `contract_billing_cycles.contract_id` → `contracts.id`

## Testing

### Unit Tests
Located in `src/lib/api/__tests__/` and `src/hooks/__tests__/`

Run tests:
```bash
npm test
```

Run with coverage:
```bash
npm run test:coverage
```

### Test Coverage
- API layer: CostComplianceAPI methods
- Hooks: React Query hooks with mock data
- Components: Dashboard rendering and interaction

### Integration Issues Fixed
1. **Toll/Fine Queries**: Fixed ambiguous profile relationships by specifying foreign key
2. **Vehicle Columns**: Changed `plate_number` to `license_plate` to match schema
3. **Exception Queries**: Corrected vehicle column references

## Usage Examples

### Fetching Dashboard Stats
```typescript
import { useCostComplianceDashboard } from '@/hooks/useCostCompliance';

function MyComponent() {
  const { data, isLoading } = useCostComplianceDashboard();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <p>Total Tolls/Fines: {data?.total_tolls_fines}</p>
      <p>Pending Amount: AED {data?.pending_billing_amount}</p>
    </div>
  );
}
```

### Creating a Toll/Fine Record
```typescript
import { useCreateTollFine } from '@/hooks/useTollsFines';

function CreateTollFine() {
  const createMutation = useCreateTollFine();
  
  const handleSubmit = (formData) => {
    createMutation.mutate({
      type: 'toll',
      amount: 5.0,
      vehicle_id: 'vehicle-123',
      incident_date: '2025-10-21',
      issuing_authority: 'Salik',
      // ... other fields
    });
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Generating Billing Preview
```typescript
import { useGenerateBillingPreview } from '@/hooks/useCostCompliance';

function BillingPreview() {
  const generatePreview = useGenerateBillingPreview();
  
  const handleGenerate = () => {
    generatePreview.mutate({
      contractId: 'contract-123',
      periodStart: '2025-01-01',
      periodEnd: '2025-01-31',
    });
  };
  
  return (
    <button onClick={handleGenerate}>
      Generate Preview
    </button>
  );
}
```

## Navigation
Access the Cost & Compliance module at: `/transactions/cost-compliance`

The page includes tabs for:
- Dashboard
- Expenses (future)
- Tolls & Fines
- Exceptions
- Billing Cycles

## Best Practices

1. **Data Validation**: Use Zod schemas in form dialogs for type-safe validation
2. **Error Handling**: All API calls include error handling with user-friendly toast messages
3. **Query Invalidation**: Mutations automatically invalidate relevant queries for fresh data
4. **Bulk Operations**: Use bulk actions for efficiency when processing multiple records
5. **Status Tracking**: Always update status fields when performing actions
6. **Documentation**: Keep resolution notes and audit trails for compliance

## Future Enhancements

1. **Expenses Module**: Full implementation of vehicle expense tracking
2. **Advanced Analytics**: Charts and graphs for cost trends
3. **External System Integration**: Real-time sync with Salik, RTA, and other providers
4. **Automated Billing**: Schedule automatic billing cycle generation
5. **Email Notifications**: Alert users about pending items and exceptions
6. **Mobile Support**: Responsive design improvements for mobile devices
7. **Export Templates**: Customizable export formats for different clients

## Troubleshooting

### Common Issues

1. **Query Errors**: Ensure foreign key relationships are correctly specified
2. **Column Not Found**: Verify column names match database schema
3. **Permission Errors**: Check Row Level Security (RLS) policies
4. **Sync Failures**: Validate external system credentials and endpoints

### Debug Tools
- Network tab: Monitor API requests and responses
- React Query DevTools: Inspect query state and cache
- Console logs: Review error messages and stack traces

## Support
For issues or questions, please refer to the main project documentation or contact the development team.
