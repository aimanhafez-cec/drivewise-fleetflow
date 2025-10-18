import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, MapPin, Calendar, Shield, AlertTriangle, CheckCircle2, Briefcase, CreditCard, FileCheck } from 'lucide-react';
import { Driver } from '@/hooks/useDrivers';
import { getDriverAgeWarning, getLicenseExpiryWarning } from '@/hooks/useDrivers';
import { format } from 'date-fns';

interface DriverDetailsDisplayProps {
  driver: Driver;
  context?: 'assignment' | 'profile' | 'full';
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

export const DriverDetailsDisplay: React.FC<DriverDetailsDisplayProps> = ({ driver, context = 'full' }) => {
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
    <div className="space-y-4 overflow-y-auto pr-2">
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

      {/* Driver Header - Compact */}
      <div className="flex items-start gap-3 pb-3 border-b">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold">{driver.full_name}</h3>
            <span className="text-xl">{getNationalityFlag(driver.nationality)}</span>
            <span className="text-sm text-muted-foreground">{driver.nationality}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {driver.emirates_id && (
              <span className="font-mono">{driver.emirates_id}</span>
            )}
            {driver.passport_number && (
              <span className="font-mono">• {driver.passport_number}</span>
            )}
          </div>
        </div>
        {getVerificationBadge()}
      </div>

      {/* Contact - Compact Inline */}
      <div className="bg-muted/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Contact</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            {driver.phone ? (
              <a href={`tel:${driver.phone}`} className="text-primary hover:underline">
                {driver.phone}
              </a>
            ) : (
              <span className="text-muted-foreground">No phone</span>
            )}
          </div>
          <div className="truncate">
            {driver.email ? (
              <a href={`mailto:${driver.email}`} className="text-primary hover:underline">
                {driver.email}
              </a>
            ) : (
              <span className="text-muted-foreground">No email</span>
            )}
          </div>
        </div>
        {driver.address_emirate && (
          <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {driver.address_emirate}
          </div>
        )}
      </div>

      {/* License - Compact */}
      <div className="bg-muted/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Driving License</span>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Number</label>
              <p className="text-sm font-mono">{driver.license_no || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Authority</label>
              <p className="text-sm">{driver.license_issued_by || 'N/A'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Issued</label>
              <p className="text-sm">
                {driver.license_issue_date 
                  ? format(new Date(driver.license_issue_date), 'dd MMM yyyy')
                  : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Expires</label>
              <p className="text-sm flex items-center gap-2">
                {driver.license_expiry 
                  ? format(new Date(driver.license_expiry), 'dd MMM yyyy')
                  : 'N/A'}
                {licenseWarning && (
                  <AlertTriangle className="h-3 w-3 text-yellow-600" />
                )}
              </p>
            </div>
          </div>
          {driver.license_categories && driver.license_categories.length > 0 && (
            <div>
              <label className="text-xs text-muted-foreground">Categories</label>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {driver.license_categories.map((cat, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs px-1.5 py-0">{cat}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Info */}
      {driver.date_of_birth && (
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">Personal Details</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Date of Birth</label>
              <p className="text-sm">
                {format(new Date(driver.date_of_birth), 'dd MMM yyyy')}
                {age && <span className="text-muted-foreground ml-1">({age} yrs)</span>}
              </p>
            </div>
            {driver.visa_expiry && (
              <div>
                <label className="text-xs text-muted-foreground">Visa Expiry</label>
                <p className="text-sm flex items-center gap-2">
                  {format(new Date(driver.visa_expiry), 'dd MMM yyyy')}
                  {new Date(driver.visa_expiry) < new Date() && (
                    <Badge variant="destructive" className="text-xs">Expired</Badge>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Employment */}
      {(driver.employment_id || driver.department) && (
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">Employment</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {driver.employment_id && (
              <div>
                <label className="text-xs text-muted-foreground">Employee ID</label>
                <p className="text-sm font-mono">{driver.employment_id}</p>
              </div>
            )}
            {driver.department && (
              <div>
                <label className="text-xs text-muted-foreground">Department</label>
                <p className="text-sm">{driver.department}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Verification Details */}
      {(driver.verified_at || driver.rejection_reason || driver.last_verification_check) && (
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">Verification Details</span>
          </div>
          <div className="space-y-2">
            {driver.verified_at && (
              <div>
                <label className="text-xs text-muted-foreground">Verified On</label>
                <p className="text-sm">{format(new Date(driver.verified_at), 'dd MMM yyyy HH:mm')}</p>
              </div>
            )}
            {driver.rejection_reason && (
              <Alert variant="destructive" className="py-2">
                <AlertTriangle className="h-3 w-3" />
                <AlertDescription className="text-xs">
                  <strong>Rejection:</strong> {driver.rejection_reason}
                </AlertDescription>
              </Alert>
            )}
            {driver.last_verification_check && (
              <div>
                <label className="text-xs text-muted-foreground">Last Check</label>
                <p className="text-sm">{format(new Date(driver.last_verification_check), 'dd MMM yyyy')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};