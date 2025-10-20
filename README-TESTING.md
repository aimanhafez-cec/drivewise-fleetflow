# Testing Guide for Custody Management System

## Overview
This project uses **Vitest** for unit and integration testing, with **@testing-library/react** for component testing.

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

```
src/
├── lib/
│   ├── validation/
│   │   └── __tests__/
│   │       └── custody.test.ts
│   └── api/
│       └── __tests__/
│           └── custody.test.ts
├── hooks/
│   └── __tests__/
│       └── useCustodyValidation.test.tsx
└── test/
    ├── setup.ts
    └── mocks/
        └── supabase.ts
```

## Test Coverage

### Validation Tests (`src/lib/validation/__tests__/custody.test.ts`)
- ✅ validateForSubmission()
  - Required field validation
  - Date logic validation
  - Duration warnings (short/long)
  - Special rate code requirements
- ✅ validateStatusTransition()
  - Valid transitions
  - Invalid transitions
  - Closure requirements
  - Void warnings
- ✅ validateVehicleEligibility()
  - Vehicle status checks
  - Registration expiry
  - Condition validation
- ✅ validateDocumentRequirements()
  - Required documents by reason
  - Missing document detection
  - Recommendation warnings
- ✅ calculateSLA()
  - Timeline calculation
  - Breach detection

### API Tests (`src/lib/api/__tests__/custody.test.ts`)
- ✅ CRUD Operations
  - Create custody transaction
  - Get custody transaction
  - Update custody transaction
  - Delete custody transaction
- ✅ Lifecycle Management
  - Submit for approval
  - Approve custody
  - Reject custody
  - Close custody
  - Void custody
- ✅ List & Search
  - List with filters
  - Search functionality

### Hook Tests (`src/hooks/__tests__/useCustodyValidation.test.tsx`)
- ✅ Validation wrapper functions
- ✅ Toast notification integration
- ✅ Loading state management

## Writing New Tests

### Unit Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../myModule';

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### Component Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Mock Supabase Example
```typescript
import { vi } from 'vitest';
import { mockSupabaseClient } from '@/test/mocks/supabase';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient,
}));

// In your test
mockSupabaseClient.from().select().single.mockResolvedValue({
  data: mockData,
  error: null,
});
```

## Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Descriptive Names**: Use clear test descriptions
3. **Isolated Tests**: Each test should be independent
4. **Mock External Dependencies**: Mock API calls, Supabase, etc.
5. **Test Edge Cases**: Include error scenarios
6. **Keep Tests Simple**: One assertion per test when possible

## CI/CD Integration

Tests should run automatically on:
- Pre-commit hooks
- Pull requests
- Before deployment

## Coverage Goals

- **Validation Logic**: 100% coverage
- **API Functions**: 90%+ coverage
- **Hooks**: 85%+ coverage
- **Components**: 75%+ coverage

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Cannot find module"
**Solution**: Check your path aliases in `vitest.config.ts`

**Issue**: Supabase mock not working
**Solution**: Ensure you're using the mock from `@/test/mocks/supabase`

**Issue**: Component tests fail with "window is not defined"
**Solution**: Ensure `environment: 'jsdom'` is set in vitest.config.ts

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library React](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
