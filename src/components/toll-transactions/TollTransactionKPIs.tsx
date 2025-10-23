import { Card } from "@/components/ui/card";
import { DollarSign, Navigation, MapPin } from "lucide-react";
import { TollTransactionStatistics } from "@/lib/api/tollTransactionsCorporate";

interface TollTransactionKPIsProps {
  statistics?: TollTransactionStatistics;
  isLoading?: boolean;
}

export function TollTransactionKPIs({ statistics, isLoading }: TollTransactionKPIsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-2" />
            <div className="h-8 bg-muted rounded w-3/4" />
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: "Total Toll Amount",
      value: `AED ${statistics?.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`,
      icon: DollarSign,
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      title: "Total Crossings",
      value: statistics?.total_crossings.toLocaleString() || "0",
      icon: Navigation,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      title: "Most Used Emirate",
      value: statistics?.most_used_emirate || "N/A",
      icon: MapPin,
      gradient: "from-indigo-500 to-purple-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="p-6 relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-5`} />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{kpi.title}</p>
              <kpi.icon className="h-5 w-5 text-cyan-600" />
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              {kpi.value}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
