import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatting utility
export const formatCurrency = (amount: number, currencyCode: string = 'AED'): string => {
  // Format for Egyptian Pound
  if (currencyCode === 'AED') {
    return `${amount.toFixed(2)} AED`;
  }
  
  // Fallback for other currencies
  const symbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
  };
  
  const symbol = symbols[currencyCode] || currencyCode + ' ';
  return amount < 0 ? `-${symbol}${Math.abs(amount).toFixed(2)}` : `${symbol}${amount.toFixed(2)}`;
};

export const DEFAULT_CURRENCY = 'AED';
