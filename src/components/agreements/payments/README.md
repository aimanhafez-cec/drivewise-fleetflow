# Payment Components

This directory contains all components related to the multi-payment method system for financial settlement.

## Components

### MultiPaymentAllocator
Main component for allocating payments across multiple methods with real-time validation.

**Features:**
- Support for multiple payment methods (loyalty points, wallet, credit, cards, links)
- Real-time balance validation
- Payment allocation sliders and inputs
- Customer profile integration

**Usage:**
```tsx
<MultiPaymentAllocator
  totalAmount={5000}
  customerProfile={profile}
  allocation={allocation}
  onAllocationChange={handleChange}
  onPaymentComplete={handleComplete}
/>
```

### PaymentReceipt
Displays comprehensive payment receipt with all transaction details.

**Features:**
- Itemized charges breakdown
- Multiple payment methods display
- Transaction references
- Loyalty points redeemed
- Wallet balance changes
- Security deposit info
- Print, email, download, SMS options

**Usage:**
```tsx
<PaymentReceipt
  agreementNo="AGR-000123"
  customerName="John Doe"
  customerEmail="john@example.com"
  totalAmount={5000}
  splitPayments={payments}
  completedAt={new Date().toISOString()}
/>
```

### PaymentReceiptDialog
Modal wrapper for PaymentReceipt component.

**Usage:**
```tsx
<PaymentReceiptDialog
  open={showReceipt}
  onOpenChange={setShowReceipt}
  {...receiptProps}
/>
```

### Method-Specific Components

#### CreditPayment
Handles account credit payment with credit limit tracking.

#### PaymentLinkPayment
Generates and manages payment links with QR codes.

#### CustomerWalletPayment
Processes wallet balance deductions with transaction history.

#### LoyaltyPointsPayment
Manages loyalty points redemption with conversion rate display.

## Hooks

### useCustomerPaymentProfile
Fetches and caches customer payment profile data.

```tsx
const { profile, isLoading, error, refetch } = useCustomerPaymentProfile(customerId);
```

### useSplitPayments
Manages split payment allocation and processing.

```tsx
const {
  allocation,
  setAllocation,
  processPayments,
  isProcessing,
  validateAllocation
} = useSplitPayments({
  agreementId,
  customerId,
  totalAmount,
  onSuccess
});
```

### usePaymentReceipt
Manages receipt display and distribution actions.

```tsx
const {
  receiptData,
  isReceiptOpen,
  showReceipt,
  hideReceipt,
  printReceipt,
  emailReceipt,
  downloadReceipt,
  sendSMS
} = usePaymentReceipt();
```

## API Integration

### CustomerPaymentAPI
Located in `src/lib/api/customer-payment-profile.ts`

**Methods:**
- `getPaymentProfile(customerId)` - Fetch customer balances
- `deductWalletBalance(customerId, amount)` - Deduct from wallet
- `redeemLoyaltyPoints(customerId, points)` - Redeem points
- `useCreditLimit(customerId, amount)` - Use credit

### PaymentLinksAPI
Located in `src/lib/api/payment-links.ts`

**Methods:**
- `createPaymentLink(agreementId, customerId, amount, expiresInHours)` - Generate link
- `verifyPaymentLink(linkToken)` - Verify link validity
- `processLinkPayment(linkToken, paymentMethod, transactionRef)` - Process payment

### SplitPaymentsAPI
Located in `src/lib/api/split-payments.ts`

**Methods:**
- `validateAllocation(allocation)` - Validate payment allocation
- `processSplitPayments(agreementId, customerId, allocation)` - Process all payments
- `getPaymentBreakdown(agreementId)` - Get payment history
- `rollbackPayments(customerId, payments)` - Rollback failed payments

## Database Schema

### Tables
- `payment_links` - Payment link tracking
- `agreement_split_payments` - Split payment records
- `profiles.wallet_balance` - Customer wallet balance
- `customer_loyalty_profile` - Loyalty points and tier

### Types
All TypeScript types are defined in `src/lib/api/agreement-payments.ts`:
- `PaymentMethod` - Supported payment methods
- `SplitPaymentItem` - Individual payment allocation
- `PaymentAllocation` - Complete payment breakdown
- `CustomerPaymentProfile` - Customer balances and limits

## Conversion Rates

### Loyalty Points
- Default: 100 points = 1 AED
- Minimum redemption: 1,000 points
- Points expire after 1 year

### Processing Fees
Different payment methods may have different processing fees configured in the system.

## Testing

### Unit Tests
```bash
npm test payment
```

### Integration Tests
```bash
npm test integration/payment
```

## Future Enhancements

1. **PDF Generation**: Implement server-side PDF generation for receipts
2. **Email Templates**: Create branded email templates for receipt distribution
3. **SMS Integration**: Integrate with SMS gateway for receipt links
4. **Payment Gateway**: Integrate real payment gateway for card processing
5. **Refund Processing**: Add refund workflow for completed payments
6. **Payment Plans**: Support for installment payments
7. **Multi-Currency**: Support for multiple currencies
8. **Audit Trail**: Enhanced audit logging for all payment operations
