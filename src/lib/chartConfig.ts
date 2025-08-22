import { ChartConfig } from "@/components/ui/chart"

// Enhanced chart colors using CSS custom properties for consistency
export const CHART_COLORS = {
  primary: "hsl(var(--chart-1))", // Teal accent
  secondary: "hsl(var(--chart-2))", // Success green  
  accent: "hsl(var(--chart-3))", // Warning yellow
  warning: "hsl(var(--chart-4))", // Destructive red
  purple: "hsl(var(--chart-5))", // Purple
  orange: "hsl(var(--chart-6))", // Orange
  blue: "hsl(var(--chart-7))", // Blue
  pink: "hsl(var(--chart-8))", // Pink
} as const

// Revenue/Financial color scheme
export const REVENUE_COLORS = {
  revenue: CHART_COLORS.secondary, // Green for revenue
  cost: CHART_COLORS.accent, // Red for costs
  profit: CHART_COLORS.primary, // Blue for profit
  loss: CHART_COLORS.warning, // Orange for loss
} as const

// Status color scheme
export const STATUS_COLORS = {
  available: CHART_COLORS.secondary,
  rented: CHART_COLORS.primary,
  maintenance: CHART_COLORS.warning,
  damaged: CHART_COLORS.accent,
  reserved: CHART_COLORS.purple,
  outOfService: CHART_COLORS.pink,
} as const

// Severity color scheme
export const SEVERITY_COLORS = {
  low: CHART_COLORS.secondary,
  medium: CHART_COLORS.warning,
  high: CHART_COLORS.accent,
  critical: CHART_COLORS.pink,
} as const

// Default chart configurations
export const DEFAULT_CHART_CONFIG: ChartConfig = {
  revenue: {
    label: "Revenue",
    color: REVENUE_COLORS.revenue,
  },
  cost: {
    label: "Cost",
    color: REVENUE_COLORS.cost,
  },
  profit: {
    label: "Profit",
    color: REVENUE_COLORS.profit,
  },
}

// Fleet status chart configuration
export const FLEET_STATUS_CONFIG: ChartConfig = {
  available: {
    label: "Available",
    color: CHART_COLORS.secondary,
  },
  rented: {
    label: "Rented", 
    color: CHART_COLORS.primary,
  },
  maintenance: {
    label: "In Maintenance",
    color: CHART_COLORS.accent,
  },
  damaged: {
    label: "Damaged",
    color: CHART_COLORS.warning,
  },
  reserved: {
    label: "Reserved",
    color: CHART_COLORS.purple,
  },
  "out of service": {
    label: "Out of Service",
    color: CHART_COLORS.pink,
  },
}

// Damage severity chart configuration
export const DAMAGE_SEVERITY_CONFIG: ChartConfig = {
  low: {
    label: "Low Severity",
    color: SEVERITY_COLORS.low,
  },
  medium: {
    label: "Medium Severity",
    color: SEVERITY_COLORS.medium,
  },
  high: {
    label: "High Severity",
    color: SEVERITY_COLORS.high,
  },
  critical: {
    label: "Critical",
    color: SEVERITY_COLORS.critical,
  },
}

// Monthly trends chart configuration
export const MONTHLY_TRENDS_CONFIG: ChartConfig = {
  bookings: {
    label: "Bookings",
    color: CHART_COLORS.primary,
  },
  revenue: {
    label: "Revenue",
    color: CHART_COLORS.secondary,
  },
  services: {
    label: "Services",
    color: CHART_COLORS.accent,
  },
  costs: {
    label: "Costs",
    color: CHART_COLORS.warning,
  },
}

// Vehicle category colors (for consistent category representation)
export const VEHICLE_CATEGORY_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.accent,
  CHART_COLORS.warning,
  CHART_COLORS.purple,
  CHART_COLORS.orange,
  CHART_COLORS.blue,
  CHART_COLORS.pink,
]

// NPS Score colors
export const NPS_CONFIG: ChartConfig = {
  promoters: {
    label: "Promoters (9-10)",
    color: CHART_COLORS.secondary,
  },
  passives: {
    label: "Passives (7-8)",
    color: CHART_COLORS.warning,
  },
  detractors: {
    label: "Detractors (0-6)",
    color: CHART_COLORS.accent,
  },
}

// Payment aging configuration
export const AGING_CONFIG: ChartConfig = {
  "0-30": {
    label: "0-30 Days",
    color: CHART_COLORS.secondary,
  },
  "31-60": {
    label: "31-60 Days",
    color: CHART_COLORS.warning,
  },
  "61-90": {
    label: "61-90 Days",
    color: CHART_COLORS.accent,
  },
  "90+": {
    label: "90+ Days",
    color: CHART_COLORS.pink,
  },
}