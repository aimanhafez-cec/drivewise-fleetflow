import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from "@/components/ui/chart";

interface StandardBarChartProps {
  data: Array<{ [key: string]: any }>;
  config: ChartConfig;
  height?: number;
  showLegend?: boolean;
  xAxisKey: string;
  bars: Array<{
    dataKey: string;
    name?: string;
    stackId?: string;
  }>;
  layout?: "horizontal" | "vertical";
}

export function StandardBarChart({ 
  data, 
  config, 
  height = 300, 
  showLegend = true,
  xAxisKey,
  bars,
  layout = "vertical"
}: StandardBarChartProps) {
  console.log('StandardBarChart rendered with:', { data, config, height, showLegend, bars });
  
  if (!data || data.length === 0) {
    console.log('No data for bar chart');
    return (
      <div className="h-full w-full flex items-center justify-center text-white">
        No data available
      </div>
    );
  }
  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <ChartContainer config={config} className="h-full w-full">
        <BarChart
          data={data}
          layout={layout}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={xAxisKey}
            type={layout === "horizontal" ? "number" : "category"}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis 
            type={layout === "horizontal" ? "category" : "number"}
            dataKey={layout === "horizontal" ? xAxisKey : undefined}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <ChartTooltip 
            cursor={false} 
            content={<ChartTooltipContent />} 
          />
          {showLegend && bars.length > 1 && (
            <ChartLegend 
              content={<ChartLegendContent />} 
            />
          )}
          {bars.map((bar, index) => {
            const color = config[bar.dataKey]?.color || `hsl(var(--chart-${(index % 8) + 1}))`;
            const name = bar.name || config[bar.dataKey]?.label;
            const displayName = typeof name === 'string' ? name : bar.dataKey;
            console.log('Bar color for', bar.dataKey, ':', color);
            
            return (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                stackId={bar.stackId}
                fill={color}
                name={displayName}
                radius={4}
              />
            );
          })}
        </BarChart>
      </ChartContainer>
    </div>
  );
}