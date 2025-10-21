import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BLACK_POINTS_THRESHOLDS,
  checkLicenseSuspension,
} from '@/lib/constants/uae-compliance';

interface BlackPointsTrackerProps {
  blackPoints: number;
  driverName?: string;
  licenseNumber?: string;
  showArabic?: boolean;
}

export const BlackPointsTracker: React.FC<BlackPointsTrackerProps> = ({
  blackPoints,
  driverName,
  licenseNumber,
  showArabic = false,
}) => {
  const suspensionStatus = checkLicenseSuspension(blackPoints);
  const maxPoints = BLACK_POINTS_THRESHOLDS.license_cancellation;
  const percentage = (blackPoints / maxPoints) * 100;

  const getStatusColor = () => {
    if (blackPoints >= BLACK_POINTS_THRESHOLDS.suspension_3_months) {
      return 'destructive';
    }
    if (blackPoints >= BLACK_POINTS_THRESHOLDS.warning) {
      return 'warning';
    }
    return 'default';
  };

  const getProgressColor = () => {
    if (blackPoints >= BLACK_POINTS_THRESHOLDS.suspension_3_months) {
      return 'bg-destructive';
    }
    if (blackPoints >= BLACK_POINTS_THRESHOLDS.warning) {
      return 'bg-yellow-500';
    }
    return 'bg-green-500';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Black Points Tracker</CardTitle>
            {showArabic && (
              <CardDescription className="text-right" dir="rtl">
                متتبع النقاط السوداء
              </CardDescription>
            )}
            {driverName && (
              <CardDescription>
                {driverName}
                {licenseNumber && ` (${licenseNumber})`}
              </CardDescription>
            )}
          </div>
          {suspensionStatus.suspended ? (
            <XCircle className="h-8 w-8 text-destructive" />
          ) : blackPoints >= BLACK_POINTS_THRESHOLDS.warning ? (
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          ) : (
            <CheckCircle className="h-8 w-8 text-green-500" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Points Display */}
        <div className="text-center">
          <div className="text-5xl font-bold">{blackPoints}</div>
          <div className="text-sm text-muted-foreground">
            Black Points / {maxPoints} max
          </div>
          {showArabic && (
            <div className="text-sm text-muted-foreground" dir="rtl">
              نقطة سوداء
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={percentage} className={getProgressColor()} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span className="text-yellow-600">{BLACK_POINTS_THRESHOLDS.warning}</span>
            <span className="text-destructive">
              {BLACK_POINTS_THRESHOLDS.suspension_3_months}
            </span>
            <span className="text-destructive">
              {BLACK_POINTS_THRESHOLDS.suspension_6_months}
            </span>
            <span className="text-destructive">{maxPoints}</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge variant={getStatusColor() as any} className="text-base px-4 py-2">
            {suspensionStatus.suspended ? (
              <>
                {showArabic ? suspensionStatus.reason_ar : suspensionStatus.reason}
              </>
            ) : blackPoints >= BLACK_POINTS_THRESHOLDS.warning ? (
              <>
                {showArabic
                  ? 'تحذير - اقتراب من التعليق'
                  : 'Warning - Approaching Suspension'}
              </>
            ) : (
              <>{showArabic ? 'حالة جيدة' : 'Good Standing'}</>
            )}
          </Badge>
        </div>

        {/* Suspension Details */}
        {suspensionStatus.suspended && suspensionStatus.duration && (
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4 space-y-2">
            <p className="font-medium text-destructive">
              License Suspended
              {showArabic && <span dir="rtl" className="block">رخصة معلقة</span>}
            </p>
            <p className="text-sm">
              Duration: {suspensionStatus.duration}
              {showArabic && <span dir="rtl" className="block">المدة</span>}
            </p>
          </div>
        )}

        {/* Thresholds Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Warning Level:</span>
            <span className="font-medium">{BLACK_POINTS_THRESHOLDS.warning} points</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">3-Month Suspension:</span>
            <span className="font-medium">
              {BLACK_POINTS_THRESHOLDS.suspension_3_months} points
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">6-Month Suspension:</span>
            <span className="font-medium">
              {BLACK_POINTS_THRESHOLDS.suspension_6_months} points
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">License Cancellation:</span>
            <span className="font-medium">
              {BLACK_POINTS_THRESHOLDS.license_cancellation}+ points
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
