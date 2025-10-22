import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardKPICardProps {
  id: string;
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  alert?: {
    count: number;
    severity: 'critical' | 'warning' | 'info';
  };
  chartData?: Array<{ value: number }>;
  colorScheme?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  subtitle?: string;
}

export function DashboardKPICard({
  title,
  value,
  icon: Icon,
  trend,
  alert,
  chartData,
  colorScheme = 'primary',
  subtitle
}: DashboardKPICardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-green-500/10 text-green-600',
    warning: 'bg-amber-500/10 text-amber-600',
    danger: 'bg-red-500/10 text-red-600',
    info: 'bg-blue-500/10 text-blue-600'
  };

  const trendColorClasses = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50'
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-200 border-border">
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          'p-3 rounded-xl',
          colorClasses[colorScheme]
        )}>
          <Icon className="h-6 w-6" />
        </div>
        
        {alert && (
          <Badge 
            variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
            className="font-semibold"
          >
            {alert.count}
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          {title}
        </p>
        
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-bold text-foreground tabular-nums">
            {value}
          </h3>
          
          {trend && (
            <div className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold',
              trend.isPositive ? trendColorClasses.positive : trendColorClasses.negative
            )}>
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        {subtitle && (
          <p className="text-xs text-muted-foreground">
            {subtitle}
          </p>
        )}

        {trend?.label && (
          <p className="text-xs text-muted-foreground">
            {trend.label}
          </p>
        )}

        {chartData && chartData.length > 0 && (
          <div className="mt-4 h-16">
            <MiniSparkline data={chartData} color={colorScheme} />
          </div>
        )}
      </div>
    </Card>
  );
}

interface MiniSparklineProps {
  data: Array<{ value: number }>;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

function MiniSparkline({ data, color }: MiniSparklineProps) {
  const colorMap = {
    primary: 'hsl(var(--primary))',
    success: 'hsl(142, 76%, 36%)',
    warning: 'hsl(38, 92%, 50%)',
    danger: 'hsl(0, 84%, 60%)',
    info: 'hsl(221, 83%, 53%)'
  };

  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 100 100" 
      preserveAspectRatio="none"
      className="opacity-70"
    >
      <polyline
        fill="none"
        stroke={colorMap[color]}
        strokeWidth="2"
        points={points}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
