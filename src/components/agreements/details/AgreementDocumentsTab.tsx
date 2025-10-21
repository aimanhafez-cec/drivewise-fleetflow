import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Download, Mail, MessageSquare } from 'lucide-react';

interface AgreementDocumentsTabProps {
  agreement: any;
}

export const AgreementDocumentsTab: React.FC<AgreementDocumentsTabProps> = ({ agreement }) => {
  return (
    <div className="space-y-6">
      {/* Agreement Documents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Agreement Documents
              </CardTitle>
              <CardDescription>Official documents for this rental agreement</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Rental Agreement Contract', type: 'PDF', size: '245 KB' },
              { name: 'Terms & Conditions', type: 'PDF', size: '156 KB' },
              { name: 'Insurance Certificate', type: 'PDF', size: '189 KB' },
            ].map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.type} · {doc.size}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Customer Documents
          </CardTitle>
          <CardDescription>Customer identification and verification documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Emirates ID (Front)', type: 'Image', size: '1.2 MB' },
              { name: 'Emirates ID (Back)', type: 'Image', size: '1.1 MB' },
              { name: 'UAE Driving License', type: 'Image', size: '945 KB' },
            ].map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.type} · {doc.size}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Communications Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Communications Log
          </CardTitle>
          <CardDescription>All communications with the customer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No communications recorded yet</p>
            <p className="text-sm mt-2">Emails, SMS, and notes will appear here</p>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Download */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Download All Documents</p>
              <p className="text-sm text-muted-foreground">Get all documents in a single ZIP file</p>
            </div>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download ZIP
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
