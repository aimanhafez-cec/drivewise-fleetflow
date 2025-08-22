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
  console.log('StandardPieChart rendered with:', { data, config, height, showLegend });
  
  if (!data || data.length === 0) {
    console.log('No data for pie chart');
    return (
      <div className="h-full w-full flex items-center justify-center text-white">
        No data available
      </div>
    );
  }
  return (
    <ChartContainer config={config} style={{ height: `${height}px` }}>
      <PieChart width={400} height={height}>
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
            console.log('Pie cell color for', configKey, ':', color);
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