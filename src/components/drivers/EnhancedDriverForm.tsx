import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { DriverDocumentUpload, PendingDocument } from './DriverDocumentUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, FileText, Briefcase, Shield, Loader2, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Validation schema - all fields optional for flexible data entry
const driverSchema = z.object({
  full_name: z.string().max(100, 'Full name is too long').optional().or(z.literal('')),
  license_no: z.string().max(50, 'License number is too long').optional().or(z.literal('')),
  emirates_id: z.string().optional().or(z.literal('')).refine((val) => {
    if (!val || val === '') return true;
    return /^\d{3}-\d{4}-\d{7}-\d{1}$/.test(val);
  }, 'Invalid Emirates ID format. Use: XXX-XXXX-XXXXXXX-X'),
  passport_number: z.string().optional().or(z.literal('')),
  nationality: z.string().max(100, 'Nationality is too long').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')).refine((val) => {
    if (!val || val === '') return true;
    return /^\+971-\d{2}-\d{4}-\d{2}$/.test(val);
  }, 'Phone must be in UAE format: +971-XX-XXXX-XX'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  date_of_birth: z.string().optional(),
  license_expiry: z.string().optional().refine((date) => {
    if (!date) return true;
    return new Date(date) > new Date();
  }, 'License has expired. Please update before proceeding.'),
  license_issued_by: z.string().optional(),
  license_issue_date: z.string().optional(),
  employment_id: z.string().optional(),
  department: z.string().optional(),
  visa_expiry: z.string().optional(),
  address_emirate: z.string().optional(),
  status: z.string(),
  additional_driver_fee: z.number()
});

type DriverFormData = z.infer<typeof driverSchema>;

interface EnhancedDriverFormProps {
  open: boolean;
  onClose: () => void;
  driverId?: string;
  onSave: (driverId?: string) => void;
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
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<string>('unverified');
  const [currentDriverId, setCurrentDriverId] = useState<string | undefined>(driverId);
  const [activeTab, setActiveTab] = useState('basic');

  const form = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
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
    }
  });

  const { register, handleSubmit, formState: { errors, touchedFields }, setValue, watch, reset } = form;
  const formValues = watch();

  useEffect(() => {
    if (open) {
      setCurrentDriverId(driverId);
      setActiveTab('basic');
      setPendingDocuments([]);
      
      if (driverId) {
        loadDriverData();
        loadDocuments(driverId);
      } else {
        reset({
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
      }
    }
  }, [driverId, open, reset]);

  const loadDriverData = async () => {
    if (!driverId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', driverId)
        .single();
      
      if (error) throw error;
      if (data) {
        reset({
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

  const loadDocuments = async (dId: string) => {
    if (!dId) return;
    
    try {
      const { data, error } = await supabase
        .from('driver_documents')
        .select('*')
        .eq('driver_id', dId);
      
      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleAddPendingDocument = (doc: Omit<PendingDocument, 'id'>) => {
    const newDoc: PendingDocument = {
      ...doc,
      id: `pending-${Date.now()}-${Math.random()}`
    };
    setPendingDocuments(prev => [...prev, newDoc]);
  };

  const handleRemovePendingDocument = (id: string) => {
    setPendingDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const uploadPendingDocuments = async (driverId: string) => {
    if (pendingDocuments.length === 0) return 0;

    let successCount = 0;
    for (const doc of pendingDocuments) {
      try {
        const fileName = `${driverId}/${doc.type}_${Date.now()}_${doc.file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('driver-documents')
          .upload(fileName, doc.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('driver-documents')
          .getPublicUrl(fileName);

        const { error: dbError } = await supabase
          .from('driver_documents')
          .insert([{
            driver_id: driverId,
            document_type: doc.type as any,
            file_url: publicUrl,
            file_name: doc.file.name,
            file_size_bytes: doc.file.size,
            mime_type: doc.file.type,
            expiry_date: doc.expiryDate || null
          }]);

        if (dbError) throw dbError;
        successCount++;
      } catch (error) {
        console.error('Error uploading pending document:', error);
      }
    }

    setPendingDocuments([]);
    return successCount;
  };

  const onSubmit = async (values: DriverFormData) => {
    setSaving(true);
    try {
      const driverData = {
        full_name: values.full_name || '',
        license_no: values.license_no || '',
        emirates_id: values.emirates_id || '',
        passport_number: values.passport_number || '',
        phone: values.phone || '',
        email: values.email || '',
        date_of_birth: values.date_of_birth || null,
        nationality: values.nationality || '',
        license_expiry: values.license_expiry || null,
        visa_expiry: values.visa_expiry || null,
        license_issued_by: values.license_issued_by || '',
        license_issue_date: values.license_issue_date || null,
        employment_id: values.employment_id || '',
        department: values.department || '',
        address_emirate: values.address_emirate || '',
        additional_driver_fee: values.additional_driver_fee || 0,
        status: values.status || 'active'
      };

      if (currentDriverId) {
        const { error } = await supabase
          .from('drivers')
          .update(driverData)
          .eq('id', currentDriverId);

        if (error) throw error;

        const uploadedCount = await uploadPendingDocuments(currentDriverId);
        if (uploadedCount > 0) {
          toast.success(`Driver updated and ${uploadedCount} document(s) uploaded`);
        } else {
          toast.success('Driver updated successfully');
        }
      } else {
        const { data, error } = await supabase
          .from('drivers')
          .insert([driverData])
          .select()
          .single();

        if (error) throw error;

        const uploadedCount = await uploadPendingDocuments(data.id);
        if (uploadedCount > 0) {
          toast.success(`Driver created and ${uploadedCount} document(s) uploaded`);
        } else {
          toast.success('Driver created successfully');
        }
      }

      onSave?.();
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

  const getFieldClassName = (fieldName: keyof DriverFormData, isRequired: boolean = false) => {
    const hasError = !!errors[fieldName];
    const isTouched = touchedFields[fieldName];
    const hasValue = !!formValues[fieldName];
    
    return cn(
      'transition-all',
      hasError && isTouched && 'border-red-500 focus-visible:ring-red-500',
      !hasError && isTouched && hasValue && isRequired && 'border-green-500 focus-visible:ring-green-500'
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{driverId ? 'Edit Driver' : 'Add Driver'}</DialogTitle>
            {currentDriverId && getStatusBadge(verificationStatus)}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
                <TabsTrigger value="documents">
                  <FileText className="h-4 w-4 mr-2" />
                  Documents
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      {...register('full_name')}
                      className={getFieldClassName('full_name', true)}
                    />
                    {errors.full_name && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        {errors.full_name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license_no">License Number</Label>
                    <Input
                      id="license_no"
                      {...register('license_no')}
                      className={getFieldClassName('license_no', true)}
                    />
                    {errors.license_no && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        {errors.license_no.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      className={getFieldClassName('email')}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      {...register('date_of_birth')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license_expiry">License Expiry</Label>
                    <Input
                      id="license_expiry"
                      type="date"
                      {...register('license_expiry')}
                      className={getFieldClassName('license_expiry')}
                    />
                    {errors.license_expiry && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        {errors.license_expiry.message}
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="identity" className="space-y-4 mt-4">
                <Alert className="border-blue-500 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-900">
                    <strong>Recommended Information:</strong> For complete driver records, consider providing Emirates ID, License, and contact details.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emirates_id">Emirates ID</Label>
                    <Input
                      id="emirates_id"
                      {...register('emirates_id')}
                      placeholder="XXX-XXXX-XXXXXXX-X"
                      className={getFieldClassName('emirates_id', true)}
                    />
                    {errors.emirates_id && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        {errors.emirates_id.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passport_number">Passport Number</Label>
                    <Input
                      id="passport_number"
                      {...register('passport_number')}
                      className={getFieldClassName('passport_number', true)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      {...register('nationality')}
                      className={getFieldClassName('nationality', true)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Number</Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder="+971-XX-XXXX-XX"
                      className={getFieldClassName('phone', true)}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visa_expiry">Visa Expiry</Label>
                    <Input
                      id="visa_expiry"
                      type="date"
                      {...register('visa_expiry')}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="employment" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employment_id">Employment ID</Label>
                    <Input
                      id="employment_id"
                      {...register('employment_id')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      {...register('department')}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {!currentDriverId 
                      ? 'You can add documents now. They will be uploaded when you save the driver.'
                      : 'Add documents for this driver. All uploads are saved immediately.'}
                  </AlertDescription>
                </Alert>

                <DriverDocumentUpload
                  driverId={currentDriverId}
                  documents={documents}
                  pendingDocuments={pendingDocuments}
                  onDocumentChange={() => currentDriverId && loadDocuments(currentDriverId)}
                  onPendingDocumentAdd={handleAddPendingDocument}
                  onPendingDocumentRemove={handleRemovePendingDocument}
                />
              </TabsContent>
            </Tabs>

            <Separator className="my-4" />

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                You can navigate freely between tabs. Click "Save Driver" when ready to save your changes.
              </AlertDescription>
            </Alert>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  currentDriverId ? 'Update Driver' : 'Save Driver'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
