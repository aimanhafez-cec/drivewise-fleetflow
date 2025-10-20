import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Play, Save, Download, Plus, X } from "lucide-react";
import { toast } from "sonner";

const dataSources = [
  { id: "reservations", name: "Reservations", fields: ["id", "customer_id", "vehicle_id", "total_amount", "status", "created_at"] },
  { id: "vehicles", name: "Vehicles", fields: ["id", "make", "model", "year", "status", "daily_rate"] },
  { id: "customers", name: "Customers", fields: ["id", "name", "email", "phone", "total_bookings"] },
  { id: "agreements", name: "Agreements", fields: ["id", "agreement_no", "start_date", "end_date", "total_amount"] },
];

const aggregations = ["Sum", "Average", "Count", "Min", "Max", "Group By"];
const chartTypes = ["Table", "Bar Chart", "Line Chart", "Pie Chart", "Area Chart"];

const CustomReportBuilder = () => {
  const [reportName, setReportName] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filters, setFilters] = useState<Array<{field: string, operator: string, value: string}>>([]);

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const addFilter = () => {
    setFilters([...filters, { field: "", operator: "equals", value: "" }]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleRunReport = () => {
    if (!reportName || !selectedSource || selectedFields.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success("Report generated successfully!");
  };

  const handleSaveReport = () => {
    if (!reportName || !selectedSource) {
      toast.error("Please provide report name and data source");
      return;
    }
    toast.success("Report saved successfully!");
  };

  const availableFields = dataSources.find(s => s.id === selectedSource)?.fields || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Builder Panel */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
            <CardDescription>Define your custom report parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-2">
              <Label htmlFor="reportName">Report Name *</Label>
              <Input
                id="reportName"
                placeholder="Enter report name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataSource">Data Source *</Label>
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  {dataSources.map(source => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Fields Selection */}
            <div className="space-y-2">
              <Label>Select Fields *</Label>
              <div className="grid grid-cols-2 gap-2 p-4 border rounded-lg bg-muted/30">
                {availableFields.length > 0 ? (
                  availableFields.map(field => (
                    <div key={field} className="flex items-center space-x-2">
                      <Checkbox
                        id={field}
                        checked={selectedFields.includes(field)}
                        onCheckedChange={() => handleFieldToggle(field)}
                      />
                      <label htmlFor={field} className="text-sm cursor-pointer">
                        {field}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground col-span-2">
                    Select a data source to see available fields
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Filters */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Filters</Label>
                <Button variant="outline" size="sm" onClick={addFilter}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Filter
                </Button>
              </div>
              
              {filters.length > 0 ? (
                <div className="space-y-2">
                  {filters.map((filter, index) => (
                    <div key={index} className="flex gap-2 items-center p-2 border rounded-lg">
                      <Select value={filter.field} onValueChange={(value) => {
                        const newFilters = [...filters];
                        newFilters[index].field = value;
                        setFilters(newFilters);
                      }}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Field" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFields.map(field => (
                            <SelectItem key={field} value={field}>{field}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={filter.operator} onValueChange={(value) => {
                        const newFilters = [...filters];
                        newFilters[index].operator = value;
                        setFilters(newFilters);
                      }}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="not_equals">Not Equals</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="greater">Greater Than</SelectItem>
                          <SelectItem value="less">Less Than</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        placeholder="Value"
                        value={filter.value}
                        onChange={(e) => {
                          const newFilters = [...filters];
                          newFilters[index].value = e.target.value;
                          setFilters(newFilters);
                        }}
                      />

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFilter(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/30">
                  No filters added yet
                </p>
              )}
            </div>

            <Separator />

            {/* Visualization */}
            <div className="space-y-2">
              <Label htmlFor="chartType">Visualization Type</Label>
              <Select defaultValue="Table">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chartTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aggregation">Aggregation</Label>
              <Select defaultValue="none">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {aggregations.map(agg => (
                    <SelectItem key={agg} value={agg.toLowerCase()}>{agg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview & Actions */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Report Name</p>
              <p className="font-medium">{reportName || "Untitled Report"}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Data Source</p>
              <p className="font-medium">
                {dataSources.find(s => s.id === selectedSource)?.name || "Not selected"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Selected Fields</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedFields.length > 0 ? (
                  selectedFields.map(field => (
                    <Badge key={field} variant="secondary">{field}</Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No fields selected</p>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Filters</p>
              <p className="font-medium">{filters.length} filter(s)</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button className="w-full" onClick={handleRunReport}>
                <Play className="h-4 w-4 mr-2" />
                Run Report
              </Button>
              <Button variant="outline" className="w-full" onClick={handleSaveReport}>
                <Save className="h-4 w-4 mr-2" />
                Save Report
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" size="sm">
              Monthly Revenue Summary
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              Fleet Utilization Report
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              Customer Activity Report
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              Payment Aging Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomReportBuilder;
