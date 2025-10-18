import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, Shield, FileCheck, AlertTriangle, CheckCircle2, Calendar } from 'lucide-react';
import { Driver } from '@/hooks/useDrivers';
import { getDriverAgeWarning, getLicenseExpiryWarning } from '@/hooks/useDrivers';
import { cn } from '@/lib/utils';

interface DriverCardProps {
  driver: Driver;
  isSelected: boolean;
  onClick: () => void;
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

const getVerificationBadge = (status?: string) => {
  if (!status || status === 'unverified') {
    return <Badge variant="destructive" className="text-xs"><Shield className="h-3 w-3 mr-1" />Unverified</Badge>;
  } else if (status === 'pending_docs') {
    return <Badge variant="secondary" className="text-xs"><FileCheck className="h-3 w-3 mr-1" />Pending</Badge>;
  } else if (status === 'verified' || status === 'approved') {
    return <Badge className="bg-green-500 text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />Verified</Badge>;
  } else if (status === 'rejected' || status === 'expired') {
    return <Badge variant="destructive" className="text-xs"><AlertTriangle className="h-3 w-3 mr-1" />{status === 'rejected' ? 'Rejected' : 'Expired'}</Badge>;
  }
  return null;
};

const maskEmiratesId = (emiratesId?: string): string => {
  if (!emiratesId) return 'N/A';
  const clean = emiratesId.replace(/\D/g, '');
  if (clean.length === 15) {
    return `${clean.slice(0, 3)}-${clean.slice(3, 7)}-xxx${clean.slice(10, 13)}-${clean.slice(13)}`;
  }
  return emiratesId;
};

export const DriverCard: React.FC<DriverCardProps> = ({ driver, isSelected, onClick }) => {
  const ageWarning = getDriverAgeWarning(driver.date_of_birth);
  const licenseWarning = getLicenseExpiryWarning(driver.license_expiry);
  const hasWarnings = ageWarning || licenseWarning;

  return (
    <Card 
      className={cn(
        "p-4 cursor-pointer transition-all hover:shadow-md",
        isSelected ? "ring-2 ring-primary bg-accent" : "hover:bg-accent/50"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Name & Nationality */}
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-sm">{driver.full_name}</h4>
            <span className="text-lg">{getNationalityFlag(driver.nationality)}</span>
            <span className="text-xs text-muted-foreground">{driver.nationality || 'N/A'}</span>
          </div>

          {/* Emirates ID */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>{maskEmiratesId(driver.emirates_id)}</span>
          </div>

          {/* License */}
          <div className="flex items-center gap-1 text-xs">
            <span className="font-medium">{driver.license_no || 'No License'}</span>
            {driver.license_expiry && (
              <span className="text-muted-foreground">
                • Exp: {new Date(driver.license_expiry).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>

          {/* Contact */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {driver.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{driver.phone}</span>
              </div>
            )}
            {driver.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span className="truncate max-w-[150px]">{driver.email}</span>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {getVerificationBadge(driver.verification_status)}
            
            {hasWarnings && (
              <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {ageWarning ? 'Under 25' : 'Expires Soon'}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
