# UAE Compliance Features

## Overview
The UAE Compliance module provides specialized features for managing traffic violations, toll charges, and driver license compliance within the United Arab Emirates. This module includes UAE-specific constants, RTA violation codes, Salik/Darb toll gates, and black points tracking.

## Features

### 1. UAE-Specific Constants (`src/lib/constants/uae-compliance.ts`)

#### Emirates
- All 7 UAE emirates with English and Arabic names
- Dubai, Abu Dhabi, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, Fujairah

#### Issuing Authorities
- **Dubai**: Salik, RTA Dubai, Dubai Police
- **Abu Dhabi**: Darb, Abu Dhabi Police, DoT Abu Dhabi
- **Sharjah**: Sharjah Police
- **Federal**: Federal Traffic Police, Ministry of Interior

#### Toll Gates

**Salik (Dubai) - 8 Gates:**
- Al Maktoum Bridge
- Al Garhoud Bridge
- Al Shindagha Tunnel
- Al Mamzar
- Al Safa
- Business Bay
- Al Barsha
- Mai Dubai

**Darb (Abu Dhabi) - 4 Gates:**
- Abu Dhabi - Mussafah
- Abu Dhabi - Al Falah
- Abu Dhabi - Shahama
- Al Ain - Bida Bin Saud

#### RTA Violation Codes
Comprehensive database of traffic violations including:
- **Speeding**: 4 levels based on excess speed
- **Traffic Signals**: Red light violations, stop sign violations
- **Parking**: Disabled zone, no parking, sidewalk parking
- **Vehicle**: Registration, expired documents, tinted windows
- **License**: Invalid license, expired license
- **Dangerous Driving**: Reckless driving, sudden swerving, tailgating
- **Mobile Phone**: Using phone while driving
- **Seatbelt**: Not wearing seatbelt

Each violation includes:
- Violation code (e.g., "1-001")
- Category
- English description
- Arabic description (عربي)
- Fine amount (AED)
- Black points

### 2. Black Points System

#### Thresholds
- **Warning**: 12 points
- **3-Month Suspension**: 24 points
- **6-Month Suspension**: 48 points
- **License Cancellation**: 72+ points

#### Functions
- `calculateBlackPoints()`: Calculate total black points for a driver
- `checkLicenseSuspension()`: Check if license should be suspended
- Returns suspension status, reason, and duration

### 3. Currency Formatting

#### Functions
- `formatAED(amount)`: Format amount in AED with English locale
- `formatAEDArabic(amount)`: Format amount in AED with Arabic locale

Examples:
```typescript
formatAED(1500.50); // "AED 1,500.50"
formatAEDArabic(1500.50); // "١٬٥٠٠٫٥٠ د.إ."
```

### 4. Fine Calculations

#### Late Fee System
- No discount for early payment (UAE rule)
- 10% late fee applied after 60 days
- Automatic calculation with `calculateFineDiscount()`

Example:
```typescript
const result = calculateFineDiscount(500, issuedDate, paymentDate);
// Returns: { amount, discount, hasLateFee, lateFee }
```

## Components

### 1. UAEViolationLookup
Interactive violation code lookup tool with:
- Search by code, English description, or Arabic text
- Filter by violation category
- Real-time search results
- Display of fine amount and black points
- Click to select violation

**Usage:**
```typescript
<UAEViolationLookup
  onSelectViolation={(violation) => {
    console.log(violation.code, violation.fine_aed);
  }}
/>
```

### 2. UAETollGateSelector
Toll gate selection interface with:
- Support for both Salik and Darb systems
- Gate name in English and Arabic
- Location details
- Rate display
- Radio button selection

**Usage:**
```typescript
<UAETollGateSelector
  system="salik"
  onSelectGate={(gate) => {
    console.log(gate.id, gate.rate);
  }}
/>
```

### 3. BlackPointsTracker
Visual black points tracking component with:
- Current points display
- Progress bar with threshold indicators
- Suspension status warnings
- Arabic language support option
- Threshold breakdown

**Usage:**
```typescript
<BlackPointsTracker
  blackPoints={18}
  driverName="Ahmed Ali"
  licenseNumber="123456789"
  showArabic={true}
/>
```

## Page: UAE Compliance Tools

**Route:** `/transactions/uae-compliance`

A dedicated page for UAE-specific compliance tools featuring:
- **Violations Tab**: Lookup and search RTA violation codes
- **Toll Gates Tab**: Browse Salik and Darb toll gates
- **Black Points Tab**: View sample black points trackers

## Integration with Cost & Compliance

The UAE features integrate seamlessly with the main Cost & Compliance module:

### 1. Toll/Fine Creation
When creating a toll or fine record:
```typescript
// Select toll gate
const gate = getTollGate('AL_MAKTOUM_BRIDGE', 'salik');
// Auto-fill: location, rate, issuing authority

// Select violation code
const violation = getViolationByCode('1-001');
// Auto-fill: amount, description, black points
```

### 2. Compliance Exceptions
Automatically detect UAE-specific exceptions:
- Driver approaching black points threshold (12+)
- Driver license suspended (24+)
- Unpaid fines past 60 days (late fee applied)
- Toll charges without vehicle assignment

### 3. Reporting
Generate UAE-specific reports:
- Black points summary by driver
- Toll charges by gate and system
- Violations by authority and category
- Arabic and English bilingual reports

## Testing

### Unit Tests
Located in `src/lib/api/__tests__/uae-compliance.test.ts`

Run tests:
```bash
npm test -- uae-compliance.test.ts
```

### Test Coverage
- Currency formatting (AED)
- Fine discount calculations
- Violation code lookup
- Toll gate lookup
- Black points calculations
- License suspension checks

## Usage Examples

### Example 1: Create Salik Toll Charge
```typescript
import { getTollGate, formatAED } from '@/lib/constants/uae-compliance';

const gate = getTollGate('AL_MAKTOUM_BRIDGE', 'salik');

const tollData = {
  type: 'toll',
  amount: gate.rate,
  location: gate.location,
  gate_id: gate.id,
  issuing_authority: 'salik',
  incident_date: new Date().toISOString(),
};
```

### Example 2: Create Fine with Violation Code
```typescript
import { getViolationByCode } from '@/lib/constants/uae-compliance';

const violation = getViolationByCode('1-001');

const fineData = {
  type: 'fine',
  amount: violation.fine_aed,
  category: violation.category,
  violation_code: violation.code,
  issuing_authority: 'rta_dubai',
  incident_date: new Date().toISOString(),
};
```

### Example 3: Check Driver Black Points
```typescript
import { calculateBlackPoints, checkLicenseSuspension } from '@/lib/constants/uae-compliance';

const violations = [
  { code: '1-001' }, // Speeding 60+ km/h - 12 points
  { code: '2-001' }, // Red light - 12 points
];

const totalPoints = calculateBlackPoints(violations); // 24
const suspension = checkLicenseSuspension(totalPoints);

if (suspension.suspended) {
  console.log(`License suspended for ${suspension.duration}`);
  console.log(suspension.reason); // English
  console.log(suspension.reason_ar); // Arabic
}
```

### Example 4: Calculate Fine with Late Fee
```typescript
import { calculateFineDiscount } from '@/lib/constants/uae-compliance';

const fineAmount = 500;
const issuedDate = new Date('2025-01-01');
const paymentDate = new Date('2025-03-15'); // 73 days later

const result = calculateFineDiscount(fineAmount, issuedDate, paymentDate);

console.log(`Original fine: AED ${fineAmount}`);
console.log(`Late fee: AED ${result.lateFee}`);
console.log(`Total amount: AED ${result.amount}`);
// Output:
// Original fine: AED 500
// Late fee: AED 50
// Total amount: AED 550
```

## Best Practices

1. **Always use constants**: Import from `uae-compliance.ts` instead of hardcoding values
2. **Include Arabic translations**: Use both English and Arabic fields for bilingual support
3. **Track black points**: Update driver records with each new violation
4. **Check suspension status**: Verify driver eligibility before assignment
5. **Apply late fees**: Automatically calculate late fees for overdue fines
6. **Use correct authorities**: Match toll/fine type with appropriate authority

## Future Enhancements

1. **Real-time Integration**: Connect with Salik/Darb APIs for live toll data
2. **RTA API**: Integrate with RTA for real-time fine checks
3. **MOI Integration**: Connect with Ministry of Interior for license status
4. **SMS Notifications**: Alert drivers about new violations and black points
5. **Payment Gateway**: Direct payment of fines through the system
6. **Mobile App**: Driver-facing mobile app for violation tracking
7. **Multilingual**: Expand beyond English/Arabic to support more languages

## Support

For questions or issues with UAE-specific features:
- Check the constants file for available data
- Review test cases for usage examples
- Refer to RTA official documentation for regulation updates

## References

- [Dubai RTA Official Website](https://rta.ae)
- [Salik Official Website](https://salik.ae)
- [Abu Dhabi DoT](https://dot.abudhabi.ae)
- [UAE Ministry of Interior](https://www.moi.gov.ae)
