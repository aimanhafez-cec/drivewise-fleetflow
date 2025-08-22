import { PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from "@/components/ui/chart";

interface StandardPieChartProps {
  data: Array<{ name: string; value: number; [key: string]: any }>;
  config: ChartConfig;
  height?: number;
  showLegend?: boolean;
  dataKey?: string;
  nameKey?: string;
}

export function StandardPieChart({ 
  data, 
  config, 
  height = 300, 
  showLegend = true,
  dataKey = "value",
  nameKey = "name"
}: StandardPieChartProps) {
  return (
    <ChartContainer config={config} className="h-full w-full" style={{ height: `${height}px` }}>
      <PieChart>
        <ChartTooltip 
          cursor={false} 
          content={<ChartTooltipContent hideLabel />} 
        />
        {showLegend && (
          <ChartLegend 
            content={<ChartLegendContent />} 
          />
        )}
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={2}
        >
          {data.map((entry, index) => {
            const configKey = entry[nameKey]?.toLowerCase?.() || entry[nameKey] || entry.status?.toLowerCase?.() || `item-${index}`;
            const color = config[configKey]?.color || `hsl(var(--chart-${(index % 8) + 1}))`;
            return (
              <Cell 
                key={`cell-${index}`} 
                fill={color}
              />
            );
          })}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}