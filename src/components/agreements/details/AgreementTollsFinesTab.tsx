import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, DollarSign, MapPin } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AgreementTollsFinesTabProps {
  agreement: any;
}

export const AgreementTollsFinesTab: React.FC<AgreementTollsFinesTabProps> = ({ agreement }) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Tolls</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(0)}</p>
            <p className="text-xs text-muted-foreground mt-1">0 toll charges</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(0)}</p>
            <p className="text-xs text-muted-foreground mt-1">0 traffic fines</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{formatCurrency(0)}</p>
            <p className="text-xs text-muted-foreground mt-1">All settled</p>
          </CardContent>
        </Card>
      </div>

      {/* Toll Charges */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Toll Charges (Salik/Darb)
              </CardTitle>
              <CardDescription>Automated toll gate charges during rental period</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Sync with Salik
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No toll charges recorded yet</p>
            <p className="text-sm mt-2">Toll charges will appear here automatically</p>
          </div>
        </CardContent>
      </Card>

      {/* Traffic Fines */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Traffic Fines (RTA)
              </CardTitle>
              <CardDescription>Traffic violations and fines during rental period</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Sync with RTA
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No traffic fines recorded yet</p>
            <p className="text-sm mt-2">Traffic fines will appear here automatically</p>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Compliance Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Toll Amount</span>
            <span className="font-medium">{formatCurrency(0)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Fine Amount</span>
            <span className="font-medium">{formatCurrency(0)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Toll Admin Fees</span>
            <span className="font-medium">{formatCurrency(0)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Fine Admin Fees</span>
            <span className="font-medium">{formatCurrency(0)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Black Points Accrued</span>
            <Badge variant="outline">0 points</Badge>
          </div>
          <div className="flex justify-between items-center pt-3 border-t">
            <span className="font-medium">Total Outstanding</span>
            <span className="font-bold">{formatCurrency(0)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
