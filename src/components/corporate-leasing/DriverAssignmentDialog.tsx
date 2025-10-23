import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Plus, MoreVertical, Star, Edit, Trash, User, Phone, CreditCard, UserPlus } from 'lucide-react';
import type { DriverLine, AssignedDriver } from '@/lib/api/corporateDriverAssignment';
import { useDrivers } from '@/hooks/useDrivers';
import {
  useAssignDriverToLine,
  useRemoveDriverFromLine,
  useUpdateDriverAssignment,
} from '@/hooks/useCorporateDriverAssignment';
import { EnhancedDriverForm } from '@/components/drivers/EnhancedDriverForm';
import { format } from 'date-fns';

interface DriverAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  line: DriverLine;
  mode: 'assign' | 'manage';
}

export const DriverAssignmentDialog: React.FC<DriverAssignmentDialogProps> = ({
  open,
  onClose,
  line,
  mode,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'create'>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [isCreateDriverSheetOpen, setIsCreateDriverSheetOpen] = useState(false);
  
  // Edit assignment state
  const [editingAssignment, setEditingAssignment] = useState<AssignedDriver | null>(null);
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  
  // Remove confirmation state
  const [removingDriver, setRemovingDriver] = useState<AssignedDriver | null>(null);

  const driversData = useDrivers(searchTerm);
  const assignDriverMutation = useAssignDriverToLine();
  const removeDriverMutation = useRemoveDriverFromLine();
  const updateAssignmentMutation = useUpdateDriverAssignment();

  const drivers = driversData?.items || [];

  // Auto-populate assignment date from contract
  const defaultAssignmentDate = line.contractStartDate;

  const handleAssignExistingDriver = async (driverId: string) => {
    const isFirstDriver = line.assignedDrivers.length === 0;
    
    await assignDriverMutation.mutateAsync({
      lineId: line.lineId,
      driverId,
      isPrimary: isFirstDriver,
      assignmentStartDate: defaultAssignmentDate,
    });

    if (mode === 'assign') {
      onClose();
    } else {
      setShowAddDriver(false);
    }
  };

  const handleDriverCreated = async (driverId?: string) => {
    setIsCreateDriverSheetOpen(false);
    if (driverId) {
      await handleAssignExistingDriver(driverId);
    }
  };

  const handleSetPrimary = async (assignmentId: string) => {
    await updateAssignmentMutation.mutateAsync({
      assignmentId,
      updates: { isPrimary: true },
    });
  };

  const handleEditAssignment = (assignment: AssignedDriver) => {
    setEditingAssignment(assignment);
    setEditStartDate(assignment.assignmentDate);
    setEditEndDate(assignment.assignmentEndDate || '');
    setEditNotes(assignment.notes || '');
  };

  const handleSaveEdit = async () => {
    if (!editingAssignment) return;

    await updateAssignmentMutation.mutateAsync({
      assignmentId: editingAssignment.id,
      updates: {
        assignmentStartDate: editStartDate,
        assignmentEndDate: editEndDate || undefined,
        notes: editNotes || undefined,
      },
    });

    setEditingAssignment(null);
  };

  const handleRemoveDriver = (driver: AssignedDriver) => {
    setRemovingDriver(driver);
  };

  const confirmRemoveDriver = async () => {
    if (!removingDriver) return;

    await removeDriverMutation.mutateAsync(removingDriver.id);
    setRemovingDriver(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {mode === 'assign' ? 'Assign Driver' : 'Manage Drivers'}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-1 text-left mt-2 text-sm">
                <p>
                  <strong>Vehicle:</strong> {line.itemCode} - {line.itemDescription}
                </p>
                <p>
                  <strong>Agreement:</strong> {line.agreementNumber}
                </p>
                <p>
                  <strong>Customer:</strong> {line.customerName}
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>

          {mode === 'assign' ? (
            // ASSIGN MODE
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="search">Search Existing</TabsTrigger>
                <TabsTrigger value="create">Create New</TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="space-y-4 mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, license, phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <ScrollArea className="h-[400px] border rounded-lg p-4">
                  {drivers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="mx-auto h-12 w-12 mb-3" />
                      <p>No drivers found</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {drivers.map((driver) => (
                        <Card key={driver.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <p className="font-semibold">{driver.full_name}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                  {driver.nationality && (
                                    <span className="flex items-center gap-1">
                                      {driver.nationality === 'Emirati' && '🇦🇪'}
                                      {driver.nationality}
                                    </span>
                                  )}
                                  {driver.phone && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {driver.phone}
                                      </span>
                                    </>
                                  )}
                                  {driver.emirates_id && (
                                    <>
                                      <span>•</span>
                                      <span>ID: {driver.emirates_id}</span>
                                    </>
                                  )}
                                  {driver.license_no && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <CreditCard className="h-3 w-3" />
                                        {driver.license_no}
                                      </span>
                                    </>
                                  )}
                                </div>
                                {driver.employment_id && (
                                  <p className="text-xs text-muted-foreground">
                                    Emp ID: {driver.employment_id}
                                  </p>
                                )}
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleAssignExistingDriver(driver.id)}
                                disabled={assignDriverMutation.isPending}
                              >
                                Assign
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="create" className="space-y-4 mt-4">
                <div className="flex flex-col items-center justify-center py-12">
                  <UserPlus className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Create New Driver</h3>
                  <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
                    Use the comprehensive driver form to capture all required information including
                    identity documents, employment details, and license information.
                  </p>
                  <Button onClick={() => setIsCreateDriverSheetOpen(true)} size="lg">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Open Driver Form
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            // MANAGE MODE
            <div className="space-y-6 mt-4">
              <div>
                <h3 className="text-sm font-semibold mb-3">Assigned Drivers</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Driver Name</TableHead>
                        <TableHead>License</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Assignment Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[60px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {line.assignedDrivers.map((driver) => (
                        <TableRow key={driver.id}>
                          <TableCell className="font-medium">{driver.driverName}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {driver.licenseNumber}
                          </TableCell>
                          <TableCell className="text-sm">{driver.phoneNumber}</TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(driver.assignmentDate), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={driver.isPrimary ? 'default' : 'secondary'}>
                              {driver.isPrimary ? 'Primary' : 'Secondary'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {!driver.isPrimary && (
                                  <DropdownMenuItem onClick={() => handleSetPrimary(driver.id)}>
                                    <Star className="mr-2 h-4 w-4" />
                                    Set as Primary
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleEditAssignment(driver)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Assignment
                                  </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRemoveDriver(driver)}
                                  className="text-destructive"
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Remove Driver
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {!showAddDriver ? (
                <Button
                  variant="outline"
                  onClick={() => setShowAddDriver(true)}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Driver
                </Button>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="search">Search Existing</TabsTrigger>
                        <TabsTrigger value="create">Create New</TabsTrigger>
                      </TabsList>

                      <TabsContent value="search" className="space-y-4 mt-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search by name, license, phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>

                        <ScrollArea className="h-[300px]">
                          <div className="space-y-2">
                            {drivers.map((driver) => (
                              <Card key={driver.id}>
                                <CardContent className="p-3">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="font-semibold text-sm">{driver.full_name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {driver.license_no}
                                      </p>
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={() => handleAssignExistingDriver(driver.id)}
                                    >
                                      Assign
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>

                        <Button
                          variant="outline"
                          onClick={() => setShowAddDriver(false)}
                          className="w-full"
                        >
                          Cancel
                        </Button>
                      </TabsContent>

                      <TabsContent value="create" className="space-y-4 mt-4">
                        <div className="flex flex-col items-center justify-center py-8">
                          <UserPlus className="h-12 w-12 text-muted-foreground mb-3" />
                          <p className="text-sm text-muted-foreground text-center mb-4">
                            Use the comprehensive driver form to capture all details
                          </p>
                          <Button onClick={() => setIsCreateDriverSheetOpen(true)}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Open Driver Form
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enhanced Driver Form Sheet */}
      <Sheet open={isCreateDriverSheetOpen} onOpenChange={setIsCreateDriverSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create New Driver</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <EnhancedDriverForm
              open={isCreateDriverSheetOpen}
              onClose={() => setIsCreateDriverSheetOpen(false)}
              onSave={handleDriverCreated}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Assignment Dialog */}
      <Dialog open={!!editingAssignment} onOpenChange={() => setEditingAssignment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Driver Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="editStartDate">Assignment Start Date</Label>
              <Input
                id="editStartDate"
                type="date"
                value={editStartDate}
                onChange={(e) => setEditStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editEndDate">Assignment End Date (Optional)</Label>
              <Input
                id="editEndDate"
                type="date"
                value={editEndDate}
                onChange={(e) => setEditEndDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editNotes">Notes</Label>
              <Textarea
                id="editNotes"
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingAssignment(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={updateAssignmentMutation.isPending}>
                {updateAssignmentMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={!!removingDriver} onOpenChange={() => setRemovingDriver(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Driver Assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{removingDriver?.driverName}</strong> from
              this vehicle line?
              {removingDriver?.isPrimary && line.assignedDrivers.length > 1 && (
                <p className="mt-2 text-orange-600 font-medium">
                  ⚠️ This is the primary driver. You'll need to select a new primary driver after
                  removal.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveDriver}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Driver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
