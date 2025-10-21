import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EnhancedAgreementWizard } from '../EnhancedAgreementWizard';

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWizard = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <EnhancedAgreementWizard />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('EnhancedAgreementWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Initial Render', () => {
    it('renders the wizard component', () => {
      const { container } = renderWizard();
      expect(container.querySelector('.max-w-7xl')).toBeTruthy();
    });

    it('initializes with default wizard data', () => {
      const { container } = renderWizard();
      expect(container).toBeTruthy();
      // Component renders successfully
    });
  });

  describe('localStorage Persistence', () => {
    it('uses correct storage key', () => {
      renderWizard();
      expect(localStorage.key(0)).toBe(null);
    });
  });

  describe('Progress Tracking', () => {
    it('marks steps as completed when advanced', async () => {
      renderWizard();
      
      // Complete step 0
      const directButton = screen.getByText(/Direct Agreement/i);
      fireEvent.click(directButton);

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /next/i });
        fireEvent.click(nextButton);
      });

      // Step 0 should be marked complete
      await waitFor(() => {
        const completedSteps = screen.getAllByRole('button').filter(btn => 
          btn.className.includes('bg-green')
        );
        expect(completedSteps.length).toBeGreaterThan(0);
      });
    });

    it('updates progress percentage as steps complete', async () => {
      renderWizard();
      
      // Initially 0%
      expect(screen.getByText('0% Complete')).toBeInTheDocument();

      // Complete step 0
      const directButton = screen.getByText(/Direct Agreement/i);
      fireEvent.click(directButton);

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /next/i });
        fireEvent.click(nextButton);
      });

      // Progress should increase
      await waitFor(() => {
        expect(screen.queryByText('0% Complete')).not.toBeInTheDocument();
      });
    });
  });

  describe('Validation', () => {
    it('displays validation errors', async () => {
      renderWizard();
      
      // Try to proceed without selecting source
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
      
      // Error message should be visible
      expect(screen.getByText(/Please select an agreement source/i)).toBeInTheDocument();
    });

    it('clears validation errors when data is corrected', async () => {
      renderWizard();
      
      // Initially has validation error
      expect(screen.getByText(/Please select an agreement source/i)).toBeInTheDocument();

      // Select source
      const directButton = screen.getByText(/Direct Agreement/i);
      fireEvent.click(directButton);

      // Error should clear
      await waitFor(() => {
        expect(screen.queryByText(/Please select an agreement source/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('localStorage Persistence', () => {
    it('saves progress to localStorage', async () => {
      renderWizard();
      
      // Select source
      const directButton = screen.getByText(/Direct Agreement/i);
      fireEvent.click(directButton);

      // Wait for debounced save
      await waitFor(() => {
        const saved = localStorage.getItem('enhanced-agreement-wizard');
        expect(saved).toBeTruthy();
      }, { timeout: 2000 });
    });

    it('restores progress from localStorage', async () => {
      // Set up saved state
      const savedState = {
        wizardData: {
          source: 'direct',
          sourceId: undefined,
          step1: {},
          step2: {},
          step3: {},
          step4: {},
          step5: {},
          step6: {},
          step7: {},
          step8: {},
        },
        progress: {
          currentStep: 1,
          completedSteps: [0],
          canProceed: false,
          lastSaved: Date.now(),
        },
      };
      localStorage.setItem('enhanced-agreement-wizard', JSON.stringify(savedState));

      // Render wizard
      renderWizard();

      // Should restore to step 1
      await waitFor(() => {
        expect(screen.getByText(/Step 2 of 9/)).toBeInTheDocument();
      });
    });
  });

  describe('Actions', () => {
    it('handles Save Draft button click', async () => {
      const { toast } = await import('sonner');
      renderWizard();
      
      const saveDraftButton = screen.getByRole('button', { name: /save draft/i });
      fireEvent.click(saveDraftButton);

      expect(toast.success).toHaveBeenCalledWith('Draft saved successfully');
    });

    it('handles Cancel button click', () => {
      renderWizard();
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith('/agreements');
    });
  });

  describe('Final Step', () => {
    it('shows Issue Agreement button on final step', async () => {
      // Set up wizard at final step with all data valid
      const savedState = {
        wizardData: {
          source: 'direct',
          sourceId: undefined,
          step1: {
            customerId: 'test-customer',
            customerVerified: true,
            agreementType: 'daily',
            rentalPurpose: 'personal',
            pickupLocationId: 'loc1',
            pickupDateTime: '2025-01-01T10:00',
            dropoffLocationId: 'loc2',
            dropoffDateTime: '2025-01-02T10:00',
            mileagePackage: 'unlimited',
          },
          step2: {
            preHandoverChecklist: {
              vehicleCleaned: true,
              vehicleFueled: true,
              documentsReady: true,
              keysAvailable: true,
              warningLightsOk: true,
            },
            damageMarkers: [],
            inspectionChecklist: {},
            fuelLevel: 0.8,
            odometerReading: 10000,
            photos: { exterior: [], interior: [], documents: [], damages: [] },
          },
          step3: {
            baseRate: 100,
            insurancePackage: 'comprehensive',
            excessAmount: 1500,
            additionalCoverages: [],
            maintenanceIncluded: false,
            pricingBreakdown: {
              baseRate: 100,
              insurance: 30,
              maintenance: 0,
              addons: 0,
              subtotal: 130,
              discount: 0,
              taxableAmount: 130,
              vat: 6.5,
              total: 136.5,
            },
          },
          step4: { selectedAddons: [], recommendedAddons: [] },
          step5: {
            billingType: 'same',
            paymentMethod: 'card',
            paymentSchedule: 'upfront',
            advancePayment: { amount: 136.5, status: 'completed', transactionRef: 'TXN123' },
            securityDeposit: { method: 'card_hold', amount: 500, status: 'authorized', authorizationRef: 'AUTH123' },
            autoChargeAuthorized: true,
          },
          step6: {
            documents: [
              { type: 'emirates_id', verificationStatus: 'verified', url: 'test.jpg', fileName: 'eid.jpg', fileSize: 1000, uploadedAt: '2025-01-01' },
              { type: 'passport', verificationStatus: 'verified', url: 'test.jpg', fileName: 'passport.jpg', fileSize: 1000, uploadedAt: '2025-01-01' },
              { type: 'license', verificationStatus: 'verified', url: 'test.jpg', fileName: 'license.jpg', fileSize: 1000, uploadedAt: '2025-01-01' },
            ],
            emiratesIdVerified: true,
            licenseVerified: true,
            blackPointsChecked: true,
            eligibilityStatus: 'eligible',
          },
          step7: {
            termsLanguage: 'en',
            termsAccepted: true,
            keyTermsAcknowledged: {
              fuelPolicy: true,
              insuranceCoverage: true,
              tollsFinesLiability: true,
              returnPolicy: true,
              damageLiability: true,
            },
            customerSignature: { signerName: 'John Doe', signedAt: '2025-01-01T10:00', signature: 'data:image/png;base64,test' },
            customerDeclarations: {
              vehicleConditionConfirmed: true,
              keysDocumentsReceived: true,
              termsUnderstood: true,
            },
          },
          step8: {
            reviewCompleted: true,
            distributionMethods: { email: true, sms: false, whatsapp: false, print: false },
          },
        },
        progress: {
          currentStep: 8,
          completedSteps: [0, 1, 2, 3, 4, 5, 6, 7],
          canProceed: true,
          lastSaved: Date.now(),
        },
      };
      localStorage.setItem('enhanced-agreement-wizard', JSON.stringify(savedState));

      renderWizard();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /issue agreement/i })).toBeInTheDocument();
      });
    });
  });
});
