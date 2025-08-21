import { ChartConfig } from "@/components/ui/chart"

// Enhanced 12-color palette with high contrast against teal background
export const CHART_COLORS = {
  primary: "hsl(220, 91%, 60%)", // Bright blue
  secondary: "hsl(142, 76%, 36%)", // Green
  accent: "hsl(346, 87%, 54%)", // Pink/Red
  warning: "hsl(38, 92%, 50%)", // Orange
  purple: "hsl(271, 76%, 53%)", // Purple
  cyan: "hsl(185, 76%, 46%)", // Cyan
  yellow: "hsl(54, 91%, 51%)", // Yellow
  indigo: "hsl(239, 84%, 67%indigo)", // Indigo
  rose: "hsl(330, 81%, 60%)", // Rose
  emerald: "hsl(142, 71%, 45%)", // Emerald
  amber: "hsl(43, 96%, 56%)", // Amber
  violet: "hsl(258, 90%, 66%)", // Violet
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
  outOfService: CHART_COLORS.rose,
} as const

// Severity color scheme
export const SEVERITY_COLORS = {
  low: CHART_COLORS.secondary,
  medium: CHART_COLORS.warning,
  high: CHART_COLORS.accent,
  critical: CHART_COLORS.rose,
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
    color: STATUS_COLORS.available,
  },
  rented: {
    label: "Rented",
    color: STATUS_COLORS.rented,
  },
  maintenance: {
    label: "In Maintenance",
    color: STATUS_COLORS.maintenance,
  },
  damaged: {
    label: "Damaged",
    color: STATUS_COLORS.damaged,
  },
  reserved: {
    label: "Reserved",
    color: STATUS_COLORS.reserved,
  },
  outOfService: {
    label: "Out of Service",
    color: STATUS_COLORS.outOfService,
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
  CHART_COLORS.cyan,
  CHART_COLORS.yellow,
  CHART_COLORS.indigo,
  CHART_COLORS.rose,
  CHART_COLORS.emerald,
  CHART_COLORS.amber,
  CHART_COLORS.violet,
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
    color: CHART_COLORS.rose,
  },
}