import { AlertCircle, XCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ValidationResult } from '@/lib/validation/agreementSchema';

interface ValidationErrorBannerProps {
  validationResult: ValidationResult;
  onDismiss?: () => void;
  onNavigateToError?: (path: string) => void;
}

export const ValidationErrorBanner = ({
  validationResult,
  onDismiss,
  onNavigateToError,
}: ValidationErrorBannerProps) => {
  const { errors, warnings } = validationResult;
  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;

  if (!hasErrors && !hasWarnings) {
    return null;
  }

  const totalIssues = errors.length + warnings.length;

  return (
    <Alert variant={hasErrors ? 'destructive' : 'default'} className="mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {hasErrors ? (
            <XCircle className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-warning" />
          )}
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <AlertTitle className="text-base font-semibold mb-1">
              {hasErrors ? 'Validation Errors' : 'Validation Warnings'}
            </AlertTitle>
            <AlertDescription>
              {hasErrors ? (
                <>
                  Please fix the following <Badge variant="destructive" className="mx-1">{errors.length}</Badge> 
                  {errors.length === 1 ? 'error' : 'errors'} before proceeding.
                  {hasWarnings && (
                    <span className="ml-1">
                      ({warnings.length} {warnings.length === 1 ? 'warning' : 'warnings'} also present)
                    </span>
                  )}
                </>
              ) : (
                <>
                  You have <Badge variant="outline" className="mx-1 text-warning border-warning">{warnings.length}</Badge> 
                  {warnings.length === 1 ? 'warning' : 'warnings'}. Review before proceeding.
                </>
              )}
            </AlertDescription>
          </div>

          <ScrollArea className="h-[240px] w-full rounded-md border border-border/50 bg-muted/20 p-3">
            <div className="space-y-3">
              {/* Errors */}
              {errors.map((error, index) => (
                <div
                  key={`error-${index}`}
                  className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20"
                >
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {error.message}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {error.path}
                        </p>
                      </div>
                      {onNavigateToError && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onNavigateToError(error.path)}
                          className="h-7 text-xs flex-shrink-0"
                        >
                          Go to field
                        </Button>
                      )}
                    </div>
                    {error.suggestion && (
                      <div className="flex items-start gap-1.5 mt-2 p-2 bg-background/50 rounded border border-border/50">
                        <Lightbulb className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Suggestion:</span> {error.suggestion}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Warnings */}
              {warnings.map((warning, index) => (
                <div
                  key={`warning-${index}`}
                  className="flex items-start gap-2 p-3 rounded-md bg-warning/10 border border-warning/20"
                >
                  <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {warning.message}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {warning.path}
                        </p>
                      </div>
                      {onNavigateToError && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onNavigateToError(warning.path)}
                          className="h-7 text-xs flex-shrink-0"
                        >
                          Go to field
                        </Button>
                      )}
                    </div>
                    {warning.suggestion && (
                      <div className="flex items-start gap-1.5 mt-2 p-2 bg-background/50 rounded border border-border/50">
                        <Lightbulb className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Suggestion:</span> {warning.suggestion}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {onDismiss && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-8"
              >
                Dismiss
              </Button>
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
};
