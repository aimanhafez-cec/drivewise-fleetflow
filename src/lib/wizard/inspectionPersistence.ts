import type { EnhancedWizardData } from '@/types/agreement-wizard';

const STORAGE_KEY = 'enhanced-inspection-draft';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

/**
 * Save inspection data to localStorage
 */
export function saveInspectionDraft(data: EnhancedWizardData): void {
  try {
    const draftData = {
      ...data,
      lastSaved: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
    console.log('[InspectionPersistence] Draft saved');
  } catch (error) {
    console.error('[InspectionPersistence] Failed to save draft:', error);
  }
}

/**
 * Load inspection data from localStorage
 */
export function loadInspectionDraft(): EnhancedWizardData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    console.log('[InspectionPersistence] Draft loaded');
    return data;
  } catch (error) {
    console.error('[InspectionPersistence] Failed to load draft:', error);
    return null;
  }
}

/**
 * Clear inspection draft from localStorage
 */
export function clearInspectionDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('[InspectionPersistence] Draft cleared');
  } catch (error) {
    console.error('[InspectionPersistence] Failed to clear draft:', error);
  }
}

/**
 * Setup auto-save for inspection data
 */
export function setupAutoSave(
  getData: () => EnhancedWizardData,
  interval: number = AUTO_SAVE_INTERVAL
): () => void {
  const intervalId = setInterval(() => {
    const data = getData();
    saveInspectionDraft(data);
  }, interval);

  // Return cleanup function
  return () => clearInterval(intervalId);
}
