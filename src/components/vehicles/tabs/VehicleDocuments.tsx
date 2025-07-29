import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, File, Download, Trash2 } from "lucide-react";

interface VehicleDocumentsProps {
  vehicleId: string;
}

export function VehicleDocuments({ vehicleId }: VehicleDocumentsProps) {
  // This is a placeholder implementation
  // In a real application, you would integrate with Supabase Storage
  const mockDocuments = [
    {
      id: '1',
      name: 'Vehicle Registration.pdf',
      type: 'registration',
      uploadedAt: '2024-01-15',
      size: '2.3 MB'
    },
    {
      id: '2', 
      name: 'Insurance Policy.pdf',
      type: 'insurance',
      uploadedAt: '2024-01-10',
      size: '1.8 MB'
    },
    {
      id: '3',
      name: 'Maintenance Schedule.pdf',
      type: 'maintenance',
      uploadedAt: '2024-01-05',
      size: '0.9 MB'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Upload vehicle documents</p>
            <p className="text-muted-foreground mb-4">
              Drag and drop files here, or click to browse
            </p>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Document Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <File className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium">Registration</h3>
            <p className="text-sm text-muted-foreground">Vehicle registration documents</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <File className="h-8 w-8 mx-auto mb-2 text-secondary" />
            <h3 className="font-medium">Insurance</h3>
            <p className="text-sm text-muted-foreground">Insurance policies and certificates</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <File className="h-8 w-8 mx-auto mb-2 text-accent" />
            <h3 className="font-medium">Maintenance</h3>
            <p className="text-sm text-muted-foreground">Service records and schedules</p>
          </CardContent>
        </Card>
      </div>

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {mockDocuments.length > 0 ? (
            <div className="space-y-3">
              {mockDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <File className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.type} • {doc.size} • Uploaded {doc.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No documents uploaded yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}