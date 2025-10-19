import { Card, CardContent } from '@/components/ui/card';
import { Package, Car, Hash, CheckCircle } from 'lucide-react';

interface ReservationTypeSelectorProps {
  selectedType: 'vehicle_class' | 'make_model' | 'specific_vin' | null;
  onTypeSelect: (type: 'vehicle_class' | 'make_model' | 'specific_vin') => void;
}

const ReservationTypeSelector = ({ selectedType, onTypeSelect }: ReservationTypeSelectorProps) => {
  const types = [
    {
      id: 'vehicle_class' as const,
      icon: Package,
      title: 'Vehicle Class',
      subtitle: 'Most Flexible',
      description: 'Reserve a vehicle category (Economy, SUV, Luxury, etc.). Any available vehicle in the selected class will be assigned.',
      color: 'from-[hsl(var(--chart-1))] to-[hsl(var(--chart-1))]/70',
      iconBg: 'bg-[hsl(var(--chart-1))]/10',
      iconColor: 'text-[hsl(var(--chart-1))]',
    },
    {
      id: 'make_model' as const,
      icon: Car,
      title: 'Make + Model',
      subtitle: 'Popular Choice',
      description: 'Reserve a specific make and model (e.g., Toyota Yaris). Any available vehicle of this make/model will be assigned.',
      color: 'from-[hsl(var(--chart-2))] to-[hsl(var(--chart-2))]/70',
      iconBg: 'bg-[hsl(var(--chart-2))]/10',
      iconColor: 'text-[hsl(var(--chart-2))]',
    },
    {
      id: 'specific_vin' as const,
      icon: Hash,
      title: 'Specific VIN',
      subtitle: 'Customer Requested',
      description: 'Reserve a specific vehicle by VIN or license plate. Only that exact vehicle will be assigned.',
      color: 'from-[hsl(var(--chart-3))] to-[hsl(var(--chart-3))]/70',
      iconBg: 'bg-[hsl(var(--chart-3))]/10',
      iconColor: 'text-[hsl(var(--chart-3))]',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Select Reservation Type</h2>
        <p className="text-muted-foreground">
          Choose how you want to reserve the vehicle for this booking
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {types.map((type) => {
          const IconComponent = type.icon;
          const isSelected = selectedType === type.id;
          
          return (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected
                  ? 'ring-2 ring-primary shadow-lg scale-105'
                  : 'hover:scale-102'
              }`}
              onClick={() => onTypeSelect(type.id)}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${type.iconBg}`}>
                    <IconComponent className={`h-8 w-8 ${type.iconColor}`} />
                  </div>
                  {isSelected && (
                    <CheckCircle className="h-6 w-6 text-primary" />
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {type.title}
                  </h3>
                  <p className="text-xs font-medium text-muted-foreground mb-3">
                    {type.subtitle}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {type.description}
                  </p>
                </div>
                
                <div className={`h-1 rounded-full bg-gradient-to-r ${type.color}`} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedType && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Selected:</span>{' '}
            {types.find(t => t.id === selectedType)?.title}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReservationTypeSelector;
