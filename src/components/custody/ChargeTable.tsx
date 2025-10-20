import { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { CustodyCharge, ChargeType, ChargeResponsibility, ChargeStatus } from '@/lib/api/custody';

interface ChargeTableProps {
  charges: CustodyCharge[];
  onChargesChange: (charges: CustodyCharge[]) => void;
  canEdit?: boolean;
  canPost?: boolean;
}

export function ChargeTable({ 
  charges, 
  onChargesChange, 
  canEdit = true,
  canPost = false 
}: ChargeTableProps) {
  const [editingRow, setEditingRow] = useState<string | null>(null);

  const addNewCharge = () => {
    const newCharge: CustodyCharge = {
      id: `temp-${Date.now()}`,
      custody_id: '',
      charge_type: 'damage',
      description: '',
      quantity: 1,
      unit_price: 0,
      tax_rate: 5,
      tax_amount: 0,
      total_amount: 0,
      responsibility: 'customer',
      status: 'draft',
      created_at: new Date().toISOString(),
    };
    
    onChargesChange([...charges, newCharge]);
    setEditingRow(newCharge.id);
  };

  const updateCharge = (id: string, updates: Partial<CustodyCharge>) => {
    const updatedCharges = charges.map((charge) => {
      if (charge.id === id) {
        const updated = { ...charge, ...updates };
        
        // Auto-calculate amounts
        const subtotal = updated.quantity * updated.unit_price;
        const taxAmount = (subtotal * (updated.tax_rate || 0)) / 100;
        const totalAmount = subtotal + taxAmount;
        
        return {
          ...updated,
          tax_amount: taxAmount,
          total_amount: totalAmount,
        };
      }
      return charge;
    });
    
    onChargesChange(updatedCharges);
  };

  const deleteCharge = (id: string) => {
    onChargesChange(charges.filter((c) => c.id !== id));
    if (editingRow === id) {
      setEditingRow(null);
    }
  };

  const calculateTotals = () => {
    const subtotal = charges.reduce((sum, c) => sum + (c.quantity * c.unit_price), 0);
    const tax = charges.reduce((sum, c) => sum + (c.tax_amount || 0), 0);
    const total = charges.reduce((sum, c) => sum + c.total_amount, 0);
    
    return { subtotal, tax, total };
  };

  const totals = calculateTotals();

  const getStatusBadge = (status: ChargeStatus) => {
    const statusConfig = {
      draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
      posted: { label: 'Posted', className: 'bg-blue-100 text-blue-800' },
      invoiced: { label: 'Invoiced', className: 'bg-green-100 text-green-800' },
      paid: { label: 'Paid', className: 'bg-green-600 text-white' },
    };
    
    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      {canEdit && (
        <div className="flex justify-end">
          <Button onClick={addNewCharge} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Charge
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24">Qty</TableHead>
              <TableHead className="w-32">Unit Price</TableHead>
              <TableHead className="w-24">Tax %</TableHead>
              <TableHead className="w-32">Tax Amount</TableHead>
              <TableHead className="w-32">Total</TableHead>
              <TableHead>Responsibility</TableHead>
              <TableHead>Status</TableHead>
              {canEdit && <TableHead className="w-24">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {charges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 10 : 9} className="text-center text-muted-foreground">
                  No charges added yet
                </TableCell>
              </TableRow>
            ) : (
              charges.map((charge) => {
                const isEditing = editingRow === charge.id;
                
                return (
                  <TableRow key={charge.id}>
                    <TableCell>
                      {isEditing ? (
                        <Select
                          value={charge.charge_type}
                          onValueChange={(value) =>
                            updateCharge(charge.id, { charge_type: value as ChargeType })
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background">
                            <SelectItem value="damage">Damage</SelectItem>
                            <SelectItem value="upgrade">Upgrade</SelectItem>
                            <SelectItem value="downgrade">Downgrade</SelectItem>
                            <SelectItem value="admin_fee">Admin Fee</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="capitalize">{charge.charge_type.replace('_', ' ')}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={charge.description}
                          onChange={(e) =>
                            updateCharge(charge.id, { description: e.target.value })
                          }
                          placeholder="Description"
                        />
                      ) : (
                        charge.description || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={charge.quantity}
                          onChange={(e) =>
                            updateCharge(charge.id, { quantity: parseFloat(e.target.value) })
                          }
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        charge.quantity
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={charge.unit_price}
                          onChange={(e) =>
                            updateCharge(charge.id, { unit_price: parseFloat(e.target.value) })
                          }
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        `${charge.unit_price.toFixed(2)} AED`
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={charge.tax_rate || 5}
                          onChange={(e) =>
                            updateCharge(charge.id, { tax_rate: parseFloat(e.target.value) })
                          }
                          min="0"
                          max="100"
                          step="0.01"
                        />
                      ) : (
                        `${charge.tax_rate || 5}%`
                      )}
                    </TableCell>
                    <TableCell>{(charge.tax_amount || 0).toFixed(2)} AED</TableCell>
                    <TableCell className="font-semibold">
                      {charge.total_amount.toFixed(2)} AED
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select
                          value={charge.responsibility}
                          onValueChange={(value) =>
                            updateCharge(charge.id, { responsibility: value as ChargeResponsibility })
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background">
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="company">Company</SelectItem>
                            <SelectItem value="insurance">Insurance</SelectItem>
                            <SelectItem value="third_party">Third Party</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="capitalize">{charge.responsibility.replace('_', ' ')}</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(charge.status)}</TableCell>
                    {canEdit && (
                      <TableCell>
                        <div className="flex gap-1">
                          {isEditing ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingRow(null)}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingRow(charge.id)}
                            >
                              Edit
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteCharge(charge.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Totals */}
      {charges.length > 0 && (
        <div className="flex justify-end">
          <div className="w-96 space-y-2 rounded-md border p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>{totals.subtotal.toFixed(2)} AED</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax:</span>
              <span>{totals.tax.toFixed(2)} AED</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-semibold">
              <span>Total:</span>
              <span>{totals.total.toFixed(2)} AED</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
