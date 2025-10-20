import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, FileSpreadsheet, FileJson, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const exportHistory = [
  { id: 1, name: "Monthly Revenue Report", format: "Excel", date: "2025-10-15", status: "completed", size: "2.4 MB" },
  { id: 2, name: "Customer Analytics", format: "PDF", date: "2025-10-14", status: "completed", size: "1.8 MB" },
  { id: 3, name: "Fleet Utilization Data", format: "CSV", date: "2025-10-13", status: "completed", size: "856 KB" },
  { id: 4, name: "Payment Report", format: "Excel", date: "2025-10-12", status: "completed", size: "3.2 MB" },
  { id: 5, name: "Booking Trends", format: "JSON", date: "2025-10-11", status: "completed", size: "1.1 MB" },
];

const ExportManager = () => {
  const [selectedFormat, setSelectedFormat] = useState("excel");
  const [includeCharts, setIncludeCharts] = useState(true);

  const handleExport = () => {
    toast.success(`Export started in ${selectedFormat.toUpperCase()} format`);
  };

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case "excel":
      case "csv":
        return <FileSpreadsheet className="h-4 w-4" />;
      case "pdf":
        return <FileText className="h-4 w-4" />;
      case "json":
        return <FileJson className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Export Configuration */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Export Configuration</CardTitle>
            <CardDescription>Configure your data export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel (.xlsx)
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      CSV (.csv)
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      PDF (.pdf)
                    </div>
                  </SelectItem>
                  <SelectItem value="json">
                    <div className="flex items-center gap-2">
                      <FileJson className="h-4 w-4" />
                      JSON (.json)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select defaultValue="30">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Export Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="charts" 
                    checked={includeCharts}
                    onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                  />
                  <label htmlFor="charts" className="text-sm cursor-pointer">
                    Include charts and visualizations
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="summary" defaultChecked />
                  <label htmlFor="summary" className="text-sm cursor-pointer">
                    Include summary statistics
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="raw" />
                  <label htmlFor="raw" className="text-sm cursor-pointer">
                    Include raw data
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="compress" />
                  <label htmlFor="compress" className="text-sm cursor-pointer">
                    Compress export (ZIP)
                  </label>
                </div>
              </div>
            </div>

            <Button className="w-full" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Exports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              All Reservations (Excel)
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Revenue Report (PDF)
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Customer List (CSV)
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <FileJson className="h-4 w-4 mr-2" />
              API Data (JSON)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Export History */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Export History</CardTitle>
            <CardDescription>Recent data exports and downloads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exportHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {getFormatIcon(item.format)}
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {item.format}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {item.size}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {item.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle2 className="h-3 w-3 text-success" />
                      Completed
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExportManager;
