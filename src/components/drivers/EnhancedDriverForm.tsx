import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { DriverDocumentUpload } from './DriverDocumentUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, FileText, Briefcase, Shield, Loader2 } from 'lucide-react';

interface EnhancedDriverFormProps {
  open: boolean;
  onClose: () => void;
  driverId?: string;
  onSave: (driverId?: string) => void;
}

interface DriverFormData {
  full_name: string;
  license_no: string;
  phone: string;
  email: string;
  date_of_birth: string;
  license_expiry: string;
  emirates_id: string;
  passport_number: string;
  nationality: string;
  license_issued_by: string;
  license_issue_date: string;
  employment_id: string;
  department: string;
  visa_expiry: string;
  address_emirate: string;
  status: string;
  additional_driver_fee: number;
}

export const EnhancedDriverForm: React.FC<EnhancedDriverFormProps> = ({
  open,
  onClose,
  driverId,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<string>('unverified');
  const [formData, setFormData] = useState<DriverFormData>({
    full_name: '',
    license_no: '',
    phone: '',
    email: '',
    date_of_birth: '',
    license_expiry: '',
    emirates_id: '',
    passport_number: '',
    nationality: '',
    license_issued_by: '',
    license_issue_date: '',
    employment_id: '',
    department: '',
    visa_expiry: '',
    address_emirate: '',
    status: 'active',
    additional_driver_fee: 0
  });

  useEffect(() => {
    if (driverId && open) {
      loadDriverData();
      loadDocuments();
    }
  }, [driverId, open]);

  const loadDriverData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', driverId)
        .single();
      
      if (error) throw error;
      if (data) {
        setFormData({
          full_name: data.full_name || '',
          license_no: data.license_no || '',
          phone: data.phone || '',
          email: data.email || '',
          date_of_birth: data.date_of_birth || '',
          license_expiry: data.license_expiry || '',
          emirates_id: data.emirates_id || '',
          passport_number: data.passport_number || '',
          nationality: data.nationality || '',
          license_issued_by: data.license_issued_by || '',
          license_issue_date: data.license_issue_date || '',
          employment_id: data.employment_id || '',
          department: data.department || '',
          visa_expiry: data.visa_expiry || '',
          address_emirate: data.address_emirate || '',
          status: data.status || 'active',
          additional_driver_fee: data.additional_driver_fee || 0
        });
        setVerificationStatus(data.verification_status || 'unverified');
      }
    } catch (error) {
      console.error('Error loading driver:', error);
      toast.error('Failed to load driver data');
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('driver_documents')
        .select('*')
        .eq('driver_id', driverId);
      
      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      let savedDriverId = driverId;
      
      if (driverId) {
        const { error } = await supabase
          .from('drivers')
          .update(formData)
          .eq('id', driverId);
        
        if (error) throw error;
        toast.success('Driver updated successfully');
      } else {
        const { data, error } = await supabase
          .from('drivers')
          .insert([formData])
          .select('id')
          .single();
        
        if (error) throw error;
        savedDriverId = data.id;
        toast.success('Driver created successfully');
      }
      
      onSave(savedDriverId);
      onClose();
    } catch (error) {
      console.error('Error saving driver:', error);
      toast.error('Failed to save driver');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; variant: any }> = {
      unverified: { label: 'Unverified', variant: 'destructive' },
      pending_docs: { label: 'Pending Documents', variant: 'secondary' },
      verified: { label: 'Verified', variant: 'default' },
      approved: { label: 'Approved', variant: 'default' },
      rejected: { label: 'Rejected', variant: 'destructive' },
      expired: { label: 'Expired', variant: 'destructive' }
    };
    
    const badge = badges[status] || badges.unverified;
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
  };

  const getDocument = (type: string) => documents.find(d => d.document_type === type);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{driverId ? 'Edit Driver' : 'Add Driver'}</DialogTitle>
            {driverId && getStatusBadge(verificationStatus)}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">
                <User className="h-4 w-4 mr-2" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="identity">
                <Shield className="h-4 w-4 mr-2" />
                Identity
              </TabsTrigger>
              <TabsTrigger value="employment">
                <Briefcase className="h-4 w-4 mr-2" />
                Employment
              </TabsTrigger>
              <TabsTrigger value="documents" disabled={!driverId}>
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license_no">License Number *</Label>
                  <Input
                    id="license_no"
                    value={formData.license_no}
                    onChange={(e) => setFormData({ ...formData, license_no: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+971-XX-XXX-XXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license_expiry">License Expiry</Label>
                  <Input
                    id="license_expiry"
                    type="date"
                    value={formData.license_expiry}
                    onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="identity" className="space-y-4 mt-4">
              <Alert>
                <AlertDescription>
                  UAE-specific identity information required for legal compliance and vehicle handover.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emirates_id">Emirates ID *</Label>
                  <Input
                    id="emirates_id"
                    value={formData.emirates_id}
                    onChange={(e) => setFormData({ ...formData, emirates_id: e.target.value })}
                    placeholder="XXX-XXXX-XXXXXXX-X"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passport_number">Passport Number *</Label>
                  <Input
                    id="passport_number"
                    value={formData.passport_number}
                    onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality *</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license_issued_by">License Issued By</Label>
                  <Select value={formData.license_issued_by} onValueChange={(value) => setFormData({ ...formData, license_issued_by: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select authority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dubai RTA">Dubai RTA</SelectItem>
                      <SelectItem value="Abu Dhabi Police">Abu Dhabi Police</SelectItem>
                      <SelectItem value="Sharjah Police">Sharjah Police</SelectItem>
                      <SelectItem value="Ajman Police">Ajman Police</SelectItem>
                      <SelectItem value="RAK Police">RAK Police</SelectItem>
                      <SelectItem value="Fujairah Police">Fujairah Police</SelectItem>
                      <SelectItem value="UAQ Police">UAQ Police</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license_issue_date">License Issue Date</Label>
                  <Input
                    id="license_issue_date"
                    type="date"
                    value={formData.license_issue_date}
                    onChange={(e) => setFormData({ ...formData, license_issue_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visa_expiry">Visa Expiry</Label>
                  <Input
                    id="visa_expiry"
                    type="date"
                    value={formData.visa_expiry}
                    onChange={(e) => setFormData({ ...formData, visa_expiry: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address_emirate">Address Emirate</Label>
                  <Select value={formData.address_emirate} onValueChange={(value) => setFormData({ ...formData, address_emirate: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select emirate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dubai">Dubai</SelectItem>
                      <SelectItem value="Abu Dhabi">Abu Dhabi</SelectItem>
                      <SelectItem value="Sharjah">Sharjah</SelectItem>
                      <SelectItem value="Ajman">Ajman</SelectItem>
                      <SelectItem value="Ras Al Khaimah">Ras Al Khaimah</SelectItem>
                      <SelectItem value="Fujairah">Fujairah</SelectItem>
                      <SelectItem value="Umm Al Quwain">Umm Al Quwain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="employment" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employment_id">Employee ID / Badge Number</Label>
                  <Input
                    id="employment_id"
                    value={formData.employment_id}
                    onChange={(e) => setFormData({ ...formData, employment_id: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4 mt-4">
              <Alert>
                <AlertDescription>
                  All documents must be uploaded and verified before vehicle handover. Supported formats: JPEG, PNG, PDF (max 5MB).
                </AlertDescription>
              </Alert>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Required Documents</h3>
                <div className="grid grid-cols-2 gap-4">
                  <DriverDocumentUpload
                    driverId={driverId!}
                    documentType="emirates_id_front"
                    label="Emirates ID (Front)"
                    isRequired
                    existingDocument={getDocument('emirates_id_front')}
                    onUploadComplete={loadDocuments}
                  />
                  <DriverDocumentUpload
                    driverId={driverId!}
                    documentType="emirates_id_back"
                    label="Emirates ID (Back)"
                    isRequired
                    existingDocument={getDocument('emirates_id_back')}
                    onUploadComplete={loadDocuments}
                  />
                  <DriverDocumentUpload
                    driverId={driverId!}
                    documentType="driving_license_front"
                    label="Driving License (Front)"
                    isRequired
                    existingDocument={getDocument('driving_license_front')}
                    expiryDate={formData.license_expiry}
                    onUploadComplete={loadDocuments}
                  />
                  <DriverDocumentUpload
                    driverId={driverId!}
                    documentType="driving_license_back"
                    label="Driving License (Back)"
                    isRequired
                    existingDocument={getDocument('driving_license_back')}
                    onUploadComplete={loadDocuments}
                  />
                  <DriverDocumentUpload
                    driverId={driverId!}
                    documentType="passport_bio_page"
                    label="Passport (Bio Page)"
                    isRequired
                    existingDocument={getDocument('passport_bio_page')}
                    onUploadComplete={loadDocuments}
                  />
                  <DriverDocumentUpload
                    driverId={driverId!}
                    documentType="visa_page"
                    label="Visa Page"
                    isRequired={false}
                    existingDocument={getDocument('visa_page')}
                    expiryDate={formData.visa_expiry}
                    onUploadComplete={loadDocuments}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Driver'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
