import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

// Color palette
const COLORS = {
  primary: '#10b981',
  secondary: '#06b6d4', 
  accent: '#8b5cf6',
  warning: '#f59e0b',
  danger: '#ef4444',
  success: '#22c55e',
  info: '#3b82f6',
  muted: '#64748b'
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.accent,
  COLORS.warning,
  COLORS.danger,
  COLORS.success,
  COLORS.info,
  COLORS.muted
];

interface SimpleTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatter?: (value: any, name: string) => [string, string];
}

const SimpleTooltip: React.FC<SimpleTooltipProps> = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 border border-white/20 rounded-lg p-3 shadow-lg">
        {label && <p className="text-white font-medium mb-2">{label}</p>}
        {payload.map((entry, index) => {
          const [value, name] = formatter 
            ? formatter(entry.value, entry.name || entry.dataKey)
            : [entry.value, entry.name || entry.dataKey];
          
          return (
            <p key={index} className="text-white/90" style={{ color: entry.color }}>
              <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
              {name}: {value}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

interface SimplePieChartProps {
  data: Array<{ name: string; value: number; [key: string]: any }>;
  height?: number;
  formatter?: (value: any, name: string) => [string, string];
}

export const SimplePieChart: React.FC<SimplePieChartProps> = ({ 
  data, 
  height = 300,
  formatter 
}) => {
  console.log('SimplePieChart rendering with data:', data);

  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-white" style={{ height }}>
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={CHART_COLORS[index % CHART_COLORS.length]} 
            />
          ))}
        </Pie>
        <Tooltip content={<SimpleTooltip formatter={formatter} />} />
        <Legend 
          wrapperStyle={{ color: '#ffffff' }}
          formatter={(value) => <span style={{ color: '#ffffff' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

interface SimpleBarChartProps {
  data: Array<{ [key: string]: any }>;
  xAxisKey: string;
  bars: Array<{
    dataKey: string;
    name?: string;
    color?: string;
  }>;
  height?: number;
  formatter?: (value: any, name: string) => [string, string];
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ 
  data, 
  xAxisKey, 
  bars, 
  height = 300,
  formatter 
}) => {
  console.log('SimpleBarChart rendering with data:', data);

  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-white" style={{ height }}>
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
        <XAxis 
          dataKey={xAxisKey} 
          tick={{ fill: '#ffffff' }}
          axisLine={{ stroke: '#ffffff40' }}
          tickLine={{ stroke: '#ffffff40' }}
        />
        <YAxis 
          tick={{ fill: '#ffffff' }}
          axisLine={{ stroke: '#ffffff40' }}
          tickLine={{ stroke: '#ffffff40' }}
        />
        <Tooltip content={<SimpleTooltip formatter={formatter} />} />
        {bars.length > 1 && (
          <Legend 
            wrapperStyle={{ color: '#ffffff' }}
            formatter={(value) => <span style={{ color: '#ffffff' }}>{value}</span>}
          />
        )}
        {bars.map((bar, index) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            fill={bar.color || CHART_COLORS[index % CHART_COLORS.length]}
            name={bar.name || bar.dataKey}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

interface SimpleLineChartProps {
  data: Array<{ [key: string]: any }>;
  xAxisKey: string;
  lines: Array<{
    dataKey: string;
    name?: string;
    color?: string;
  }>;
  height?: number;
  formatter?: (value: any, name: string) => [string, string];
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({ 
  data, 
  xAxisKey, 
  lines, 
  height = 300,
  formatter 
}) => {
  console.log('SimpleLineChart rendering with data:', data);

  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-white" style={{ height }}>
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
        <XAxis 
          dataKey={xAxisKey} 
          tick={{ fill: '#ffffff' }}
          axisLine={{ stroke: '#ffffff40' }}
          tickLine={{ stroke: '#ffffff40' }}
        />
        <YAxis 
          tick={{ fill: '#ffffff' }}
          axisLine={{ stroke: '#ffffff40' }}
          tickLine={{ stroke: '#ffffff40' }}
        />
        <Tooltip content={<SimpleTooltip formatter={formatter} />} />
        {lines.length > 1 && (
          <Legend 
            wrapperStyle={{ color: '#ffffff' }}
            formatter={(value) => <span style={{ color: '#ffffff' }}>{value}</span>}
          />
        )}
        {lines.map((line, index) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color || CHART_COLORS[index % CHART_COLORS.length]}
            strokeWidth={3}
            name={line.name || line.dataKey}
            dot={{ fill: line.color || CHART_COLORS[index % CHART_COLORS.length], strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};