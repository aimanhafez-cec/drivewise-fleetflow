import { Button } from "@/components/ui/button";
import { Link, Unlink } from "lucide-react";

interface QuickFilterBarProps {
  onFilterChange: (filters: Record<string, any>) => void;
  activeFilters: Record<string, any>;
}

export function QuickFilterBar({ onFilterChange, activeFilters }: QuickFilterBarProps) {
  const quickFilters = [
    {
      label: "Charged Only",
      key: "payment_status",
      value: "charged",
      icon: Link,
    },
    {
      label: "Linked to Contract",
      key: "hasContract",
      value: true,
      icon: Link,
    },
  ];

  const handleQuickFilter = (key: string, value: any) => {
    const currentValue = activeFilters[key];
    
    if (currentValue === value) {
      // Remove filter
      const newFilters = { ...activeFilters };
      delete newFilters[key];
      onFilterChange(newFilters);
    } else {
      // Add filter
      onFilterChange({ ...activeFilters, [key]: value });
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground mr-2">Quick Filters:</span>
      {quickFilters.map((filter) => {
        const isActive = activeFilters[filter.key] === filter.value;
        const Icon = filter.icon;
        
        return (
          <Button
            key={filter.key}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => handleQuickFilter(filter.key, filter.value)}
            className={
              isActive
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                : ""
            }
          >
            <Icon className="h-3.5 w-3.5 mr-1.5" />
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
}
