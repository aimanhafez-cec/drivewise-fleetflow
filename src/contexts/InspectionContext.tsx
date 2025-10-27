import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { InspectionData, ComparisonReport } from '@/types/agreement-wizard';
import { 
  saveInspectionDraft, 
  loadInspectionDraft, 
  clearInspectionDraft 
} from '@/lib/wizard/inspectionPersistence';

/**
 * Inspection State Management with useReducer
 * Manages checkout, checkin, and comparison state
 */

interface InspectionState {
  checkoutData: InspectionData | null;
  checkinData: InspectionData | null;
  comparisonReport: ComparisonReport | null;
  isLoading: boolean;
  error: string | null;
  currentTab: 'checkout' | 'checkin' | 'comparison';
}

type InspectionAction =
  | { type: 'SET_CHECKOUT_DATA'; payload: InspectionData }
  | { type: 'SET_CHECKIN_DATA'; payload: InspectionData }
  | { type: 'SET_COMPARISON_REPORT'; payload: ComparisonReport }
  | { type: 'SET_CURRENT_TAB'; payload: 'checkout' | 'checkin' | 'comparison' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_STATE' }
  | { type: 'LOAD_DRAFT'; payload: Partial<InspectionState> };

const initialState: InspectionState = {
  checkoutData: null,
  checkinData: null,
  comparisonReport: null,
  isLoading: false,
  error: null,
  currentTab: 'checkout',
};

function inspectionReducer(
  state: InspectionState,
  action: InspectionAction
): InspectionState {
  switch (action.type) {
    case 'SET_CHECKOUT_DATA':
      return {
        ...state,
        checkoutData: action.payload,
        error: null,
      };

    case 'SET_CHECKIN_DATA':
      return {
        ...state,
        checkinData: action.payload,
        error: null,
      };

    case 'SET_COMPARISON_REPORT':
      return {
        ...state,
        comparisonReport: action.payload,
        error: null,
      };

    case 'SET_CURRENT_TAB':
      return {
        ...state,
        currentTab: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'RESET_STATE':
      return initialState;

    case 'LOAD_DRAFT':
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}

interface InspectionContextValue {
  state: InspectionState;
  setCheckoutData: (data: InspectionData) => void;
  setCheckinData: (data: InspectionData) => void;
  setComparisonReport: (report: ComparisonReport) => void;
  setCurrentTab: (tab: 'checkout' | 'checkin' | 'comparison') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetState: () => void;
  saveDraft: () => void;
  loadDraft: () => void;
  clearDraft: () => void;
}

const InspectionContext = createContext<InspectionContextValue | undefined>(undefined);

interface InspectionProviderProps {
  children: React.ReactNode;
  agreementId?: string;
  lineId?: string;
}

export function InspectionProvider({ 
  children, 
  agreementId, 
  lineId 
}: InspectionProviderProps) {
  const [state, dispatch] = useReducer(inspectionReducer, initialState);

  // Load draft on mount
  useEffect(() => {
    const draft = loadInspectionDraft();
    if (draft && draft.step8) {
      // Extract inspection data from wizard draft
      const wizardData = draft.step8 as any;
      if (wizardData.checkoutData) {
        dispatch({ type: 'SET_CHECKOUT_DATA', payload: wizardData.checkoutData });
      }
      if (wizardData.checkinData) {
        dispatch({ type: 'SET_CHECKIN_DATA', payload: wizardData.checkinData });
      }
    }
  }, []);

  // Auto-save to localStorage when state changes
  useEffect(() => {
    if (state.checkoutData || state.checkinData) {
      const draftData = {
        step8: {
          checkoutData: state.checkoutData,
          checkinData: state.checkinData,
          currentTab: state.currentTab,
        },
        agreementId,
        lineId,
      };
      saveInspectionDraft(draftData as any);
    }
  }, [state.checkoutData, state.checkinData, state.currentTab, agreementId, lineId]);

  const setCheckoutData = (data: InspectionData) => {
    dispatch({ type: 'SET_CHECKOUT_DATA', payload: data });
  };

  const setCheckinData = (data: InspectionData) => {
    dispatch({ type: 'SET_CHECKIN_DATA', payload: data });
  };

  const setComparisonReport = (report: ComparisonReport) => {
    dispatch({ type: 'SET_COMPARISON_REPORT', payload: report });
  };

  const setCurrentTab = (tab: 'checkout' | 'checkin' | 'comparison') => {
    dispatch({ type: 'SET_CURRENT_TAB', payload: tab });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const resetState = () => {
    dispatch({ type: 'RESET_STATE' });
    clearInspectionDraft();
  };

  const saveDraft = () => {
    const draftData = {
      checkoutData: state.checkoutData,
      checkinData: state.checkinData,
      currentTab: state.currentTab,
      agreementId,
      lineId,
    };
    saveInspectionDraft(draftData as any);
  };

  const loadDraft = () => {
    const draft = loadInspectionDraft();
    if (draft && draft.step8) {
      const wizardData = draft.step8 as any;
      if (wizardData.checkoutData) {
        dispatch({ type: 'SET_CHECKOUT_DATA', payload: wizardData.checkoutData });
      }
      if (wizardData.checkinData) {
        dispatch({ type: 'SET_CHECKIN_DATA', payload: wizardData.checkinData });
      }
    }
  };

  const clearDraft = () => {
    clearInspectionDraft();
    dispatch({ type: 'RESET_STATE' });
  };

  const value: InspectionContextValue = {
    state,
    setCheckoutData,
    setCheckinData,
    setComparisonReport,
    setCurrentTab,
    setLoading,
    setError,
    resetState,
    saveDraft,
    loadDraft,
    clearDraft,
  };

  return (
    <InspectionContext.Provider value={value}>
      {children}
    </InspectionContext.Provider>
  );
}

export function useInspection() {
  const context = useContext(InspectionContext);
  if (!context) {
    throw new Error('useInspection must be used within InspectionProvider');
  }
  return context;
}
