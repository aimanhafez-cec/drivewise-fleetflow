import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { PrintBlankCard } from './PrintBlankCard';
import { InspectionMaster } from '@/types/inspection';

interface PrintBlankCardModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'blank' | 'prefilled';
  inspectionData?: InspectionMaster;
}

export function PrintBlankCardModal({ open, onClose, mode, inspectionData }: PrintBlankCardModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print-modal-content">
        <DialogHeader>
          <DialogTitle>
            {mode === 'blank' ? 'Print Blank Inspection Card' : 'Print Inspection Card'}
          </DialogTitle>
        </DialogHeader>

        <div className="print-preview">
          <PrintBlankCard mode={mode} inspectionData={inspectionData} />
        </div>

        <DialogFooter className="print-hide">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
