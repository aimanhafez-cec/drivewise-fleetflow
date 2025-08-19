import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Printer, Mail, Download, Clipboard } from 'lucide-react';
import { InspectionWizard } from '@/components/inspection/InspectionWizard';

interface AgreementActionsProps {
  agreementId: string;
  agreementNo: string;
  agreementStatus?: string;
  agreementLines?: any[];
}

export const AgreementActions: React.FC<AgreementActionsProps> = ({ 
  agreementId, 
  agreementNo,
  agreementStatus = 'active',
  agreementLines = []
}) => {
  const [showInspectionWizard, setShowInspectionWizard] = useState(false);

  const canStartInspection = agreementStatus === 'active' && 
    agreementLines.length > 0 && 
    agreementLines.some(line => line.vehicle_id);

  const handlePrint = async () => {
    try {
      // In a real app, this would call an API endpoint to generate PDF
      const printUrl = `/api/agreements/${agreementId}/print`;
      window.open(printUrl, '_blank');
      
      toast({
        title: "Print Ready",
        description: "Agreement PDF opened in new tab for printing.",
      });
    } catch (error) {
      toast({
        title: "Print Failed",
        description: "Unable to generate printable agreement.",
        variant: "destructive",
      });
    }
  };

  const handleEmail = async () => {
    try {
      // Mock email functionality - in real app, would call API
      const recipients = prompt('Enter email recipients (comma-separated):');
      if (!recipients) return;

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Email Sent",
        description: `Agreement ${agreementNo} sent to ${recipients}`,
      });
    } catch (error) {
      toast({
        title: "Email Failed",
        description: "Unable to send agreement email.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    try {
      // Mock download functionality
      toast({
        title: "Download Started",
        description: `Downloading agreement ${agreementNo}.pdf`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download agreement.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        {canStartInspection && (
          <Button
            id="btn-start-inspection-out"
            onClick={() => setShowInspectionWizard(true)}
            className="mr-2"
          >
            <Clipboard className="mr-2 h-4 w-4" />
            Start Inspection (OUT)
          </Button>
        )}
        
        <Button 
          id="btn-email-agreement"
          variant="outline" 
          size="sm" 
          onClick={handleEmail}
        >
          <Mail className="mr-2 h-4 w-4" />
          Email
        </Button>
        <Button 
          id="btn-print-agreement"
          variant="outline" 
          size="sm" 
          onClick={handlePrint}
        >
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownload}
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>

      {showInspectionWizard && agreementLines.length > 0 && (
        <InspectionWizard
          agreementId={agreementId}
          lineId={agreementLines[0].id}
          isOpen={showInspectionWizard}
          onClose={() => setShowInspectionWizard(false)}
        />
      )}
    </>
  );
};