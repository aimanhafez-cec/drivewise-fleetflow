import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentUploader } from '@/components/agreements/shared/DocumentUploader';
import type { EnhancedWizardData } from '@/types/agreement-wizard';

interface DocumentsVerificationStepProps {
  data: EnhancedWizardData['step6'];
  onChange: (field: keyof EnhancedWizardData['step6'], value: any) => void;
  errors?: string[];
}

export const DocumentsVerificationStep: React.FC<DocumentsVerificationStepProps> = ({
  data,
  onChange,
  errors = [],
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Documents & Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentUploader
            documents={data.documents}
            onDocumentsChange={(documents) => onChange('documents', documents)}
            verificationStatus={{
              emiratesIdVerified: data.emiratesIdVerified,
              licenseVerified: data.licenseVerified,
              blackPointsChecked: data.blackPointsChecked,
              blackPointsCount: data.blackPointsCount,
              eligibilityStatus: data.eligibilityStatus,
            }}
            onVerificationChange={(status) => {
              Object.entries(status).forEach(([key, value]) => {
                onChange(key as keyof EnhancedWizardData['step6'], value);
              });
            }}
          />
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <div className="text-sm text-destructive">
          {errors.map((error, i) => (
            <div key={i}>{error}</div>
          ))}
        </div>
      )}
    </div>
  );
};
