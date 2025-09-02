import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { InspectionWizard } from '@/components/inspection/InspectionWizard';
import { inspectionApi, InspectionType } from '@/lib/api/inspection';
import { 
  Printer, 
  Mail, 
  Download, 
  ClipboardCheck, 
  ClipboardX 
} from 'lucide-react';

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
  const [currentInspectionType, setCurrentInspectionType] = useState<InspectionType>('OUT');
  const { toast } = useToast();

  // Check if inspections are locked
  const { data: hasLockedOutInspection } = useQuery({
    queryKey: ['inspection-out-locked', agreementId],
    queryFn: () => inspectionApi.hasLockedInspection(agreementId, 'OUT'),
    enabled: !!agreementId,
  });

  const { data: hasLockedInInspection } = useQuery({
    queryKey: ['inspection-in-locked', agreementId],
    queryFn: () => inspectionApi.hasLockedInspection(agreementId, 'IN'),
    enabled: !!agreementId,
  });

  const canStartOutInspection = agreementStatus === 'active' && 
    agreementLines.length > 0 && 
    agreementLines.some(line => line.vehicle_id) &&
    !hasLockedOutInspection;

  const canStartInInspection = agreementStatus === 'pending_return' && 
    hasLockedOutInspection && 
    !hasLockedInInspection;

  const handleStartInspection = (type: InspectionType) => {
    setCurrentInspectionType(type);
    setShowInspectionWizard(true);
  };

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
      <div className="flex flex-wrap items-center gap-2 sm:space-x-2">
        {canStartOutInspection && (
          <Button
            id="btn-start-inspection-out"
            variant="default"
            size="sm"
            onClick={() => handleStartInspection('OUT')}
            className="bg-blue-600 hover:bg-blue-700 min-w-0 flex-1 sm:flex-none"
          >
            <ClipboardCheck className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Start </span>Inspection (OUT)
            </span>
          </Button>
        )}
        
        {canStartInInspection && (
          <Button
            id="btn-start-inspection-in"
            variant="default"
            size="sm"
            onClick={() => handleStartInspection('IN')}
            className="bg-orange-600 hover:bg-orange-700 min-w-0 flex-1 sm:flex-none"
          >
            <ClipboardX className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Start </span>Inspection (IN)
            </span>
          </Button>
        )}
        
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          <Button 
            id="btn-email-agreement"
            variant="outline" 
            size="sm" 
            onClick={handleEmail}
            className="min-w-0"
          >
            <Mail className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">Email</span>
          </Button>
          <Button 
            id="btn-print-agreement"
            variant="outline" 
            size="sm" 
            onClick={handlePrint}
            className="min-w-0"
          >
            <Printer className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">Print</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownload}
            className="min-w-0"
          >
            <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">
              <span className="hidden xs:inline">Down</span>load
            </span>
          </Button>
        </div>
      </div>

      {showInspectionWizard && agreementLines.length > 0 && (
        <InspectionWizard
          agreementId={agreementId}
          lineId={agreementLines[0].id}
          inspectionType={currentInspectionType}
          isOpen={showInspectionWizard}
          onClose={() => setShowInspectionWizard(false)}
        />
      )}
    </>
  );
};