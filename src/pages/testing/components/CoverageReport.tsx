import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const coverageByType = [
  { name: "Statements", coverage: 89.2, color: "hsl(var(--chart-1))" },
  { name: "Branches", coverage: 84.7, color: "hsl(var(--chart-2))" },
  { name: "Functions", coverage: 91.3, color: "hsl(var(--chart-3))" },
  { name: "Lines", coverage: 88.5, color: "hsl(var(--chart-4))" },
];

const filesCoverage = [
  { file: "src/components/reservations/", coverage: 95, lines: 1240, tested: 1178 },
  { file: "src/components/vehicles/", coverage: 92, lines: 980, tested: 901 },
  { file: "src/lib/api/", coverage: 88, lines: 2100, tested: 1848 },
  { file: "src/hooks/", coverage: 87, lines: 1560, tested: 1357 },
  { file: "src/components/customers/", coverage: 85, lines: 890, tested: 756 },
  { file: "src/pages/", coverage: 82, lines: 3200, tested: 2624 },
  { file: "src/lib/utils/", coverage: 79, lines: 450, tested: 355 },
  { file: "src/components/analytics/", coverage: 76, lines: 720, tested: 547 },
];

const coverageByModule = [
  { module: "Components", coverage: 89 },
  { module: "Hooks", coverage: 87 },
  { module: "API", coverage: 88 },
  { module: "Utils", coverage: 79 },
  { module: "Pages", coverage: 82 },
  { module: "Services", coverage: 85 },
];

const uncoveredAreas = [
  { file: "src/lib/utils/dataAggregation.ts", lines: "45-67, 89-102", severity: "high" },
  { file: "src/components/analytics/AdvancedCharts.tsx", lines: "123-145", severity: "medium" },
  { file: "src/pages/reports/CustomReport.tsx", lines: "78-95, 112-128", severity: "medium" },
  { file: "src/lib/api/custody.ts", lines: "234-256", severity: "low" },
];

const CoverageReport = () => {
  return (
    <div className="space-y-6">
      {/* Coverage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Coverage by Type</CardTitle>
            <CardDescription>Different coverage metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {coverageByType.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.name}</span>
                    <Badge variant={item.coverage >= 90 ? "default" : item.coverage >= 80 ? "secondary" : "destructive"}>
                      {item.coverage}%
                    </Badge>
                  </div>
                  <Progress value={item.coverage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coverage Distribution</CardTitle>
            <CardDescription>Visual breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={coverageByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, coverage }) => `${name}: ${coverage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="coverage"
                >
                  {coverageByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Coverage by Module */}
      <Card>
        <CardHeader>
          <CardTitle>Coverage by Module</CardTitle>
          <CardDescription>Test coverage across different parts of the application</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={coverageByModule}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="module" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Legend />
              <Bar dataKey="coverage" fill="hsl(var(--chart-1))" name="Coverage %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* File-Level Coverage */}
      <Card>
        <CardHeader>
          <CardTitle>File-Level Coverage</CardTitle>
          <CardDescription>Detailed coverage by directory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filesCoverage.map((item) => (
              <div key={item.file} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-mono">{item.file}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.tested} / {item.lines} lines covered
                    </p>
                  </div>
                  <Badge variant={item.coverage >= 90 ? "default" : item.coverage >= 80 ? "secondary" : "destructive"}>
                    {item.coverage}%
                  </Badge>
                </div>
                <Progress value={item.coverage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Uncovered Areas */}
      <Card>
        <CardHeader>
          <CardTitle>Uncovered Areas</CardTitle>
          <CardDescription>Critical sections needing test coverage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {uncoveredAreas.map((area, idx) => (
              <div key={idx} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-mono">{area.file}</p>
                  <Badge variant={
                    area.severity === "high" ? "destructive" : 
                    area.severity === "medium" ? "secondary" : 
                    "outline"
                  }>
                    {area.severity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Lines: {area.lines}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoverageReport;
