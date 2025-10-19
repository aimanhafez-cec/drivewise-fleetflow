# Reservation Wizard Flow - Testing & Validation Guide

## Phase Implementation Summary

### ✅ Phase 1: Step Reordering (COMPLETE)
**New Flow:**
1. Step 1: Reservation Type
2. Step 2: Business Config  
3. Step 3: Customer
4. **Step 4: Dates & Locations** ← Moved from Step 5
5. **Step 5: Vehicle Lines** ← Moved from Step 6
6. **Step 6: Price List** ← Moved from Step 4
7. **Step 7: Pricing Summary** ← Moved from Step 11
8. Step 8: Services & Add-ons
9. Step 9: Airport Info
10. Step 10: Insurance
11. Step 11: Billing Config
12. Step 12: Payment
13. Step 13: Referral & Notes
14. Step 14: Confirmation

**Files Modified:**
- ✅ `ReservationWizardMain.tsx` - Updated step order in all relevant functions

---

### ✅ Phase 2: Reservation Type Validation (COMPLETE)
**Implementation:**
- ✅ `LineEditorModal.tsx` - Conditional vehicle selection UI based on reservation type
- ✅ `ReservationLineTable.tsx` - Display logic respects reservation type
- ✅ Added hooks for Make and Model selection (`useVehicleMakes`, `useVehicleModels`)

**Vehicle Selection by Type:**
- `vehicle_class` → Shows **only** vehicle class dropdown
- `make_model` → Shows **cascading** make/model selectors (no VIN)
- `specific_vin` → Shows **only** VIN/specific vehicle search

---

### ✅ Phase 3: Automatic Pricing Recalculation (COMPLETE)
**Implementation:**
- ✅ `Step2_5PriceList.tsx` - Recalculates all line prices when rates change
- ✅ `Step6PricingSummary.tsx` - Displays calculated line totals with validation
- ✅ `Step4MultiLineBuilder.tsx` - Calculates pricing on line save

**Pricing Flow:**
1. User selects vehicles in Step 5 → Lines created with zero pricing
2. User selects price list in Step 6 → **All lines automatically recalculated**
3. Step 7 displays detailed pricing breakdown with validation
4. If any line has zero pricing → Validation error prevents proceeding

---

### ✅ Phase 4: Enhanced Validation (COMPLETE)
**Step-Specific Validation:**
- **Step 1:** Reservation type required
- **Step 2:** Business unit, method, payment terms required
- **Step 3:** Customer selection + data loaded validation
- **Step 4:** Dates, times, locations + date logic validation
- **Step 5:** At least one line + vehicle selection matching reservation type
- **Step 6:** Price list selected + at least one valid rate configured
- **Step 7:** Total amount > 0 + all lines have calculated pricing
- **Step 8-14:** Existing validations maintained

---

## Testing Checklist

### Test 1: Vehicle Class Reservation Type
- [ ] Navigate to Step 1
- [ ] Select "Vehicle Class" reservation type
- [ ] Complete Steps 2-4
- [ ] In Step 5, verify **only** vehicle class dropdown is shown
- [ ] Add a line with vehicle class selection
- [ ] Navigate to Step 6 and select a price list
- [ ] Verify line pricing is calculated and shown in table
- [ ] Navigate to Step 7 and verify pricing summary displays correctly

### Test 2: Make/Model Reservation Type
- [ ] Start new reservation
- [ ] Select "Make + Model" reservation type
- [ ] Complete Steps 2-4
- [ ] In Step 5, verify **only** make and model dropdowns are shown
- [ ] Select a make → verify models load for that make
- [ ] Select a model and add the line
- [ ] Navigate to Step 6 and select a price list
- [ ] Verify line pricing recalculates automatically
- [ ] Navigate to Step 7 and verify make/model display correctly

### Test 3: Specific VIN Reservation Type
- [ ] Start new reservation
- [ ] Select "Specific VIN" reservation type
- [ ] Complete Steps 2-4
- [ ] In Step 5, verify **only** VIN/vehicle search is shown
- [ ] Select a specific vehicle by license plate
- [ ] Navigate to Step 6 and select a price list
- [ ] Verify line pricing recalculates
- [ ] Navigate to Step 7 and verify vehicle details display

### Test 4: Multi-Line Reservation
- [ ] Create a reservation with 3 different vehicle lines
- [ ] Each line has different dates/locations
- [ ] Navigate to Step 6 and select a price list
- [ ] Verify **all 3 lines** recalculate automatically
- [ ] Navigate to Step 7
- [ ] Verify line-by-line breakdown table shows all 3 lines
- [ ] Verify totals are summed correctly

### Test 5: Price List Change
- [ ] Create a reservation with 2 vehicle lines
- [ ] Navigate to Step 6 and select "Standard" price list
- [ ] Note the line totals in the table
- [ ] Change to "Premium" price list
- [ ] Verify **line totals update immediately** in the table
- [ ] Navigate to Step 7 and verify new totals are reflected

### Test 6: Validation Flow
- [ ] Try to proceed from Step 5 without adding any lines → Should block
- [ ] Add a line but don't select vehicle → Should block
- [ ] Try to proceed from Step 6 without selecting price list → Should block
- [ ] Select price list but ensure rates are zero → Should block
- [ ] Try to proceed from Step 7 with zero line totals → Should block
- [ ] Verify error messages are clear and actionable

### Test 7: Navigation & Progress Tracking
- [ ] Complete Steps 1-7 successfully
- [ ] Click on Step 3 in the progress bar → Should navigate back
- [ ] Verify data is preserved
- [ ] Click on Step 7 in progress bar → Should navigate forward
- [ ] Complete all steps to Step 14
- [ ] Verify all completed steps show checkmarks

### Test 8: Edge Cases
- [ ] Add a line, go to Step 6, select price list, go back to Step 5
- [ ] Edit the line (change dates) → Verify pricing updates
- [ ] Delete a line → Verify line numbers renumber correctly
- [ ] Duplicate a line → Verify pricing is calculated for new line
- [ ] Add add-ons and drivers → Verify they're included in pricing

---

## Expected Console Logs

When testing, you should see these console logs:

### Step 6 (Price List Selection):
```
💵 Price List Loaded: {
  priceListId: "standard",
  rates: { hourly: 50, daily: 150, ... },
  timestamp: "..."
}

🔄 Recalculating line pricing after price list change... {
  priceListId: "standard",
  lineCount: 2,
  rates: { hourly: 50, daily: 150, ... }
}

  ✓ Line 1 recalculated: {
    baseRate: 300,
    addOns: 0,
    driverFees: 0,
    lineTotal: 300
  }
  
  ✓ Line 2 recalculated: {
    baseRate: 450,
    addOns: 50,
    driverFees: 0,
    lineTotal: 500
  }
```

### Step Navigation:
```
🔄 Step Navigation: {
  from: 5,
  to: 6,
  stepName: "Price List"
}
```

### Line Save:
```
💰 Line Pricing Calculated: {
  lineNo: 1,
  baseRate: 150,
  addOns: 0,
  driverFees: 0,
  lineTotal: 150,
  dates: { checkOut: "2025-01-15", checkIn: "2025-01-16" }
}
```

---

## Known Limitations & Future Enhancements

1. **Static Price Lists:** Currently uses mock data - should be replaced with API calls
2. **Make/Model Data:** Uses static data - should integrate with actual vehicle inventory
3. **Line-Level VAT:** Currently VAT is calculated at reservation level, not per line
4. **Currency:** Hardcoded to AED - should support multi-currency

---

## Rollback Instructions

If issues are encountered, revert in reverse order:
1. Revert Phase 4 validation changes
2. Revert Phase 3 pricing recalculation
3. Revert Phase 2 vehicle selection changes  
4. Revert Phase 1 step reordering

All changes are isolated to these files:
- `ReservationWizardMain.tsx`
- `Step2_5PriceList.tsx`
- `Step6PricingSummary.tsx`
- `LineEditorModal.tsx`
- `Step4MultiLineBuilder.tsx`
- `ReservationLineTable.tsx`

---

## Success Criteria

✅ All 8 test scenarios pass
✅ Console logs show correct pricing calculations
✅ No console errors during normal flow
✅ Navigation works smoothly between all steps
✅ Validation prevents invalid submissions
✅ Pricing updates automatically when price list changes
✅ Vehicle selection UI matches reservation type
✅ Line totals display correctly in both Step 5 and Step 7
