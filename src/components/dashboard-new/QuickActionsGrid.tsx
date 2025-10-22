import { memo, useCallback } from 'react';
import { 
  Plus, 
  CheckCircle, 
  ClipboardCheck, 
  RotateCcw, 
  Calendar, 
  Car,
  DollarSign,
  FileText
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  route: string;
  badge?: number;
  colorScheme: 'primary' | 'success' | 'warning' | 'info' | 'secondary';
}

interface QuickActionsGridProps {
  pendingReturns?: number;
  openWorkOrders?: number;
}

export const QuickActionsGrid = memo(function QuickActionsGrid({ 
  pendingReturns = 0, 
  openWorkOrders = 0 
}: QuickActionsGridProps) {
  const navigate = useNavigate();

  const handleNavigate = useCallback((route: string) => {
    navigate(route);
  }, [navigate]);

  const actions: QuickAction[] = [
    {
      id: 'new-reservation',
      title: 'New Reservation',
      description: 'Create a new booking',
      icon: Plus,
      route: '/reservations/new',
      colorScheme: 'primary'
    },
    {
      id: 'quick-checkout',
      title: 'Quick Checkout',
      description: 'Start new agreement',
      icon: CheckCircle,
      route: '/agreements/new',
      colorScheme: 'success'
    },
    {
      id: 'vehicle-handover',
      title: 'Vehicle Handover',
      description: 'Inspection & delivery',
      icon: ClipboardCheck,
      route: '/inspections/new',
      colorScheme: 'info'
    },
    {
      id: 'process-return',
      title: 'Process Return',
      description: 'Check-in vehicles',
      icon: RotateCcw,
      route: '/agreements?status=pending_return',
      badge: pendingReturns,
      colorScheme: 'warning'
    },
    {
      id: 'view-planner',
      title: 'View Planner',
      description: 'Schedule & calendar',
      icon: Calendar,
      route: '/planner',
      colorScheme: 'secondary'
    },
    {
      id: 'manage-custody',
      title: 'Manage Custody',
      description: 'Vehicle replacements',
      icon: Car,
      route: '/custody',
      colorScheme: 'info'
    },
    {
      id: 'expenses-entry',
      title: 'Expenses Entry',
      description: 'Record costs',
      icon: DollarSign,
      route: '/operations/expenses/new',
      colorScheme: 'warning'
    },
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Analytics & insights',
      icon: FileText,
      route: '/reports',
      colorScheme: 'secondary'
    }
  ];

  const colorClasses = {
    primary: {
      bg: 'bg-primary/10 group-hover:bg-primary/20',
      text: 'text-primary',
      border: 'border-primary/20 group-hover:border-primary/30'
    },
    success: {
      bg: 'bg-green-500/10 group-hover:bg-green-500/20',
      text: 'text-green-600',
      border: 'border-green-500/20 group-hover:border-green-500/30'
    },
    warning: {
      bg: 'bg-amber-500/10 group-hover:bg-amber-500/20',
      text: 'text-amber-600',
      border: 'border-amber-500/20 group-hover:border-amber-500/30'
    },
    info: {
      bg: 'bg-blue-500/10 group-hover:bg-blue-500/20',
      text: 'text-blue-600',
      border: 'border-blue-500/20 group-hover:border-blue-500/30'
    },
    secondary: {
      bg: 'bg-secondary/10 group-hover:bg-secondary/20',
      text: 'text-secondary-foreground',
      border: 'border-secondary/20 group-hover:border-secondary/30'
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        const colors = colorClasses[action.colorScheme];

        return (
          <Card
            key={action.id}
            className={cn(
              "group p-6 cursor-pointer transition-all duration-300",
              "hover:shadow-lg hover:-translate-y-1",
              "border-2 animate-fade-in",
              colors.border
            )}
            onClick={() => handleNavigate(action.route)}
            role="button"
            tabIndex={0}
            aria-label={`${action.title}: ${action.description}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleNavigate(action.route);
              }
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn(
                "p-3 rounded-xl transition-colors",
                colors.bg
              )}>
                <Icon className={cn("h-6 w-6", colors.text)} />
              </div>
              
              {action.badge !== undefined && action.badge > 0 && (
                <Badge variant="destructive" className="font-semibold">
                  {action.badge}
                </Badge>
              )}
            </div>

            <h3 className="font-semibold text-foreground mb-1">
              {action.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {action.description}
            </p>
          </Card>
        );
      })}
    </div>
  );
});
