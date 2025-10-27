import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, Save, Trash2, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DraftManagementBannerProps {
  lastSaved?: string;
  isSaving?: boolean;
  hasDraft: boolean;
  onResumeDraft?: () => void;
  onDiscardDraft?: () => void;
  onSaveDraft?: () => void;
  showResumePrompt?: boolean;
}

export const DraftManagementBanner: React.FC<DraftManagementBannerProps> = ({
  lastSaved,
  isSaving,
  hasDraft,
  onResumeDraft,
  onDiscardDraft,
  onSaveDraft,
  showResumePrompt = false,
}) => {
  // Resume draft prompt (shown on mount if draft exists)
  if (showResumePrompt && hasDraft && lastSaved) {
    return (
      <Alert className="border-primary bg-primary/5">
        <Clock className="h-4 w-4 text-primary" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p className="font-medium text-primary">Draft found</p>
            <p className="text-sm text-muted-foreground">
              Last saved {formatDistanceToNow(new Date(lastSaved), { addSuffix: true })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onDiscardDraft}>
              <Trash2 className="h-4 w-4 mr-2" />
              Start Fresh
            </Button>
            <Button variant="default" size="sm" onClick={onResumeDraft}>
              Resume Draft
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Auto-save status indicator (always visible when editing)
  if (!showResumePrompt) {
    return (
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {isSaving ? (
            <>
              <Save className="h-4 w-4 text-muted-foreground animate-pulse" />
              <span className="text-muted-foreground">Saving draft...</span>
            </>
          ) : lastSaved ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-muted-foreground">
                Auto-saved {formatDistanceToNow(new Date(lastSaved), { addSuffix: true })}
              </span>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">No changes yet</span>
            </>
          )}
        </div>

        {hasDraft && onSaveDraft && (
          <Button variant="ghost" size="sm" onClick={onSaveDraft}>
            <Save className="h-4 w-4 mr-2" />
            Save Now
          </Button>
        )}
      </div>
    );
  }

  return null;
};
