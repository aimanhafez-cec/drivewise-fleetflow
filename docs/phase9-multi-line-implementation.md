# Phase 9: Multi-Line Agreement Support - Implementation Guide

## Overview
Phase 9 introduces support for creating agreements with multiple vehicles in a single wizard session. This is useful for:
- Corporate fleet handovers
- Group rentals (family/friends)
- Event-based rentals (weddings, conferences)
- Long-term corporate contracts with multiple vehicles

## Architecture

### 1. Data Structure (`src/types/agreement-line.ts`)

#### `AgreementLine`
Represents a single vehicle line within an agreement:
- Unique ID and line number
- Vehicle details (class/specific vehicle)
- Drivers (primary + additional)
- Rental period (check-out/check-in dates, times, locations)
- Line-specific pricing and add-ons
- Validation status

#### `MultiLineAgreementData`
Header-level data shared across all lines:
- Customer information
- Agreement type and purpose
- Consolidated pricing (sum of all lines)
- Shared settings (mileage, cross-border, payment)

### 2. State Management (`src/hooks/useMultiLineAgreement.ts`)

#### Key Features:
- **Line Management**: Add, remove, duplicate, update lines
- **Validation**: Line-level and multi-line validation
- **Pricing**: Auto-calculate totals from all lines
- **Reordering**: Change line sequence

#### Usage Example:
```typescript
const {
  multiLineData,
  addLine,
  removeLine,
  duplicateLine,
  updateLine,
  validateAllLines,
  recalculateTotalPricing,
  totalAmount,
  lineCount,
} = useMultiLineAgreement({
  enabled: true,
  initialData: existingData,
});
```

### 3. UI Components

#### `MultiLineToggle` (`src/components/agreements/wizard/MultiLineToggle.tsx`)
- Enable/disable multi-line mode
- Shows current line count
- Explains multi-line benefits

#### `MultiLineBuilder` (`src/components/agreements/wizard/MultiLineBuilder.tsx`)
- Visual list of all lines
- Expand/collapse line details
- Add, remove, duplicate, edit actions
- Shows validation errors per line
- Total summary at bottom

#### `LineConfigDialog` (`src/components/agreements/wizard/LineConfigDialog.tsx`)
- Modal for configuring line details
- Vehicle selection
- Rental period and locations
- Pricing configuration
- Notes and instructions

#### `MultiLineAgreementStep` (`src/components/agreements/wizard/MultiLineAgreementStep.tsx`)
- Complete step component combining all UI
- Integrates toggle, builder, and dialog
- Handles all line operations

## Integration into Wizard

### Option 1: Add as Dedicated Step

Add a new step between "Terms" and "Inspection":

```typescript
// In EnhancedAgreementWizard.tsx
const STEP_CONFIG = [
  { id: 0, number: 0, title: 'Source', ... },
  { id: 1, number: 1, title: 'Terms', ... },
  { id: 2, number: 2, title: 'Lines', description: 'Vehicle lines', icon: '🚗' },
  { id: 3, number: 3, title: 'Inspection', ... },
  // ... rest of steps
];

// In renderStepContent():
case 2:
  return (
    <MultiLineAgreementStep
      customerId={wizardData.step1.customerId}
      onDataChange={(data) => updateWizardData('multiLine', data)}
      initialData={wizardData.multiLine}
    />
  );
```

### Option 2: Integrate into Existing Terms Step

Add multi-line toggle at the top of Step 1:

```typescript
// In AgreementTermsStep.tsx
<MultiLineToggle
  enabled={multiLineEnabled}
  onToggle={setMultiLineEnabled}
  lineCount={lineCount}
  disabled={!customerId}
/>

{multiLineEnabled && (
  <MultiLineBuilder
    lines={lines}
    onAddLine={handleAddLine}
    onRemoveLine={handleRemoveLine}
    // ... other props
  />
)}
```

## Validation Rules

### Line-Level Validation:
- ✅ Vehicle must be selected (class or specific)
- ✅ Check-out date/time required
- ✅ Check-in date/time required
- ✅ Check-in must be after check-out
- ✅ Locations required for both check-out and check-in
- ✅ Base rate must be greater than 0

### Multi-Line Validation:
- ✅ At least one valid line required
- ✅ All lines must have valid dates
- ✅ No overlapping dates for same vehicle
- ✅ Pricing totals must match sum of lines

## Pricing Calculation

### Line-Level:
```
Line Subtotal = Base Rate + Insurance + Maintenance + Add-ons
Line Taxable = Subtotal - Discount
Line VAT = Taxable × 5%
Line Total = Taxable + VAT
```

### Agreement-Level:
```
Agreement Total = Sum of All Line Totals
```

## Best Practices

### 1. Performance
- Only render expanded line details when needed (use Collapsible)
- Debounce pricing recalculation
- Lazy load line configuration dialog

### 2. UX Considerations
- Auto-add first line when enabling multi-line mode
- Prevent removing the last line
- Show validation errors prominently
- Provide duplicate feature for similar lines
- Display total amount clearly

### 3. Data Persistence
- Save multi-line data with wizard progress
- Support restoring multi-line state from localStorage
- Include multi-line flag in submission

## API Integration

### Submission Format:
```json
{
  "customer_id": "uuid",
  "agreement_type": "daily",
  "is_multi_line": true,
  "lines": [
    {
      "line_number": 1,
      "vehicle_class_id": "suv",
      "check_out_datetime": "2025-01-15T10:00:00Z",
      "check_in_datetime": "2025-01-17T10:00:00Z",
      "pricing": { "total": 450.00 },
      ...
    },
    {
      "line_number": 2,
      ...
    }
  ],
  "total_amount": 900.00
}
```

## Testing Checklist

- [ ] Can enable/disable multi-line mode
- [ ] Can add multiple lines
- [ ] Can edit line details
- [ ] Can duplicate existing lines
- [ ] Can remove lines (except last one)
- [ ] Line validation works correctly
- [ ] Pricing totals calculate correctly
- [ ] Can reorder lines
- [ ] Multi-line data persists on page refresh
- [ ] Submission includes all line data
- [ ] Works with existing single-line flow

## Future Enhancements

1. **Line Templates**: Pre-configured vehicle types
2. **Bulk Import**: Upload CSV with multiple lines
3. **Line Dependencies**: Link related lines (e.g., car + trailer)
4. **Visual Timeline**: See all rental periods on calendar
5. **Group Discounts**: Apply discounts based on line count
6. **Split Payment**: Different payment methods per line

## Migration Notes

### From Single-Line to Multi-Line:
```typescript
// Convert single agreement to multi-line format
const convertToMultiLine = (singleAgreement) => ({
  ...singleAgreement,
  lines: [{
    id: generateId(),
    lineNumber: 1,
    vehicleClassId: singleAgreement.vehicleClassId,
    checkOutDateTime: singleAgreement.pickupDateTime,
    checkInDateTime: singleAgreement.dropoffDateTime,
    // ... map other fields
  }],
  is_multi_line: true,
});
```

### Backward Compatibility:
- Single-line agreements remain unchanged
- Multi-line is opt-in via toggle
- API should handle both formats
- Database should support line storage

## Support & Troubleshooting

### Common Issues:

**Issue**: Lines not validating
- Check all required fields are filled
- Ensure dates are in correct format
- Verify locations are selected

**Issue**: Pricing not calculating
- Call `recalculateTotalPricing()` after line changes
- Check that line pricing breakdowns are populated

**Issue**: Can't edit line
- Ensure line exists in state
- Check dialog is receiving correct line data
- Verify line ID is valid

## Documentation
- User Guide: How to create multi-line agreements
- API Reference: Multi-line endpoints
- Database Schema: Line storage structure
