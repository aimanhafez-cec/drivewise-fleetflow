import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Mail, Plus, Play, Pause, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ScheduledReport {
  id: number;
  name: string;
  frequency: string;
  nextRun: string;
  recipients: string[];
  format: string;
  isActive: boolean;
}

const ScheduledReports = () => {
  const [reports, setReports] = useState<ScheduledReport[]>([
    { id: 1, name: "Daily Revenue Summary", frequency: "Daily", nextRun: "Tomorrow 8:00 AM", recipients: ["admin@company.com"], format: "PDF", isActive: true },
    { id: 2, name: "Weekly Fleet Status", frequency: "Weekly", nextRun: "Monday 9:00 AM", recipients: ["ops@company.com", "manager@company.com"], format: "Excel", isActive: true },
    { id: 3, name: "Monthly Performance", frequency: "Monthly", nextRun: "1st of next month", recipients: ["ceo@company.com"], format: "PDF", isActive: true },
    { id: 4, name: "Customer Analytics", frequency: "Weekly", nextRun: "Friday 5:00 PM", recipients: ["marketing@company.com"], format: "Excel", isActive: false },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const toggleReport = (id: number) => {
    setReports(reports.map(r => 
      r.id === id ? { ...r, isActive: !r.isActive } : r
    ));
    const report = reports.find(r => r.id === id);
    toast.success(`Report "${report?.name}" ${report?.isActive ? 'paused' : 'activated'}`);
  };

  const deleteReport = (id: number) => {
    const report = reports.find(r => r.id === id);
    setReports(reports.filter(r => r.id !== id));
    toast.success(`Report "${report?.name}" deleted`);
  };

  const runNow = (id: number) => {
    const report = reports.find(r => r.id === id);
    toast.success(`Running report "${report?.name}" now...`);
  };

  const handleCreateReport = () => {
    toast.success("Report schedule created successfully!");
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Scheduled Reports</h3>
          <p className="text-sm text-muted-foreground">Automate your reporting workflow</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Scheduled Report</DialogTitle>
              <DialogDescription>
                Set up automatic report generation and delivery
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="reportName">Report Name</Label>
                <Input id="reportName" placeholder="Enter report name" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="reportType">Report Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Revenue Summary</SelectItem>
                    <SelectItem value="fleet">Fleet Status</SelectItem>
                    <SelectItem value="customer">Customer Analytics</SelectItem>
                    <SelectItem value="custom">Custom Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="format">Export Format</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="time">Run Time</Label>
                <Input id="time" type="time" defaultValue="08:00" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="recipients">Email Recipients</Label>
                <Input 
                  id="recipients" 
                  placeholder="email1@company.com, email2@company.com" 
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple emails with commas
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateReport}>Create Schedule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reports List */}
      <div className="grid gap-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold">{report.name}</h4>
                    <Badge variant={report.isActive ? "default" : "secondary"}>
                      {report.isActive ? "Active" : "Paused"}
                    </Badge>
                    <Badge variant="outline">{report.format}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{report.frequency}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Next: {report.nextRun}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{report.recipients.length} recipient(s)</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {report.recipients.map((email, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {email}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Switch
                    checked={report.isActive}
                    onCheckedChange={() => toggleReport(report.id)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runNow(report.id)}
                    disabled={!report.isActive}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteReport(report.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ScheduledReports;
