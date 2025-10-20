import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, GitCommit, Tag, RotateCcw } from "lucide-react";

const releases = [
  {
    version: "v2.4.1",
    tag: "release-2.4.1",
    date: "2025-10-20 14:30",
    status: "deployed",
    environment: "production",
    author: "John Doe",
    commits: 12,
    duration: "3m 24s",
    changes: [
      "Added customer loyalty rewards program",
      "Fixed payment processing timeout issue",
      "Improved analytics dashboard performance",
      "Updated vehicle status tracking"
    ],
    rollbackAvailable: true
  },
  {
    version: "v2.4.0",
    tag: "release-2.4.0",
    date: "2025-10-18 10:15",
    status: "deployed",
    environment: "production",
    author: "Jane Smith",
    commits: 24,
    duration: "3m 45s",
    changes: [
      "Major: Redesigned reservation workflow",
      "Added bulk operations for vehicles",
      "Implemented new reporting system",
      "Enhanced search functionality"
    ],
    rollbackAvailable: true
  },
  {
    version: "v2.3.5",
    tag: "release-2.3.5",
    date: "2025-10-15 16:00",
    status: "rolled back",
    environment: "production",
    author: "John Doe",
    commits: 8,
    duration: "2m 58s",
    changes: [
      "Updated payment gateway integration",
      "Fixed critical security vulnerability"
    ],
    rollbackAvailable: false
  },
];

const ReleaseHistory = () => {
  return (
    <div className="space-y-6">
      {/* Release Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Release Timeline</CardTitle>
          <CardDescription>Complete history of all releases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {releases.map((release, idx) => (
              <div key={idx} className="relative">
                {/* Timeline line */}
                {idx < releases.length - 1 && (
                  <div className="absolute left-[17px] top-12 bottom-0 w-0.5 bg-border" />
                )}

                <div className="flex gap-4">
                  {/* Timeline dot */}
                  <div className="flex-shrink-0 mt-1">
                    {release.status === "deployed" ? (
                      <CheckCircle2 className="h-8 w-8 text-success" />
                    ) : release.status === "rolled back" ? (
                      <RotateCcw className="h-8 w-8 text-warning" />
                    ) : (
                      <XCircle className="h-8 w-8 text-destructive" />
                    )}
                  </div>

                  {/* Release card */}
                  <Card className="flex-1">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-lg font-semibold">{release.version}</h4>
                              <Badge variant={
                                release.status === "deployed" ? "default" :
                                release.status === "rolled back" ? "secondary" :
                                "destructive"
                              }>
                                {release.status}
                              </Badge>
                              <Badge variant="outline">{release.environment}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {release.date}
                              </span>
                              <span>{release.author}</span>
                              <span className="flex items-center gap-1">
                                <GitCommit className="h-3 w-3" />
                                {release.commits} commits
                              </span>
                              <span>{release.duration}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {release.rollbackAvailable && (
                              <Button variant="outline" size="sm">
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Rollback
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              Details
                            </Button>
                          </div>
                        </div>

                        {/* Changes */}
                        <div>
                          <p className="text-sm font-medium mb-2">Changes in this release:</p>
                          <ul className="space-y-1">
                            {release.changes.map((change, changeIdx) => (
                              <li key={changeIdx} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>{change}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Tag */}
                        <div className="flex items-center gap-2 text-sm">
                          <Tag className="h-3 w-3 text-muted-foreground" />
                          <code className="text-xs bg-muted px-2 py-1 rounded">{release.tag}</code>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Release Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Release Statistics</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Total Releases</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-bold text-success">10</p>
              <p className="text-sm text-muted-foreground">Successful</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-bold text-warning">2</p>
              <p className="text-sm text-muted-foreground">Rolled Back</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-bold">3m 24s</p>
              <p className="text-sm text-muted-foreground">Avg Duration</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rollback Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Rollback Procedure</CardTitle>
          <CardDescription>How to safely rollback a deployment</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 list-decimal list-inside">
            <li className="text-sm">
              <strong>Identify the issue:</strong> Confirm that a rollback is necessary by checking logs and monitoring
            </li>
            <li className="text-sm">
              <strong>Select target version:</strong> Choose the previous stable version from the release history
            </li>
            <li className="text-sm">
              <strong>Notify team:</strong> Alert team members about the rollback operation
            </li>
            <li className="text-sm">
              <strong>Execute rollback:</strong> Click the rollback button for the target version
            </li>
            <li className="text-sm">
              <strong>Verify:</strong> Check that the application is functioning correctly after rollback
            </li>
            <li className="text-sm">
              <strong>Post-mortem:</strong> Analyze what went wrong and document lessons learned
            </li>
          </ol>

          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive font-semibold mb-1">⚠️ Important</p>
            <p className="text-sm text-muted-foreground">
              Rollbacks should be used as a last resort. Always ensure database migrations are compatible
              and consider the impact on user data before proceeding.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReleaseHistory;
