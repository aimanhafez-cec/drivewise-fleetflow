# Phase 10: Business Configuration Components

## Overview
Phase 10 adds comprehensive business configuration capabilities to the Agreement Wizard with three new standalone step components tailored for UAE car rental operations.

## Components Created

### 1. BusinessConfigurationStep
**Location:** `src/components/agreements/wizard/BusinessConfigurationStep.tsx`

**Purpose:** Configure core business settings that affect billing, reporting, and operational handling.

**Fields:**
- **Business Unit** (Required)
  - Options: Dubai Operations, Abu Dhabi Operations, Sharjah Operations, Corporate Fleet
  - Used for: Branch allocation, revenue reporting, fleet assignment
  
- **Reservation Method** (Required)
  - Options: Walk-in, Online Booking, Phone Reservation, Corporate Account, Travel Agency
  - Used for: Booking channel tracking, performance analysis, commission tracking
  
- **Payment Terms** (Required)
  - Options: Cash on Delivery, Net 7/15/30 Days, Prepaid
  - Used for: Payment schedule, invoice generation timing

**Integration:**
- Data stored in: `wizardData.businessConfig`
- Fields: `businessUnitId`, `reservationMethodId`, `paymentTermsId`

### 2. EnhancedPricingStep
**Location:** `src/components/agreements/wizard/EnhancedPricingStep.tsx`

**Purpose:** Comprehensive pricing configuration with real-time calculations and VAT.

**Sections:**

#### Price List Selection
- Standard Rates, Weekend Special, Corporate Rates, Seasonal Rates
- Displays base daily rate

#### Insurance Configuration
- **Insurance Level**: Basic (AED 3000), Standard (AED 1500), Premium (AED 500), Zero Excess
- **Insurance Provider**: RAK Insurance, Orient Insurance, Allianz Insurance
- **Coverage Type**: Comprehensive (+AED 25/day) or Third Party Liability (+AED 15/day)
- **Additional Coverages**:
  - Personal Accident Insurance (+AED 10/day)
  - Theft Protection (+AED 8/day)
  - Glass Protection (+AED 5/day)
  - Tyre & Rim Protection (+AED 7/day)
- **Excess Display**: Shows current excess amount

#### Maintenance Package
- No Maintenance (Free)
- Basic Service (+AED 15/day)
- Full Maintenance (+AED 30/day)

#### Discount Configuration
- Discount Code field
- Discount Reason field
- Fixed Amount (AED) or Percentage (%)

#### Real-Time Pricing Summary
Calculates and displays:
- Base Rate
- Insurance (base + additional coverages)
- Maintenance
- Subtotal
- Discount (if applicable)
- Taxable Amount
- VAT (5% - UAE standard)
- **Total**

**Integration:**
- Data stored in: `wizardData.enhancedPricing`
- Fields: `priceListId`, `insuranceConfig`, `maintenancePackageId`, `discountConfig`

### 3. EnhancedBillingStep
**Location:** `src/components/agreements/wizard/EnhancedBillingStep.tsx`

**Purpose:** Configure billing party and UAE tax compliance.

**Sections:**

#### Bill-To Configuration
Four billing types with visual cards:

1. **Customer** (👤)
   - Bill directly to customer
   - Fields: Customer ID (auto-filled)

2. **Corporate** (🏢)
   - Corporate account billing
   - Fields: Corporate Account*, Purchase Order Number*
   - PO number required for billing matching

3. **Insurance** (🛡️)
   - Insurance claim billing
   - Fields: Insurance Company*, Claim Number*, Policy Number*

4. **Agency** (✈️)
   - Travel agency billing
   - Fields: Travel Agency*, Voucher Number*
   - Voucher for commission tracking

#### UAE Tax Configuration
- **Tax Level** (Required)
  - Standard Rate (5% VAT) - Default
  - Zero-Rated
  - Exempt
  
- **Tax Code** (Required)
  - Dynamic options based on selected tax level:
    - Standard: TC001 (Standard Supply), TC002 (Domestic Reverse Charge)
    - Zero-Rated: TC003 (Zero-Rated Supply)
    - Exempt: TC004 (Exempt Supply)

**UAE VAT Compliance Alert:**
Displays informational alert about VAT compliance requirements per FTA guidelines.

**Integration:**
- Data stored in: `wizardData.enhancedBilling`
- Fields: `billToType`, `billToDetails`, `taxConfig`

## Data Structure

All components integrate with the existing `EnhancedWizardData` type (already defined in `src/types/agreement-wizard.ts`):

```typescript
interface EnhancedWizardData {
  // ... existing fields ...
  
  businessConfig?: {
    businessUnitId?: string;
    paymentTermsId?: string;
    reservationMethodId?: string;
  };

  enhancedPricing?: {
    priceListId?: string;
    insuranceConfig?: {
      levelId?: string;
      groupId?: string;
      providerId?: string;
      coverageType?: string;
      excess?: number;
      additionalCoverages?: string[];
    };
    maintenancePackageId?: string;
    discountConfig?: {
      code?: string;
      amount?: number;
      percentage?: number;
      reason?: string;
    };
  };

  enhancedBilling?: {
    billToType?: 'customer' | 'corporate' | 'insurance' | 'agency';
    billToDetails?: {
      customerId?: string;
      corporateId?: string;
      insuranceId?: string;
      agencyId?: string;
      poNumber?: string;
      claimNumber?: string;
      policyNumber?: string;
      voucherNumber?: string;
    };
    taxConfig?: {
      taxLevelId?: string;
      taxCodeId?: string;
    };
  };
}
```

## Integration Options

### Option A: Add as New Steps (Recommended)
Add these as standalone steps in the wizard flow:
1. After existing steps, before final review
2. Mark as optional steps that can be skipped
3. Maintain separate step numbers

### Option B: Integrate into Existing Steps
Enhance existing steps with new fields:
- Add business config to Step 1 (Agreement Terms)
- Replace Step 3 (Pricing) with EnhancedPricingStep
- Replace Step 5 (Billing & Payment) with EnhancedBillingStep

## Mock Data Context

All mock data is UAE car rental specific:

### Business Units
- Dubai Operations (DXB)
- Abu Dhabi Operations (AUH)
- Sharjah Operations (SHJ)
- Corporate Fleet (CORP)

### Payment Terms
- Cash on Delivery (0 days)
- Net 7/15/30 Days
- Prepaid (-1 days)

### Reservation Methods
- Walk-in
- Online Booking
- Phone Reservation
- Corporate Account
- Travel Agency

### Insurance
- Providers: RAK, Orient, Allianz
- Levels: Basic (3000), Standard (1500), Premium (500), Zero (0)
- Additional coverages with daily rates

### Tax
- Standard Rate: 5% VAT (UAE default)
- Zero-Rated and Exempt options
- FTA-compliant tax codes

## Usage Example

```typescript
// In EnhancedAgreementWizard.tsx

// Option A: Add as new steps
<BusinessConfigurationStep
  data={wizardData.businessConfig || {}}
  onChange={(data) => updateWizardData('businessConfig', data)}
/>

<EnhancedPricingStep
  data={wizardData.enhancedPricing || {}}
  baseAmount={150} // Pass base rate
  onChange={(data) => updateWizardData('enhancedPricing', data)}
/>

<EnhancedBillingStep
  data={wizardData.enhancedBilling || {}}
  onChange={(data) => updateWizardData('enhancedBilling', data)}
/>
```

## Features

### ✅ Implemented
- All three components with full UI
- Real-time pricing calculations with VAT
- Context-specific billing fields
- UAE-specific mock data
- Responsive design with Tailwind
- Semantic color tokens
- Validation-ready structure
- TypeScript types

### 🔄 Future Enhancements
- Replace mock data with actual LOV components (CustomerSelect, VehicleSelect pattern)
- Connect to backend APIs
- Add server-side validation
- Implement dependent field logic
- Add autocomplete for codes/IDs
- Integrate with reporting system
- Add audit trail for configuration changes

## Testing Checklist

- [ ] All fields render correctly
- [ ] Real-time pricing calculations work
- [ ] Bill-To type switches fields correctly
- [ ] Tax code options filter by tax level
- [ ] Insurance excess updates when level changes
- [ ] Additional coverages toggle correctly
- [ ] Discount calculations (amount vs percentage)
- [ ] Data persists in wizard state
- [ ] Required field indicators display
- [ ] Responsive layout on mobile
- [ ] Dark mode styling

## Notes

- All components are **optional** - existing wizard functionality unchanged
- Mock data follows UAE business context as specified
- Components follow project design system (semantic tokens, HSL colors)
- Ready for backend integration when API endpoints available
- Follows project guardrails for LOV pattern (future enhancement)
