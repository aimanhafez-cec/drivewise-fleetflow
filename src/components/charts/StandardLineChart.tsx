import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from "@/components/ui/chart";

interface StandardLineChartProps {
  data: Array<{ [key: string]: any }>;
  config: ChartConfig;
  height?: number;
  showLegend?: boolean;
  xAxisKey: string;
  lines: Array<{
    dataKey: string;
    name?: string;
    strokeWidth?: number;
  }>;
}

export function StandardLineChart({ 
  data, 
  config, 
  height = 300, 
  showLegend = true,
  xAxisKey,
  lines
}: StandardLineChartProps) {
  console.log('StandardLineChart rendered with:', { data, config, height, showLegend });
  
  if (!data || data.length === 0) {
    console.log('No data for line chart');
    return (
      <div className="h-full w-full flex items-center justify-center text-white">
        No data available
      </div>
    );
  }

  return (
    <ChartContainer config={config} style={{ height: `${height}px` }}>
      <LineChart
        width={400}
        height={height}
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey={xAxisKey}
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis 
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip 
          cursor={false} 
          content={<ChartTooltipContent />} 
        />
        {showLegend && lines.length > 1 && (
          <ChartLegend 
            content={<ChartLegendContent />} 
          />
        )}
        {lines.map((line, index) => {
          const color = config[line.dataKey]?.color || `hsl(var(--chart-${(index % 8) + 1}))`;
          const name = line.name || config[line.dataKey]?.label;
          const displayName = typeof name === 'string' ? name : line.dataKey;
          console.log('Line color for', line.dataKey, ':', color);
          
          return (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={color}
              strokeWidth={line.strokeWidth || 2}
              name={displayName}
              dot={{ fill: color, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          );
        })}
      </LineChart>
    </ChartContainer>
  );
}