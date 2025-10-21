import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle,
  XCircle,
  DollarSign,
  AlertCircle,
  Download,
  Link2,
  MoreHorizontal,
  X,
} from "lucide-react";

interface BulkActionToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline';
    disabled?: boolean;
  }[];
  moreActions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    destructive?: boolean;
  }[];
}

export function BulkActionToolbar({
  selectedCount,
  onClearSelection,
  actions,
  moreActions,
}: BulkActionToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              {selectedCount}
            </div>
            <span className="text-sm font-medium">
              {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-8"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'default'}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
              className="h-8"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}

          {moreActions && moreActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background z-50">
                {moreActions.map((action, index) => (
                  <div key={index}>
                    {index > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      onClick={action.onClick}
                      className={action.destructive ? 'text-destructive' : ''}
                    >
                      {action.icon && <span className="mr-2">{action.icon}</span>}
                      {action.label}
                    </DropdownMenuItem>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}

// Pre-configured bulk action toolbars for different modules

interface TollFineBulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onAcknowledge: () => void;
  onMarkPaid: () => void;
  onDispute: () => void;
  onLinkContract: () => void;
  onExport: () => void;
}

export function TollFineBulkActions({
  selectedCount,
  onClearSelection,
  onAcknowledge,
  onMarkPaid,
  onDispute,
  onLinkContract,
  onExport,
}: TollFineBulkActionsProps) {
  return (
    <BulkActionToolbar
      selectedCount={selectedCount}
      onClearSelection={onClearSelection}
      actions={[
        {
          label: 'Acknowledge',
          icon: <CheckCircle className="h-4 w-4 mr-1" />,
          onClick: onAcknowledge,
        },
        {
          label: 'Mark Paid',
          icon: <DollarSign className="h-4 w-4 mr-1" />,
          onClick: onMarkPaid,
          variant: 'default',
        },
      ]}
      moreActions={[
        {
          label: 'Dispute Selected',
          icon: <AlertCircle className="h-4 w-4" />,
          onClick: onDispute,
        },
        {
          label: 'Link to Contract',
          icon: <Link2 className="h-4 w-4" />,
          onClick: onLinkContract,
        },
        {
          label: 'Export Selected',
          icon: <Download className="h-4 w-4" />,
          onClick: onExport,
        },
      ]}
    />
  );
}

interface ExceptionBulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onApprove: () => void;
  onDismiss: () => void;
  onReassign: () => void;
  onEscalate: () => void;
}

export function ExceptionBulkActions({
  selectedCount,
  onClearSelection,
  onApprove,
  onDismiss,
  onReassign,
  onEscalate,
}: ExceptionBulkActionsProps) {
  return (
    <BulkActionToolbar
      selectedCount={selectedCount}
      onClearSelection={onClearSelection}
      actions={[
        {
          label: 'Approve',
          icon: <CheckCircle className="h-4 w-4 mr-1" />,
          onClick: onApprove,
        },
        {
          label: 'Dismiss',
          icon: <XCircle className="h-4 w-4 mr-1" />,
          onClick: onDismiss,
          variant: 'outline',
        },
      ]}
      moreActions={[
        {
          label: 'Reassign',
          onClick: onReassign,
        },
        {
          label: 'Escalate',
          icon: <AlertCircle className="h-4 w-4" />,
          onClick: onEscalate,
        },
      ]}
    />
  );
}
