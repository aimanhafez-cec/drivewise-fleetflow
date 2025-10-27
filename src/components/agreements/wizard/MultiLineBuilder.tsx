import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Car, 
  Calendar, 
  MapPin, 
  DollarSign,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Edit
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { format } from 'date-fns';
import type { AgreementLine } from '@/types/agreement-line';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface MultiLineBuilderProps {
  lines: AgreementLine[];
  onAddLine: () => void;
  onRemoveLine: (lineId: string) => void;
  onDuplicateLine: (lineId: string) => void;
  onEditLine: (lineId: string) => void;
  onReorderLines?: (lines: AgreementLine[]) => void;
  totalAmount: number;
  errors?: Record<string, string[]>;
}

export const MultiLineBuilder: React.FC<MultiLineBuilderProps> = ({
  lines,
  onAddLine,
  onRemoveLine,
  onDuplicateLine,
  onEditLine,
  totalAmount,
  errors = {},
}) => {
  const [expandedLines, setExpandedLines] = useState<Record<string, boolean>>({});

  const toggleLineExpansion = (lineId: string) => {
    setExpandedLines(prev => ({
      ...prev,
      [lineId]: !prev[lineId],
    }));
  };

  const getLineErrors = (lineId: string): string[] => {
    return errors[lineId] || [];
  };

  const hasErrors = (lineId: string): boolean => {
    return getLineErrors(lineId).length > 0;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Agreement Lines</h3>
          <p className="text-sm text-muted-foreground">
            Manage multiple vehicles in this agreement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-base px-3 py-1">
            {lines.length} {lines.length === 1 ? 'Line' : 'Lines'}
          </Badge>
          <Button onClick={onAddLine} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Line
          </Button>
        </div>
      </div>

      {/* Lines List */}
      {lines.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Car className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-semibold mb-2">No Lines Added</h4>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              Add vehicle lines to this agreement. Each line represents one vehicle rental.
            </p>
            <Button onClick={onAddLine}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Line
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {lines.map((line, index) => (
            <Card 
              key={line.id} 
              className={`transition-all ${hasErrors(line.id) ? 'border-destructive' : ''}`}
            >
              <Collapsible
                open={expandedLines[line.id]}
                onOpenChange={() => toggleLineExpansion(line.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="font-mono">
                          #{line.lineNumber}
                        </Badge>
                        {!line.isValid && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Incomplete
                          </Badge>
                        )}
                        {line.isValid && (
                          <Badge variant="default" className="bg-green-500">
                            ✓ Valid
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        {line.vehicleDetails ? (
                          `${line.vehicleDetails.year} ${line.vehicleDetails.make} ${line.vehicleDetails.model}`
                        ) : (
                          <span className="text-muted-foreground">Vehicle not selected</span>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1 space-y-1">
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {line.checkOutDateTime ? (
                              format(new Date(line.checkOutDateTime), 'MMM dd, yyyy')
                            ) : (
                              'Date not set'
                            )}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {line.checkOutLocationId || 'Location not set'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(line.pricingBreakdown.total)}
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditLine(line.id);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateLine(line.id);
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveLine(line.id);
                        }}
                        disabled={lines.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {expandedLines[line.id] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />
                    
                    {/* Line Details */}
                    <div className="space-y-4">
                      {/* Errors */}
                      {hasErrors(line.id) && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <ul className="list-disc list-inside space-y-1">
                              {getLineErrors(line.id).map((error, idx) => (
                                <li key={idx} className="text-sm">{error}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Rental Period */}
                      <div>
                        <h5 className="text-sm font-semibold mb-2">Rental Period</h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Check-out:</span>
                            <p className="font-medium">
                              {line.checkOutDateTime ? (
                                format(new Date(line.checkOutDateTime), 'MMM dd, yyyy HH:mm')
                              ) : (
                                'Not set'
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {line.checkOutLocationId || 'Location not set'}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Check-in:</span>
                            <p className="font-medium">
                              {line.checkInDateTime ? (
                                format(new Date(line.checkInDateTime), 'MMM dd, yyyy HH:mm')
                              ) : (
                                'Not set'
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {line.checkInLocationId || 'Location not set'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Add-ons */}
                      {line.addons.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold mb-2">Add-ons</h5>
                          <div className="flex flex-wrap gap-2">
                            {line.addons.map((addon) => (
                              <Badge key={addon.addonId} variant="outline">
                                {addon.name} × {addon.quantity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Pricing Breakdown */}
                      <div>
                        <h5 className="text-sm font-semibold mb-2">Pricing Breakdown</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Base Rate:</span>
                            <span>{formatCurrency(line.pricingBreakdown.baseRate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Insurance:</span>
                            <span>{formatCurrency(line.pricingBreakdown.insurance)}</span>
                          </div>
                          {line.pricingBreakdown.maintenance > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Maintenance:</span>
                              <span>{formatCurrency(line.pricingBreakdown.maintenance)}</span>
                            </div>
                          )}
                          {line.pricingBreakdown.addons > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Add-ons:</span>
                              <span>{formatCurrency(line.pricingBreakdown.addons)}</span>
                            </div>
                          )}
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span>{formatCurrency(line.pricingBreakdown.subtotal)}</span>
                          </div>
                          {line.pricingBreakdown.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount:</span>
                              <span>-{formatCurrency(line.pricingBreakdown.discount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">VAT (5%):</span>
                            <span>{formatCurrency(line.pricingBreakdown.vat)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-semibold text-base">
                            <span>Line Total:</span>
                            <span className="text-primary">{formatCurrency(line.pricingBreakdown.total)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {(line.specialInstructions || line.internalNotes) && (
                        <div>
                          <h5 className="text-sm font-semibold mb-2">Notes</h5>
                          {line.specialInstructions && (
                            <div className="mb-2">
                              <span className="text-xs text-muted-foreground">Special Instructions:</span>
                              <p className="text-sm">{line.specialInstructions}</p>
                            </div>
                          )}
                          {line.internalNotes && (
                            <div>
                              <span className="text-xs text-muted-foreground">Internal Notes:</span>
                              <p className="text-sm">{line.internalNotes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}

      {/* Total Summary */}
      {lines.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Agreement Amount</p>
                <p className="text-xs text-muted-foreground">
                  Sum of all {lines.length} line{lines.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
