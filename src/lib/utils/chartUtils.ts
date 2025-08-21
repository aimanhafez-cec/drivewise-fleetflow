// Chart utility functions for formatting and data processing

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`
}

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value)
}

export const formatCompactNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export const formatMonth = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

// Custom tooltip formatter for currency values
export const currencyTooltipFormatter = (value: number, name: string) => [
  formatCurrency(value),
  name,
]

// Custom tooltip formatter for percentage values
export const percentageTooltipFormatter = (value: number, name: string) => [
  formatPercentage(value),
  name,
]

// Custom tooltip formatter for number values
export const numberTooltipFormatter = (value: number, name: string) => [
  formatNumber(value),
  name,
]

// Generate colors for dynamic data sets
export const generateColors = (count: number, baseColors: string[]): string[] => {
  const colors: string[] = []
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length])
  }
  return colors
}

// Chart responsive configuration
export const CHART_RESPONSIVE_CONFIG = {
  small: {
    width: "100%",
    height: 200,
  },
  medium: {
    width: "100%",
    height: 300,
  },
  large: {
    width: "100%",
    height: 400,
  },
}

// Common chart margins
export const CHART_MARGINS = {
  default: { top: 20, right: 30, left: 20, bottom: 5 },
  withLegend: { top: 20, right: 30, left: 20, bottom: 40 },
  compact: { top: 10, right: 15, left: 10, bottom: 5 },
}