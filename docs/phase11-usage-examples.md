# Phase 11: Usage Examples - Quick Start Guide

## Complete Step Enhancement Example

Here's a complete example of enhancing an agreement step with all Phase 11 components:

```typescript
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedDatesLocations } from '@/components/agreements/wizard/EnhancedDatesLocations';
import { EnhancedFormField } from '@/components/agreements/wizard/EnhancedFormField';
import { FormLoadingState } from '@/components/agreements/wizard/FormLoadingState';
import { FormEmptyState } from '@/components/agreements/wizard/FormEmptyState';
import { SimpleFadeTransition } from '@/components/agreements/wizard/StepTransition';
import { User, FileX } from 'lucide-react';

interface EnhancedAgreementTermsStepProps {
  data: any;
  onChange: (field: string, value: any) => void;
  errors: string[];
}

export const EnhancedAgreementTermsStep = ({
  data,
  onChange,
  errors
}: EnhancedAgreementTermsStepProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if customer is selected
  if (!data.customerId) {
    return (
      <FormEmptyState
        icon={User}
        title="No Customer Selected"
        description="Please select a customer to continue with the agreement. Customer information is required for all rental agreements."
        actionLabel="Select Customer"
        onAction={() => {/* Navigate to customer selection */}}
      />
    );
  }

  // Show loading state while fetching data
  if (isLoading) {
    return <FormLoadingState message="Loading customer preferences..." fields={6} />;
  }

  return (
    <SimpleFadeTransition stepKey={data.customerId}>
      <div className="space-y-6">
        {/* Customer Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <EnhancedFormField
              id="customer-name"
              label="Full Name"
              type="text"
              value={data.customerName}
              onChange={(value) => onChange('customerName', value)}
              placeholder="John Doe"
              required
              error={errors.find(e => e.includes('name'))}
              hasSmartDefault={!!data.previousName}
              smartDefaultValue={data.previousName}
              tooltip="Customer's full legal name as per identification documents"
            />

            <EnhancedFormField
              id="customer-email"
              label="Email Address"
              type="email"
              value={data.email}
              onChange={(value) => onChange('email', value)}
              placeholder="customer@example.com"
              required
              error={errors.find(e => e.includes('email'))}
              helperText="Agreement copy will be sent to this address"
              hasSmartDefault={!!data.previousEmail}
              smartDefaultValue={data.previousEmail}
              maxLength={100}
            />

            <EnhancedFormField
              id="customer-phone"
              label="Phone Number"
              type="tel"
              value={data.phone}
              onChange={(value) => onChange('phone', value)}
              placeholder="+971 50 123 4567"
              required
              error={errors.find(e => e.includes('phone'))}
              helperText="Used for agreement updates and notifications"
            />
          </CardContent>
        </Card>

        {/* Dates & Locations */}
        <EnhancedDatesLocations
          pickupDateTime={data.pickupDateTime}
          dropoffDateTime={data.dropoffDateTime}
          pickupLocationId={data.pickupLocationId}
          dropoffLocationId={data.dropoffLocationId}
          onPickupDateTimeChange={(value) => onChange('pickupDateTime', value)}
          onDropoffDateTimeChange={(value) => onChange('dropoffDateTime', value)}
          onPickupLocationChange={(value) => onChange('pickupLocationId', value)}
          onDropoffLocationChange={(value) => onChange('dropoffLocationId', value)}
          
          // Smart defaults from customer history
          hasSmartDefaults={data.hasHistory}
          defaultPickupTime="10:00 AM"
          defaultDropoffTime="10:00 AM"
          defaultPickupLocation="Downtown Branch"
          
          // Advanced options
          gracePeriodMinutes={data.gracePeriod || 60}
          onGracePeriodChange={(value) => onChange('gracePeriod', value)}
          billingCycle={data.billingCycle || 'daily'}
          onBillingCycleChange={(value) => onChange('billingCycle', value)}
          afterHoursPickup={data.afterHours || false}
          onAfterHoursPickupChange={(value) => onChange('afterHours', value)}
          
          // One-way fee
          oneWayFee={data.oneWayFee}
          
          errors={errors.filter(e => 
            e.includes('pickup') || e.includes('drop') || e.includes('location')
          )}
        />

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <EnhancedFormField
              id="special-instructions"
              label="Special Instructions"
              type="textarea"
              value={data.specialInstructions || ''}
              onChange={(value) => onChange('specialInstructions', value)}
              placeholder="Any special requirements or instructions..."
              helperText="These notes will be visible to the operations team"
              tooltip="Add any special handling instructions, delivery requirements, or customer preferences"
              maxLength={500}
              rows={4}
            />

            <EnhancedFormField
              id="internal-notes"
              label="Internal Notes"
              type="textarea"
              value={data.internalNotes || ''}
              onChange={(value) => onChange('internalNotes', value)}
              placeholder="Internal notes (not visible to customer)..."
              helperText="For internal use only"
              maxLength={1000}
              rows={4}
            />
          </CardContent>
        </Card>
      </div>
    </SimpleFadeTransition>
  );
};
```

## Integration into Main Wizard

```typescript
// In EnhancedAgreementWizard.tsx

import { SimpleFadeTransition } from './wizard/StepTransition';
import { EnhancedAgreementTermsStep } from './wizard/EnhancedAgreementTermsStep';

const renderStepContent = () => {
  const errorMessages = validationResult.errors.map(e => e.message);
  
  return (
    <SimpleFadeTransition stepKey={progress.currentStep}>
      {(() => {
        switch (progress.currentStep) {
          case 1:
            return (
              <EnhancedAgreementTermsStep
                data={wizardData.step1}
                onChange={(field, value) => handleStepDataChange('step1', field, value)}
                errors={errorMessages}
              />
            );
          // ... other steps
        }
      })()}
    </SimpleFadeTransition>
  );
};
```

## Quick Implementation Checklist

### For Each Wizard Step:

1. **Replace Basic Inputs**
```typescript
// ❌ Before
<Input type="text" value={name} onChange={setName} />

// ✅ After
<EnhancedFormField
  id="name"
  label="Name"
  value={name}
  onChange={setName}
  required
  error={nameError}
  helperText="Enter customer's full legal name"
/>
```

2. **Add Date/Time Enhancement**
```typescript
// ❌ Before
<Input type="datetime-local" value={pickup} onChange={setPickup} />
<Input type="datetime-local" value={dropoff} onChange={setDropoff} />

// ✅ After
<EnhancedDatesLocations
  pickupDateTime={pickup}
  dropoffDateTime={dropoff}
  onPickupDateTimeChange={setPickup}
  onDropoffDateTimeChange={setDropoff}
  // ... other props
/>
```

3. **Add Loading States**
```typescript
// ❌ Before
{isLoading && <p>Loading...</p>}

// ✅ After
{isLoading && <FormLoadingState message="Loading data..." fields={4} />}
```

4. **Add Empty States**
```typescript
// ❌ Before
{!data && <p>No data</p>}

// ✅ After
{!data && (
  <FormEmptyState
    icon={FileX}
    title="No Data Available"
    description="Start by adding some data..."
    actionLabel="Add Data"
    onAction={handleAdd}
  />
)}
```

5. **Add Tooltips**
```typescript
// ✅ Add to complex fields
<Label>
  Tax Registration Number
  <HelperTooltip content="Required for corporate billing" />
</Label>
```

6. **Add Transitions**
```typescript
// ✅ Wrap step content
<SimpleFadeTransition stepKey={currentStep}>
  {renderStepContent()}
</SimpleFadeTransition>
```

## Testing Your Enhancements

1. **Visual Regression**: Check all steps render correctly
2. **Keyboard Navigation**: Tab through all fields
3. **Error States**: Trigger validation errors
4. **Loading States**: Verify loading UI appears
5. **Empty States**: Check empty state CTAs work
6. **Tooltips**: Hover/focus to show tooltips
7. **Animations**: Smooth transitions between steps
8. **Smart Defaults**: Verify auto-fill works
9. **Quick Duration**: Test all duration buttons
10. **Mobile Responsive**: Check on small screens

## Performance Tips

1. Use `React.memo` for heavy components
2. Debounce input changes (300ms)
3. Lazy load non-critical components
4. Memoize calculated values
5. Avoid re-rendering entire form on single field change

## Common Pitfalls to Avoid

❌ **Don't:**
- Overuse animations (causes motion sickness)
- Put tooltips on every field
- Make all fields required
- Use placeholder as label replacement
- Show loading state for fast operations (<200ms)

✅ **Do:**
- Use animations sparingly and purposefully
- Add tooltips only for complex/confusing fields
- Mark only truly required fields
- Use proper labels and placeholders together
- Show skeleton screens for expected delays

## Next Steps

1. Review current wizard steps
2. Identify which steps need enhancement
3. Replace basic components with enhanced versions
4. Add loading/empty states
5. Test thoroughly
6. Gather user feedback
7. Iterate and improve

Phase 11 implementation complete! 🎉
