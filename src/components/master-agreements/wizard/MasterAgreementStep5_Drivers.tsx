import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Trash2, Star, UserPlus, FileText, Calendar, Check, ChevronsUpDown } from 'lucide-react';
import { useDrivers } from '@/hooks/useDrivers';
import { useAgreementDrivers, useAssignDriver, useRemoveDriver, useUpdateDriverAssignment } from '@/hooks/useAgreementDrivers';
import { EnhancedDriverForm } from '@/components/drivers/EnhancedDriverForm';
import { DriverDocumentsDialog } from '@/components/drivers/DriverDocumentsDialog';
import { supabase } from '@/integrations/supabase/client';

interface MasterAgreementStep5DriversProps {
  data: {
    id?: string;
    agreement_items?: any[];
  };
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export const MasterAgreementStep5Drivers: React.FC<MasterAgreementStep5DriversProps> = ({ 
  data, 
  onChange, 
  errors 
}) => {
  const [isCreateDriverOpen, setIsCreateDriverOpen] = useState(false);
  const [docsDialogOpen, setDocsDialogOpen] = useState(false);
  const [viewDocsDriverId, setViewDocsDriverId] = useState<string | null>(null);
  const [viewDocsDriverName, setViewDocsDriverName] = useState<string | null>(null);
  const [editDriverId, setEditDriverId] = useState<string | null>(null);
  const [searchByLine, setSearchByLine] = useState<Record<string, string>>({});
  const [comboboxOpenByLine, setComboboxOpenByLine] = useState<Record<string, boolean>>({});

  const { items: allDrivers, isLoading: isSearchingDrivers } = useDrivers('', true);
  const { data: agreementDrivers = [] } = useAgreementDrivers(data.id);
  const assignDriverMutation = useAssignDriver();
  const removeDriverMutation = useRemoveDriver();
  const updateDriverMutation = useUpdateDriverAssignment();

  // Fetch real lines from corporate_leasing_lines table
  const { data: vehicleLines = [], isLoading: loadingLines } = useQuery({
    queryKey: ['corporate-leasing-lines', data.id],
    queryFn: async () => {
      if (!data.id) return [];
      const { data: lines, error } = await supabase
        .from('corporate_leasing_lines')
        .select('*')
        .eq('agreement_id', data.id)
        .order('line_number');
      if (error) throw error;
      return lines;
    },
    enabled: !!data.id
  });

  // Get filtered drivers for a specific line search
  const getFilteredDrivers = (lineId: string) => {
    const searchTerm = searchByLine[lineId] || '';
    if (!searchTerm) return allDrivers.filter(d => d.status === 'active');
    
    const lowerSearch = searchTerm.toLowerCase();
    return allDrivers.filter(d => 
      d.status === 'active' && (
        d.full_name?.toLowerCase().includes(lowerSearch) ||
        d.license_no?.toLowerCase().includes(lowerSearch) ||
        d.emirates_id?.toLowerCase().includes(lowerSearch) ||
        d.phone?.toLowerCase().includes(lowerSearch)
      )
    );
  };

  // Group drivers by line
  const getDriversForLine = (lineId: string) => {
    return agreementDrivers.filter(ad => ad.line_id === lineId);
  };

  const handleAssignDriver = async (lineId: string, driverId: string) => {
    if (!data.id) return;

    const lineDrivers = getDriversForLine(lineId);
    const isPrimary = lineDrivers.length === 0;

    await assignDriverMutation.mutateAsync({
      agreement_id: data.id,
      line_id: lineId,
      driver_id: driverId,
      is_primary: isPrimary
    });

    // Clear search for this line
    setSearchByLine(prev => ({ ...prev, [lineId]: '' }));
    setComboboxOpenByLine(prev => ({ ...prev, [lineId]: false }));
  };

  const handleDriverCreated = (newDriverId: string) => {
    setIsCreateDriverOpen(false);
  };

  const handleRemoveDriver = async (assignmentId: string) => {
    if (!data.id) return;
    await removeDriverMutation.mutateAsync({ assignmentId, agreementId: data.id });
  };

  const handleMakePrimary = async (assignmentId: string, lineId: string) => {
    if (!data.id) return;
    
    // First, set all drivers on this line to non-primary
    const lineDrivers = getDriversForLine(lineId);
    for (const ld of lineDrivers) {
      if (ld.id !== assignmentId && ld.is_primary) {
        await updateDriverMutation.mutateAsync({
          assignmentId: ld.id,
          agreementId: data.id,
          updates: { is_primary: false }
        });
      }
    }
    
    // Then make the selected driver primary
    await updateDriverMutation.mutateAsync({
      assignmentId,
      agreementId: data.id,
      updates: { is_primary: true }
    });
  };

  if (!data.id) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Please save the agreement as a draft first before assigning drivers.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loadingLines) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">Loading vehicle lines...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Authorized Drivers</h2>
        <p className="text-sm text-muted-foreground">
          Assign drivers to each vehicle line. Search and click to assign instantly.
        </p>
      </div>

      {/* Inline Driver Assignment by Line */}
      {vehicleLines.length > 0 ? (
        <div className="space-y-6">
          {vehicleLines.map((line, index) => {
            const lineDrivers = getDriversForLine(line.id);
            const filteredDrivers = getFilteredDrivers(line.id);
            const isComboboxOpen = comboboxOpenByLine[line.id] || false;
            
            return (
              <Card key={line.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        Line {line.line_number}: {line.item_description || `${line.make} ${line.model} ${line.model_year}`}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{line.contract_no}</span>
                        {line.category_name && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">{line.category_name}</Badge>
                          </>
                        )}
                        {line.monthly_rate_aed && (
                          <>
                            <span>•</span>
                            <span className="font-semibold">AED {line.monthly_rate_aed.toLocaleString()}/mo</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search & Create Row */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Popover open={isComboboxOpen} onOpenChange={(open) => setComboboxOpenByLine(prev => ({ ...prev, [line.id]: open }))}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={isComboboxOpen}
                            className="w-full justify-between"
                          >
                            Search drivers...
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[600px] p-0" align="start">
                          <Command shouldFilter={false}>
                            <CommandInput 
                              placeholder="Search by name, license, Emirates ID..." 
                              value={searchByLine[line.id] || ''}
                              onValueChange={(value) => setSearchByLine(prev => ({ ...prev, [line.id]: value }))}
                            />
                            <CommandList>
                              <CommandEmpty>
                                {isSearchingDrivers ? "Searching..." : "No driver found."}
                              </CommandEmpty>
                              <CommandGroup>
                                {filteredDrivers.map((driver) => (
                                  <CommandItem
                                    key={driver.id}
                                    value={driver.id}
                                    onSelect={() => handleAssignDriver(line.id, driver.id)}
                                    className="flex items-center justify-between py-2"
                                  >
                                    <div className="flex-1">
                                      <div className="font-medium">{driver.full_name}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {driver.nationality} • {driver.phone} • ID: {driver.emirates_id} • License: {driver.license_no}
                                      </div>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => setIsCreateDriverOpen(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create New
                    </Button>
                  </div>

                  {/* Assigned Drivers Table */}
                  {lineDrivers.length > 0 ? (
                    <div className="border rounded-lg">
                      <div className="p-3 border-b bg-muted/30">
                        <div className="text-sm font-semibold">Assigned Drivers</div>
                      </div>
                      <div className="divide-y">
                        {lineDrivers.map((ld) => (
                          <div key={ld.id} className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3 flex-1">
                              {ld.is_primary && <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 flex-shrink-0" />}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium">{ld.driver?.full_name}</span>
                                  {ld.is_primary && <Badge variant="secondary" className="text-xs">Primary</Badge>}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {ld.driver?.phone} • ID: {ld.driver?.emirates_id} • License: {ld.driver?.license_no}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setViewDocsDriverId(ld.driver?.id || null);
                                  setViewDocsDriverName(ld.driver?.full_name || null);
                                  setDocsDialogOpen(true);
                                }}
                                title="View Documents"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              {!ld.is_primary && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleMakePrimary(ld.id, line.id)}
                                  title="Make Primary"
                                >
                                  <Star className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveDriver(ld.id)}
                                title="Remove"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-6 border rounded-lg bg-muted/30">
                      No drivers assigned yet
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              No vehicle lines found. Please add vehicles in the previous step.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create Driver Sheet */}
      <Sheet open={isCreateDriverOpen} onOpenChange={(open) => {
        setIsCreateDriverOpen(open);
        if (!open) setEditDriverId(null);
      }}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editDriverId ? 'Edit Driver' : 'Create New Driver'}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <EnhancedDriverForm
              open={isCreateDriverOpen}
              onClose={() => {
                setIsCreateDriverOpen(false);
                setEditDriverId(null);
              }}
              driverId={editDriverId || undefined}
              onSave={handleDriverCreated}
            />
          </div>
        </SheetContent>
      </Sheet>

      <DriverDocumentsDialog
        open={docsDialogOpen}
        onOpenChange={setDocsDialogOpen}
        driverId={viewDocsDriverId || undefined}
        driverName={viewDocsDriverName || undefined}
      />
    </div>
  );
};
