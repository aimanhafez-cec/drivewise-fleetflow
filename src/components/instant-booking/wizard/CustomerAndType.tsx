import { Card, CardContent } from '@/components/ui/card';
import CustomerIdentification from './CustomerIdentification';
import ReservationTypeSelector from './ReservationTypeSelector';

interface CustomerAndTypeProps {
  selectedCustomerId: string;
  customerName: string;
  reservationType: 'vehicle_class' | 'make_model' | 'specific_vin' | null;
  onCustomerSelect: (customer: any) => void;
  onTypeSelect: (type: 'vehicle_class' | 'make_model' | 'specific_vin') => void;
  onAutoAdvance?: () => void;
  onBookAgain?: () => void;
  hasLastBooking?: boolean;
}

const CustomerAndType = ({
  selectedCustomerId,
  customerName,
  reservationType,
  onCustomerSelect,
  onTypeSelect,
  onAutoAdvance,
  onBookAgain,
  hasLastBooking,
}: CustomerAndTypeProps) => {
  // Auto-advance removed - allow users to use "Book Again" before proceeding

  const bothSelected = selectedCustomerId && reservationType;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Start Your Booking</h2>
        <p className="text-muted-foreground">
          Select customer and choose reservation type to continue
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Customer Search */}
        <Card className={`border-2 transition-all ${bothSelected ? 'border-primary/50' : 'border-border'}`}>
          <CardContent className="p-6">
            <CustomerIdentification
              selectedCustomerId={selectedCustomerId}
              onCustomerSelect={onCustomerSelect}
              onBookAgain={onBookAgain}
              hasLastBooking={hasLastBooking}
            />
          </CardContent>
        </Card>

        {/* Right: Reservation Type */}
        <Card className={`border-2 transition-all ${bothSelected ? 'border-primary/50' : 'border-border'}`}>
          <CardContent className="p-6">
            <ReservationTypeSelector
              selectedType={reservationType}
              onTypeSelect={onTypeSelect}
            />
          </CardContent>
        </Card>
      </div>

      {bothSelected && (
        <div className="p-4 bg-primary/10 border-2 border-primary/20 rounded-lg animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">
                ✓ Ready to proceed
              </p>
              <p className="text-sm text-muted-foreground">
                Customer: {customerName} • Type: {reservationType?.replace('_', ' ')}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Click "Continue" when ready</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerAndType;
