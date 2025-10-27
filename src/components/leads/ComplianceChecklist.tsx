import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertTriangle, Shield } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { getApplicableRules, validateCompliance } from '@/data/uaeCompliance';

interface ComplianceChecklistProps {
  customerType: 'uae_resident' | 'tourist' | 'gcc_resident';
  customerAge: number;
  licenseValidityMonths: number;
  rentalDurationDays: number;
  vehicleCategory: string;
}

export const ComplianceChecklist = ({
  customerType,
  customerAge,
  licenseValidityMonths,
  rentalDurationDays,
  vehicleCategory,
}: ComplianceChecklistProps) => {
  const { locale } = useLocale();
  
  const applicableRules = getApplicableRules(customerType);
  const validation = validateCompliance(
    customerType,
    customerAge,
    licenseValidityMonths,
    rentalDurationDays,
    vehicleCategory
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {locale === 'ar' ? 'متطلبات الامتثال للإمارات' : 'UAE Compliance Requirements'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Validation Alerts */}
        {validation.violations.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>
                {locale === 'ar' ? 'مخالفات الامتثال:' : 'Compliance Violations:'}
              </strong>
              <ul className="list-disc list-inside mt-2">
                {validation.violations.map((violation, idx) => (
                  <li key={idx}>{violation}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {validation.warnings.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>
                {locale === 'ar' ? 'تحذيرات:' : 'Warnings:'}
              </strong>
              <ul className="list-disc list-inside mt-2">
                {validation.warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Compliance Rules Checklist */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">
            {locale === 'ar' ? 'قائمة التحقق من المتطلبات:' : 'Requirements Checklist:'}
          </h4>
          {applicableRules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
            >
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm">
                    {locale === 'ar' ? rule.name_ar : rule.name_en}
                  </p>
                  {rule.required && (
                    <Badge variant="destructive" className="text-xs">
                      {locale === 'ar' ? 'مطلوب' : 'Required'}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {locale === 'ar' ? rule.description_ar : rule.description_en}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Validation Status */}
        <div className={`p-4 rounded-lg border-2 ${
          validation.valid 
            ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
            : 'border-red-500 bg-red-50 dark:bg-red-950/20'
        }`}>
          <div className="flex items-center gap-2">
            {validation.valid ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <p className="font-semibold">
              {validation.valid
                ? locale === 'ar' 
                  ? '✅ جميع متطلبات الامتثال مستوفاة' 
                  : '✅ All Compliance Requirements Met'
                : locale === 'ar'
                  ? '❌ يرجى حل مشكلات الامتثال قبل المتابعة'
                  : '❌ Please Resolve Compliance Issues Before Proceeding'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
