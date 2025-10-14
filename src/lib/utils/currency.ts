export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const formatCurrency = (amount: number, currencyCode: string = 'AED'): string => {
  const formattedNumber = formatNumber(Math.abs(amount));
  
  if (currencyCode === 'AED') {
    return amount < 0 ? `-${formattedNumber} AED` : `${formattedNumber} AED`;
  }
  
  // Fallback for other currencies
  const symbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'AED': 'AED',
  };
  
  const symbol = symbols[currencyCode] || currencyCode + ' ';
  return amount < 0 ? `-${symbol}${formattedNumber}` : `${symbol}${formattedNumber}`;
};

export const DEFAULT_CURRENCY = 'AED';