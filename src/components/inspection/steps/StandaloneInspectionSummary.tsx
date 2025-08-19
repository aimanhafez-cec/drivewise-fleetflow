import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  FileText,
  Car,
  Gauge,
  Fuel,
  Camera,
  PenTool,
  User,
  Calendar
} from 'lucide-react';

interface StandaloneInspectionSummaryProps {
  inspectionData: any;
  onSignature: (signature: { imageUrl: string; name: string; signedAt: string }) => void;
  onNotesChange: (notes: string) => void;
  onComplete: (status: 'passed' | 'failed' | 'needs_attention') => void;
  isSubmitting: boolean;
}

export const StandaloneInspectionSummary: React.FC<StandaloneInspectionSummaryProps> = ({
  inspectionData,
  onSignature,
  onNotesChange,
  onComplete,
  isSubmitting
}) => {
  const [notes, setNotes] = useState(inspectionData.notes || '');
  const [inspectorName, setInspectorName] = useState('');
  
  const handleNotesChange = (value: string) => {
    setNotes(value);
    onNotesChange(value);
  };

  const handleSignature = () => {
    if (!inspectorName.trim()) {
      alert('Please enter inspector name');
      return;
    }
    
    const signature = {
      imageUrl: 'data:signature', // Placeholder - in real implementation would capture actual signature
      name: inspectorName,
      signedAt: new Date().toISOString()
    };
    
    onSignature(signature);
  };

  // Determine overall inspection status
  const hasFailures = Object.values(inspectionData.checklist || {}).includes('DAMAGE');
  const hasDamage = (inspectionData.damageMarkerIds || []).length > 0;
  
  const getRecommendedStatus = () => {
    if (hasFailures || hasDamage) {
      return hasDamage ? 'failed' : 'needs_attention';
    }
    return 'passed';
  };

  const recommendedStatus = getRecommendedStatus();

  return (
    <div id="step-summary" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Inspection Summary</h3>
        <p className="text-muted-foreground">
          Review the inspection results and complete the process.
        </p>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Inspection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {recommendedStatus === 'passed' && (
              <>
                <CheckCircle className="h-6 w-6 text-green-600" />
                <Badge className="bg-green-100 text-green-800">Recommended: PASSED</Badge>
              </>
            )}
            {recommendedStatus === 'needs_attention' && (
              <>
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                <Badge className="bg-yellow-100 text-yellow-800">Recommended: NEEDS ATTENTION</Badge>
              </>
            )}
            {recommendedStatus === 'failed' && (
              <>
                <XCircle className="h-6 w-6 text-red-600" />
                <Badge className="bg-red-100 text-red-800">Recommended: FAILED</Badge>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Inspection Details Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Checklist Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Car className="h-4 w-4" />
              Checklist Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(inspectionData.checklist || {}).map(([item, status]) => (
                <div key={item} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{item.replace('_', ' ')}</span>
                  <Badge 
                    variant={status === 'OK' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {String(status)}
                  </Badge>
                </div>
              ))}
              {Object.keys(inspectionData.checklist || {}).length === 0 && (
                <p className="text-sm text-muted-foreground">No checklist items completed</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gauge className="h-4 w-4" />
              Vehicle Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {inspectionData.metrics?.odometer && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Odometer</span>
                  <span className="text-sm font-medium">{inspectionData.metrics.odometer.toLocaleString()} km</span>
                </div>
              )}
              {inspectionData.metrics?.fuelLevel && (
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-1">
                    <Fuel className="h-3 w-3" />
                    Fuel Level
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {inspectionData.metrics.fuelLevel}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Damage Summary */}
      {(inspectionData.damageMarkerIds || []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4" />
              Damage Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {inspectionData.damageMarkerIds.length} damage marker{inspectionData.damageMarkerIds.length !== 1 ? 's' : ''} recorded
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Additional Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Add any additional observations or notes..."
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Inspector Signature */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Inspector Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Inspector Name</Label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter your full name"
              value={inspectorName}
              onChange={(e) => setInspectorName(e.target.value)}
            />
          </div>
          
          {inspectionData.signature && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  Signed by {inspectionData.signature.name} on {new Date(inspectionData.signature.signedAt).toLocaleString()}
                </span>
              </div>
            </div>
          )}
          
          {!inspectionData.signature && inspectorName && (
            <Button onClick={handleSignature} variant="outline" className="w-full">
              <PenTool className="mr-2 h-4 w-4" />
              Add Digital Signature
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Complete Inspection Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Inspection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose the final status for this inspection based on your findings.
            </p>
            
            <div className="grid gap-3">
              <Button
                onClick={() => onComplete('passed')}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete as PASSED
              </Button>
              
              <Button
                onClick={() => onComplete('needs_attention')}
                disabled={isSubmitting}
                variant="outline"
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Complete as NEEDS ATTENTION
              </Button>
              
              <Button
                onClick={() => onComplete('failed')}
                disabled={isSubmitting}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Complete as FAILED
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};