import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";

const testSuites = [
  { name: "Authentication", tests: 24, passed: 24, failed: 0, duration: 1.2, coverage: 95 },
  { name: "Reservations", tests: 45, passed: 44, failed: 1, duration: 3.4, coverage: 89 },
  { name: "Vehicles", tests: 38, passed: 38, failed: 0, duration: 2.1, coverage: 92 },
  { name: "Customers", tests: 32, passed: 32, failed: 0, duration: 1.8, coverage: 88 },
  { name: "Payments", tests: 28, passed: 27, failed: 1, duration: 2.5, coverage: 85 },
  { name: "Reports", tests: 19, passed: 19, failed: 0, duration: 1.4, coverage: 82 },
  { name: "Analytics", tests: 22, passed: 20, failed: 2, duration: 1.9, coverage: 78 },
  { name: "Operations", tests: 40, passed: 40, failed: 0, duration: 2.8, coverage: 91 },
];

const recentFailures = [
  {
    suite: "Reservations",
    test: "should validate date ranges correctly",
    error: "Expected: 2025-10-20, Received: 2025-10-19",
    file: "src/components/reservations/DatePicker.test.tsx:45"
  },
  {
    suite: "Payments",
    test: "should process refund successfully",
    error: "Timeout exceeded: async operation took too long",
    file: "src/lib/api/payments.test.ts:128"
  },
  {
    suite: "Analytics",
    test: "should calculate revenue metrics",
    error: "Assertion failed: expected 45000, got 44999.99",
    file: "src/hooks/useRevenueAnalytics.test.ts:67"
  },
  {
    suite: "Analytics",
    test: "should aggregate monthly data",
    error: "TypeError: Cannot read property 'reduce' of undefined",
    file: "src/lib/utils/dataAggregation.test.ts:92"
  },
];

const TestOverview = () => {
  return (
    <div className="space-y-6">
      {/* Test Suites Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Test Suites Performance</CardTitle>
          <CardDescription>Detailed breakdown by module</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testSuites.map((suite) => (
              <div key={suite.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {suite.failed === 0 ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <p className="font-medium">{suite.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {suite.passed}/{suite.tests} passed • {suite.duration}s
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={suite.coverage >= 90 ? "default" : suite.coverage >= 80 ? "secondary" : "destructive"}>
                      {suite.coverage}% coverage
                    </Badge>
                    {suite.failed > 0 && (
                      <Badge variant="destructive">
                        {suite.failed} failed
                      </Badge>
                    )}
                  </div>
                </div>
                <Progress value={(suite.passed / suite.tests) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Failures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Recent Failures
          </CardTitle>
          <CardDescription>Tests requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentFailures.map((failure, idx) => (
              <div key={idx} className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-destructive">{failure.suite}</p>
                    <p className="text-sm font-mono">{failure.test}</p>
                  </div>
                  <Badge variant="destructive">Failed</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{failure.error}</p>
                <p className="text-xs text-muted-foreground font-mono">{failure.file}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Execution Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Test Execution Timeline</CardTitle>
          <CardDescription>Performance over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: "Oct 20", total: 248, passed: 244, duration: 12.4 },
              { date: "Oct 19", total: 248, passed: 246, duration: 12.1 },
              { date: "Oct 18", total: 245, passed: 245, duration: 11.8 },
              { date: "Oct 17", total: 245, passed: 243, duration: 12.3 },
              { date: "Oct 16", total: 240, passed: 240, duration: 11.5 },
              { date: "Oct 15", total: 240, passed: 238, duration: 11.9 },
              { date: "Oct 14", total: 238, passed: 238, duration: 11.2 },
            ].map((day) => (
              <div key={day.date} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{day.date}</p>
                    <p className="text-sm text-muted-foreground">
                      {day.passed}/{day.total} passed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{day.duration}s</Badge>
                  {day.passed === day.total ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestOverview;
