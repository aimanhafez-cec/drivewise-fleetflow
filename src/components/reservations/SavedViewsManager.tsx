import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bookmark, Star, Trash2, Plus, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import type { ReservationFilterState } from './ReservationFilters';

interface SavedView {
  id: string;
  name: string;
  filters: ReservationFilterState;
  isDefault?: boolean;
  createdAt: string;
}

interface SavedViewsManagerProps {
  currentFilters: ReservationFilterState;
  onApplyView: (filters: ReservationFilterState) => void;
  activeViewId?: string;
}

const STORAGE_KEY = 'reservation_saved_views';

export const SavedViewsManager: React.FC<SavedViewsManagerProps> = ({
  currentFilters,
  onApplyView,
  activeViewId,
}) => {
  const { toast } = useToast();
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');

  // Load saved views from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const views = JSON.parse(stored);
        setSavedViews(views);
      }
    } catch (error) {
      console.error('[SavedViews] Failed to load saved views:', error);
    }
  }, []);

  // Save views to localStorage whenever they change
  const persistViews = (views: SavedView[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
      setSavedViews(views);
    } catch (error) {
      console.error('[SavedViews] Failed to persist views:', error);
      toast({
        title: 'Error',
        description: 'Failed to save view',
        variant: 'destructive',
      });
    }
  };

  const handleSaveView = () => {
    if (!newViewName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter a name for this view',
        variant: 'destructive',
      });
      return;
    }

    // Check if filters are empty
    const hasFilters = Object.values(currentFilters).some(
      (v) => v !== undefined && v !== ''
    );
    if (!hasFilters) {
      toast({
        title: 'No Filters',
        description: 'Apply some filters before saving a view',
        variant: 'destructive',
      });
      return;
    }

    const newView: SavedView = {
      id: `view_${Date.now()}`,
      name: newViewName.trim(),
      filters: currentFilters,
      isDefault: savedViews.length === 0,
      createdAt: new Date().toISOString(),
    };

    const updatedViews = [...savedViews, newView];
    persistViews(updatedViews);

    toast({
      title: 'View Saved',
      description: `"${newViewName}" has been saved`,
    });

    setSaveDialogOpen(false);
    setNewViewName('');
  };

  const handleDeleteView = (viewId: string) => {
    const view = savedViews.find((v) => v.id === viewId);
    const updatedViews = savedViews.filter((v) => v.id !== viewId);
    persistViews(updatedViews);

    toast({
      title: 'View Deleted',
      description: `"${view?.name}" has been removed`,
    });
  };

  const handleSetDefault = (viewId: string) => {
    const updatedViews = savedViews.map((v) => ({
      ...v,
      isDefault: v.id === viewId,
    }));
    persistViews(updatedViews);

    toast({
      title: 'Default Set',
      description: 'This view will be applied automatically',
    });
  };

  const handleApplyView = (view: SavedView) => {
    onApplyView(view.filters);
    toast({
      title: 'View Applied',
      description: `Filters from "${view.name}" have been applied`,
    });
  };

  const getFilterSummary = (filters: ReservationFilterState): string => {
    const parts: string[] = [];
    if (filters.search) parts.push(`Search: "${filters.search}"`);
    if (filters.reservationType) parts.push(`Type: ${filters.reservationType}`);
    if (filters.paymentStatus) parts.push(`Payment: ${filters.paymentStatus}`);
    if (filters.status) parts.push(`Status: ${filters.status}`);
    if (filters.dateFrom) parts.push('Date range');
    return parts.join(', ') || 'No filters';
  };

  return (
    <div className="flex items-center gap-2">
      {/* Saved Views Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Bookmark className="h-4 w-4" />
            Saved Views
            {savedViews.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {savedViews.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>My Saved Views</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {savedViews.length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              <Bookmark className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No saved views yet</p>
              <p className="text-xs mt-1">Apply filters and save them for quick access</p>
            </div>
          ) : (
            savedViews.map((view) => (
              <div
                key={view.id}
                className="group relative"
              >
                <DropdownMenuItem
                  className="flex items-start gap-2 pr-20 cursor-pointer"
                  onClick={() => handleApplyView(view)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {view.name}
                      </span>
                      {view.isDefault && (
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500 flex-shrink-0" />
                      )}
                      {activeViewId === view.id && (
                        <Check className="h-3 w-3 text-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {getFilterSummary(view.filters)}
                    </p>
                  </div>
                </DropdownMenuItem>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!view.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(view.id);
                      }}
                    >
                      <Star className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteView(view.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Save Current View Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Save Current View
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter View</DialogTitle>
            <DialogDescription>
              Save your current filters for quick access later
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">View Name</label>
              <Input
                placeholder="e.g., Pending Payments This Week"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveView()}
              />
            </div>
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium mb-2">Current Filters:</p>
              <p className="text-muted-foreground">
                {getFilterSummary(currentFilters)}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveView}>
              <Bookmark className="mr-2 h-4 w-4" />
              Save View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
