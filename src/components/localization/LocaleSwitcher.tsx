import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Calendar } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

export const LocaleSwitcher = () => {
  const { locale, setLocale, calendarType, setCalendarType } = useLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Language / اللغة</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setLocale('en')} className="cursor-pointer">
          <span className={locale === 'en' ? 'font-bold' : ''}>
            🇬🇧 English
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale('ar')} className="cursor-pointer">
          <span className={locale === 'ar' ? 'font-bold' : ''}>
            🇦🇪 العربية (Arabic)
          </span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Calendar Type
        </DropdownMenuLabel>
        <DropdownMenuItem 
          onClick={() => setCalendarType('gregorian')} 
          className="cursor-pointer"
        >
          <span className={calendarType === 'gregorian' ? 'font-bold' : ''}>
            Gregorian / ميلادي
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setCalendarType('hijri')} 
          className="cursor-pointer"
        >
          <span className={calendarType === 'hijri' ? 'font-bold' : ''}>
            Hijri / هجري
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
