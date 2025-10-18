import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface DriverDocument {
  id: string;
  document_type: string;
  file_url?: string;
  document_url?: string;
  is_verified: boolean;
  expiry_date?: string;
  verified_at?: string;
  verified_by?: string;
  rejection_reason?: string;
}

interface DriverDocumentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driverId?: string;
  driverName?: string;
}

const documentTypeLabels: Record<string, string> = {
  emirates_id_front: "Emirates ID (Front)",
  emirates_id_back: "Emirates ID (Back)",
  driving_license_front: "Driving License (Front)",
  driving_license_back: "Driving License (Back)",
  passport_bio_page: "Passport Bio Page",
  visa_page: "Visa Page",
  other: "Other Document"
};

export function DriverDocumentsDialog({
  open,
  onOpenChange,
  driverId,
  driverName
}: DriverDocumentsDialogProps) {
  const { data: documents, isLoading } = useQuery({
    queryKey: ['driver-documents', driverId],
    queryFn: async () => {
      if (!driverId) return [];
      
      const { data, error } = await supabase
        .from('driver_documents')
        .select('*')
        .eq('driver_id', driverId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DriverDocument[];
    },
    enabled: open && !!driverId
  });

  const getStatusBadge = (doc: DriverDocument) => {
    if (doc.is_verified) {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    }
    
    if (doc.rejection_reason) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry < thirtyDaysFromNow && expiry > new Date();
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Documents - {driverName || 'Driver'}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading documents...
          </div>
        ) : !documents || documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No documents uploaded yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {documentTypeLabels[doc.document_type] || doc.document_type}
                        </span>
                        {getStatusBadge(doc)}
                      </div>
                      
                      {doc.expiry_date && (
                        <div className="text-sm text-muted-foreground mt-1">
                          <span>Expires: </span>
                          <span className={
                            isExpired(doc.expiry_date) 
                              ? "text-destructive font-medium" 
                              : isExpiringSoon(doc.expiry_date)
                              ? "text-yellow-600 font-medium"
                              : ""
                          }>
                            {format(new Date(doc.expiry_date), 'dd MMM yyyy')}
                            {isExpired(doc.expiry_date) && " (Expired)"}
                            {isExpiringSoon(doc.expiry_date) && !isExpired(doc.expiry_date) && " (Expiring Soon)"}
                          </span>
                        </div>
                      )}
                      
                      {doc.verified_at && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Verified on {format(new Date(doc.verified_at), 'dd MMM yyyy')}
                        </div>
                      )}
                      
                      {doc.rejection_reason && (
                        <div className="text-sm text-destructive mt-2">
                          Reason: {doc.rejection_reason}
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(doc.file_url || doc.document_url || '', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
