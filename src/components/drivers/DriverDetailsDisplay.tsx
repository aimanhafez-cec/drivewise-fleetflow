import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, MapPin, Calendar, Shield, FileCheck, AlertTriangle, CheckCircle2, Briefcase, CreditCard, Globe } from 'lucide-react';
import { Driver } from '@/hooks/useDrivers';
import { getDriverAgeWarning, getLicenseExpiryWarning } from '@/hooks/useDrivers';
import { format } from 'date-fns';

interface DriverDetailsDisplayProps {
  driver: Driver;
}

const getNationalityFlag = (nationality?: string): string => {
  const flagMap: Record<string, string> = {
    'UAE': '🇦🇪', 'Emirati': '🇦🇪',
    'Saudi Arabia': '🇸🇦', 'Saudi': '🇸🇦',
    'Egypt': '🇪🇬', 'Egyptian': '🇪🇬',
    'India': '🇮🇳', 'Indian': '🇮🇳',
    'Pakistan': '🇵🇰', 'Pakistani': '🇵🇰',
    'Bangladesh': '🇧🇩', 'Bangladeshi': '🇧🇩',
    'Philippines': '🇵🇭', 'Filipino': '🇵🇭',
    'UK': '🇬🇧', 'British': '🇬🇧',
    'USA': '🇺🇸', 'American': '🇺🇸',
    'Jordan': '🇯🇴', 'Jordanian': '🇯🇴',
    'Lebanon': '🇱🇧', 'Lebanese': '🇱🇧',
    'Syria': '🇸🇾', 'Syrian': '🇸🇾',
  };
  
  return flagMap[nationality || ''] || '🌍';
};

const calculateAge = (dateOfBirth?: string): number | null => {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

export const DriverDetailsDisplay: React.FC<DriverDetailsDisplayProps> = ({ driver }) => {
  const age = calculateAge(driver.date_of_birth);
  const ageWarning = getDriverAgeWarning(driver.date_of_birth);
  const licenseWarning = getLicenseExpiryWarning(driver.license_expiry);
  
  const getVerificationBadge = () => {
    const status = driver.verification_status;
    if (!status || status === 'unverified') {
      return <Badge variant="destructive"><Shield className="h-3 w-3 mr-1" />Unverified</Badge>;
    } else if (status === 'pending_docs') {
      return <Badge variant="secondary"><FileCheck className="h-3 w-3 mr-1" />Pending Documents</Badge>;
    } else if (status === 'verified' || status === 'approved') {
      return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Verified</Badge>;
    } else if (status === 'rejected') {
      return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Rejected</Badge>;
    } else if (status === 'expired') {
      return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Expired</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
      {/* Warnings */}
      {(ageWarning || licenseWarning) && (
        <Alert variant="default" className="border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-900">
            <ul className="list-disc list-inside space-y-1">
              {ageWarning && <li>{ageWarning}</li>}
              {licenseWarning && <li>{licenseWarning}</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Identity Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Identity Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Full Name</label>
              <p className="text-sm font-medium">{driver.full_name}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nationality</label>
              <p className="text-sm flex items-center gap-1">
                <span className="text-lg">{getNationalityFlag(driver.nationality)}</span>
                {driver.nationality || 'N/A'}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Emirates ID</label>
              <p className="text-sm font-mono">{driver.emirates_id || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Passport Number</label>
              <p className="text-sm font-mono">{driver.passport_number || 'N/A'}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Date of Birth</label>
              <p className="text-sm">
                {driver.date_of_birth 
                  ? format(new Date(driver.date_of_birth), 'dd MMM yyyy')
                  : 'N/A'}
                {age && <span className="text-muted-foreground ml-2">({age} years old)</span>}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Address Emirate</label>
              <p className="text-sm">{driver.address_emirate || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* License Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Driving License
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">License Number</label>
              <p className="text-sm font-mono">{driver.license_no || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Issued By</label>
              <p className="text-sm">{driver.license_issued_by || 'N/A'}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Issue Date</label>
              <p className="text-sm">
                {driver.license_issue_date 
                  ? format(new Date(driver.license_issue_date), 'dd MMM yyyy')
                  : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Expiry Date</label>
              <p className="text-sm flex items-center gap-2">
                {driver.license_expiry 
                  ? format(new Date(driver.license_expiry), 'dd MMM yyyy')
                  : 'N/A'}
                {licenseWarning && (
                  <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700">
                    <AlertTriangle className="h-3 w-3" />
                  </Badge>
                )}
              </p>
            </div>
          </div>

          {driver.license_categories && driver.license_categories.length > 0 && (
            <>
              <Separator />
              <div>
                <label className="text-xs font-medium text-muted-foreground">License Categories</label>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {driver.license_categories.map((cat, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">{cat}</Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {driver.visa_expiry && (
            <>
              <Separator />
              <div>
                <label className="text-xs font-medium text-muted-foreground">Visa Expiry</label>
                <p className="text-sm">
                  {format(new Date(driver.visa_expiry), 'dd MMM yyyy')}
                  {new Date(driver.visa_expiry) < new Date() && (
                    <Badge variant="destructive" className="ml-2 text-xs">Expired</Badge>
                  )}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Contact Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Phone</label>
              <p className="text-sm">
                {driver.phone ? (
                  <a href={`tel:${driver.phone}`} className="text-primary hover:underline">
                    {driver.phone}
                  </a>
                ) : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <p className="text-sm">
                {driver.email ? (
                  <a href={`mailto:${driver.email}`} className="text-primary hover:underline truncate block">
                    {driver.email}
                  </a>
                ) : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employment Section */}
      {(driver.employment_id || driver.department) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Employment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {driver.employment_id && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Employment ID</label>
                  <p className="text-sm font-mono">{driver.employment_id}</p>
                </div>
              )}
              {driver.department && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Department</label>
                  <p className="text-sm">{driver.department}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-muted-foreground">Status:</label>
            {getVerificationBadge()}
          </div>

          {driver.verified_at && (
            <>
              <Separator />
              <div>
                <label className="text-xs font-medium text-muted-foreground">Verified On</label>
                <p className="text-sm">{format(new Date(driver.verified_at), 'dd MMM yyyy HH:mm')}</p>
              </div>
            </>
          )}

          {driver.rejection_reason && (
            <>
              <Separator />
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Rejection Reason:</strong> {driver.rejection_reason}
                </AlertDescription>
              </Alert>
            </>
          )}

          {driver.last_verification_check && (
            <>
              <Separator />
              <div>
                <label className="text-xs font-medium text-muted-foreground">Last Check</label>
                <p className="text-sm">{format(new Date(driver.last_verification_check), 'dd MMM yyyy HH:mm')}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Additional Fee */}
      {driver.additional_driver_fee > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Additional Driver Fee</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              AED {driver.additional_driver_fee.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {ageWarning ? 'Applied for drivers under 25' : 'Per agreement terms'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
