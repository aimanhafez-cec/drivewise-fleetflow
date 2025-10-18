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
import { DriverDocumentUpload } from './DriverDocumentUpload';
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
  const [verificationStatus, setVerificationStatus] = useState<string>('unverified');
  const [currentDriverId, setCurrentDriverId] = useState<string | undefined>(driverId);
  const [activeTab, setActiveTab] = useState('basic');
  const [hasAutoSaved, setHasAutoSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    setValue,
    watch,
    reset,
    trigger
  } = useForm<DriverFormData>({
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

  const formValues = watch();

  useEffect(() => {
    if (open) {
      setCurrentDriverId(driverId);
      setHasAutoSaved(!!driverId);
      setActiveTab('basic');
      
      if (driverId) {
        loadDriverData();
        loadDocuments();
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

  useEffect(() => {
    if (currentDriverId) {
      loadDocuments();
    }
  }, [currentDriverId]);

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

  const loadDocuments = async () => {
    if (!currentDriverId) return;
    
    try {
      const { data, error } = await supabase
        .from('driver_documents')
        .select('*')
        .eq('driver_id', currentDriverId);
      
      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  // Allow free tab navigation without validation
  const handleTabChange = async (newTab: string) => {
    setActiveTab(newTab);
    
    // Optional: Show a gentle reminder about saving (non-blocking)
    if (newTab === 'documents' && !currentDriverId) {
      toast.info('Tip: Save the driver first to enable document uploads', {
        duration: 3000
      });
    }
  };

  const handleAutoSave = async () => {
    const formData = watch();
    
    try {
      // Ensure empty strings instead of undefined for optional fields
      const driverData = {
        full_name: formData.full_name || '',
        license_no: formData.license_no || '',
        emirates_id: formData.emirates_id || '',
        passport_number: formData.passport_number || '',
        nationality: formData.nationality || '',
        phone: formData.phone || '',
        email: formData.email || '',
        date_of_birth: formData.date_of_birth || '',
        license_expiry: formData.license_expiry || '',
        license_issued_by: formData.license_issued_by || '',
        license_issue_date: formData.license_issue_date || '',
        employment_id: formData.employment_id || '',
        department: formData.department || '',
        visa_expiry: formData.visa_expiry || '',
        address_emirate: formData.address_emirate || '',
        status: formData.status,
        additional_driver_fee: formData.additional_driver_fee
      };

      const { data, error } = await supabase
        .from('drivers')
        .insert([driverData])
        .select('id')
        .single();
      
      if (error) throw error;
      
      setCurrentDriverId(data.id);
      setHasAutoSaved(true);
      toast.success('Driver saved! You can now upload documents.');
      
      // Automatically switch to documents tab
      setTimeout(() => setActiveTab('documents'), 500);
    } catch (error: any) {
      console.error('Error auto-saving driver:', error);
      toast.error('Failed to save driver: ' + error.message);
      throw error;
    }
  };

  const onSubmit = async (data: DriverFormData) => {
    setSaving(true);
    try {
      // Ensure empty strings instead of undefined for optional fields
      const driverData = {
        full_name: data.full_name || '',
        license_no: data.license_no || '',
        emirates_id: data.emirates_id || '',
        passport_number: data.passport_number || '',
        nationality: data.nationality || '',
        phone: data.phone || '',
        email: data.email || '',
        date_of_birth: data.date_of_birth || '',
        license_expiry: data.license_expiry || '',
        license_issued_by: data.license_issued_by || '',
        license_issue_date: data.license_issue_date || '',
        employment_id: data.employment_id || '',
        department: data.department || '',
        visa_expiry: data.visa_expiry || '',
        address_emirate: data.address_emirate || '',
        status: data.status,
        additional_driver_fee: data.additional_driver_fee
      };

      let savedDriverId = currentDriverId;
      
      if (currentDriverId) {
        const { error } = await supabase
          .from('drivers')
          .update(driverData)
          .eq('id', currentDriverId);
        
        if (error) throw error;
        toast.success('Driver updated successfully');
      } else {
        const { data: newDriver, error } = await supabase
          .from('drivers')
          .insert([driverData])
          .select('id')
          .single();
        
        if (error) throw error;
        savedDriverId = newDriver.id;
        toast.success('Driver created successfully');
      }
      
      onSave(savedDriverId);
      onClose();
    } catch (error: any) {
      console.error('Error saving driver:', error);
      toast.error('Failed to save driver: ' + error.message);
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

  const getRequiredDocuments = () => {
    // All documents are optional for flexible data entry
    return [
      { type: 'emirates_id_front', label: 'Emirates ID (Front)', required: false },
      { type: 'emirates_id_back', label: 'Emirates ID (Back)', required: false },
      { type: 'driving_license_front', label: 'Driving License (Front)', required: false },
      { type: 'driving_license_back', label: 'Driving License (Back)', required: false },
      { type: 'passport_bio_page', label: 'Passport (Bio Page)', required: false },
      { type: 'visa_page', label: 'Visa Page', required: false }
    ];
  };

  const allDocumentsUploaded = getRequiredDocuments()
    .filter(doc => doc.required)
    .every(doc => !!getDocument(doc.type));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{driverId ? 'Edit Driver' : 'Add Driver'}</DialogTitle>
            {currentDriverId && getStatusBadge(verificationStatus)}
          </div>
        </DialogHeader>

        {/* Demo Mode Banner */}
        {process.env.NODE_ENV === 'development' && (
          <Alert className="border-blue-500 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <strong className="text-blue-900">Demo Mode:</strong> Document validations are relaxed for demonstration. 
              In production, all driver documents must be verified before vehicle handover.
            </AlertDescription>
          </Alert>
        )}

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
                  {(errors.emirates_id || errors.passport_number || errors.nationality || errors.phone) && (
                    <AlertTriangle className="h-3 w-3 ml-1 text-red-500" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="employment">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Employment
                </TabsTrigger>
                <TabsTrigger value="documents">
                  <FileText className="h-4 w-4 mr-2" />
                  Documents
                  {!allDocumentsUploaded && (
                    <AlertTriangle className="h-3 w-3 ml-1 text-amber-500" />
                  )}
                  {allDocumentsUploaded && currentDriverId && (
                    <CheckCircle2 className="h-3 w-3 ml-1 text-green-500" />
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">
                      Full Name
                    </Label>
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
                    <Label htmlFor="license_no">
                      License Number
                    </Label>
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
                    <Label htmlFor="emirates_id">
                      Emirates ID
                    </Label>
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
                    {!errors.emirates_id && touchedFields.emirates_id && formValues.emirates_id && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Valid Emirates ID format
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passport_number">
                      Passport Number
                    </Label>
                    <Input
                      id="passport_number"
                      placeholder="e.g., N1234567"
                      {...register('passport_number')}
                      className={getFieldClassName('passport_number', false)}
                    />
                    {errors.passport_number && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        {errors.passport_number.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">
                      Nationality
                    </Label>
                    <Input
                      id="nationality"
                      {...register('nationality')}
                      placeholder="e.g., United Arab Emirates"
                      className={getFieldClassName('nationality', true)}
                    />
                    {errors.nationality && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        {errors.nationality.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Mobile Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...register('phone')}
                      placeholder="+971-50-1234-56"
                      className={getFieldClassName('phone', true)}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        {errors.phone.message}
                      </p>
                    )}
                    {!errors.phone && touchedFields.phone && formValues.phone && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Valid UAE phone format
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license_issued_by">License Issued By</Label>
                    <Select 
                      value={formValues.license_issued_by} 
                      onValueChange={(value) => setValue('license_issued_by', value)}
                    >
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
                      {...register('license_issue_date')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visa_expiry">Visa Expiry</Label>
                    <Input
                      id="visa_expiry"
                      type="date"
                      {...register('visa_expiry')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address_emirate">Address Emirate</Label>
                    <Select 
                      value={formValues.address_emirate} 
                      onValueChange={(value) => setValue('address_emirate', value)}
                    >
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

                <Alert className="border-blue-500 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-900">
                    You can navigate freely between tabs. Click "Save Driver" when ready to save your changes.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="employment" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employment_id">Employee ID / Badge Number</Label>
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

              <TabsContent value="documents" className="space-y-4 mt-4">
                {!currentDriverId && (
                  <Alert className="border-blue-500 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-900">
                      <strong>Tip:</strong> Save the driver first using the "Save Driver" button below to enable document uploads.
                      Documents will be attached to the driver record once saved.
                    </AlertDescription>
                  </Alert>
                )}
                
                {process.env.NODE_ENV === 'development' && currentDriverId && (
                  <Alert className="border-blue-500 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-900">
                      <strong>Recommended Documents:</strong>
                      <ul className="mt-2 list-disc list-inside text-sm space-y-1">
                        <li>Emirates ID (optional)</li>
                        <li>UAE Driving License (optional)</li>
                        <li>Passport (optional)</li>
                        <li>Visa page (optional)</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {currentDriverId && (
                  <>
                    {/* Document Checklist - Informational */}
                    <Alert className="border-blue-500 bg-blue-50">
                      <AlertDescription>
                        <div className="space-y-2">
                          <strong className="text-blue-900">
                            Document Checklist (Optional):
                          </strong>
                          <ul className="mt-2 space-y-1 text-sm">
                            {getRequiredDocuments().map(doc => {
                              const hasDoc = !!getDocument(doc.type);
                              return (
                                <li key={doc.type} className={hasDoc ? "text-blue-600" : "text-gray-500"}>
                                  {hasDoc ? "✓" : "○"} {doc.label}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-semibold">Upload Documents</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getRequiredDocuments().map((doc) => (
                          <DriverDocumentUpload
                            key={doc.type}
                            driverId={currentDriverId || ''}
                            documentType={doc.type}
                            label={doc.label}
                            isRequired={doc.required}
                            existingDocument={getDocument(doc.type)}
                            expiryDate={doc.type.includes('license') ? formValues.license_expiry : doc.type === 'visa_page' ? formValues.visa_expiry : undefined}
                            onUploadComplete={loadDocuments}
                          />
                        ))}
                      </div>
                      
                      <div className="mt-4 p-4 border border-dashed rounded-lg">
                        <h4 className="text-sm font-medium mb-3">Upload Additional Documents</h4>
                        <DriverDocumentUpload
                          driverId={currentDriverId}
                          documentType="other"
                          label="Other Document"
                          isRequired={false}
                          onUploadComplete={loadDocuments}
                          allowCustomType={true}
                        />
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {currentDriverId ? 'Update Driver' : 'Save Driver'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};