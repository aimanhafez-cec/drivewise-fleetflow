export const formatCurrency = (amount: number, currencyCode: string = 'EGP'): string => {
  // Format for Egyptian Pound
  if (currencyCode === 'EGP') {
    return `${amount.toFixed(2)} ج.م`;
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

export const DEFAULT_CURRENCY = 'EGP';