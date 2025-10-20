import { useState } from 'react';
import { format } from 'date-fns';
import { Download, Filter, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustodyAuditLog } from '@/lib/api/custody';

interface AuditLogViewerProps {
  logs: CustodyAuditLog[];
  onExport?: (format: 'json' | 'csv') => void;
}

export function AuditLogViewer({ logs, onExport }: AuditLogViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');

  // Get unique action types and users
  const actionTypes = ['all', ...Array.from(new Set(logs.map((log) => log.action_type)))];
  const users = [
    'all',
    ...Array.from(new Set(logs.map((log) => log.performed_by).filter(Boolean))),
  ];

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === '' ||
      log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.field_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.new_value?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = filterAction === 'all' || log.action_type === filterAction;
    const matchesUser = filterUser === 'all' || log.performed_by === filterUser;

    return matchesSearch && matchesAction && matchesUser;
  });

  const getActionBadgeColor = (action: string) => {
    const colors: Record<string, string> = {
      created: 'bg-green-100 text-green-800',
      updated: 'bg-blue-100 text-blue-800',
      status_changed: 'bg-purple-100 text-purple-800',
      document_added: 'bg-cyan-100 text-cyan-800',
      approval_requested: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      closed: 'bg-gray-100 text-gray-800',
      voided: 'bg-red-100 text-red-800',
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Audit Log</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onExport?.('csv')}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onExport?.('json')}
            >
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Action Type</label>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {actionTypes.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action === 'all' ? 'All Actions' : action.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">User</label>
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {users.map((user) => (
                  <SelectItem key={user || 'all'} value={user || 'all'}>
                    {user === 'all' ? 'All Users' : user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setFilterAction('all');
                setFilterUser('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredLogs.length} of {logs.length} entries
        </div>

        {/* Audit Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Field</TableHead>
                <TableHead>Changes</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(log.performed_at), 'MMM dd, yyyy HH:mm:ss')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getActionBadgeColor(
                          log.action_type
                        )}`}
                      >
                        {log.action_type.replace(/_/g, ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{log.field_name || '-'}</span>
                    </TableCell>
                    <TableCell>
                      {log.old_value || log.new_value ? (
                        <div className="space-y-1 text-sm">
                          {log.old_value && (
                            <div className="text-muted-foreground">
                              From: <span className="line-through">{log.old_value}</span>
                            </div>
                          )}
                          {log.new_value && (
                            <div className="font-medium">To: {log.new_value}</div>
                          )}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{log.performed_by || 'System'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {log.api_source || 'web'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
