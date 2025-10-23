import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Users } from 'lucide-react';
import HubCard from '@/components/navigation/HubCard';

const CorporateLeasingOperationsHub: React.FC = () => {
  const navigate = useNavigate();

  const operationsCards = [
    {
      title: 'Agreement/Contract VIN Assignment',
      description: 'Assign specific vehicles (VINs) to corporate leasing agreements and manage vehicle allocations',
      icon: Car,
      route: '/corporate-leasing-operations/vin-assignment',
      gradient: 'from-blue-500/10 to-indigo-500/10',
    },
    {
      title: 'Corporate Drivers Assignment',
      description: 'Manage and assign authorized drivers to corporate leasing agreements and track driver information',
      icon: Users,
      route: '/corporate-leasing-operations/drivers-assignment',
      gradient: 'from-green-500/10 to-emerald-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Corporate Leasing Operations</h1>
        <p className="text-muted-foreground mt-2">
          Manage vehicle assignments and driver allocations for corporate leasing agreements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {operationsCards.map((card) => (
          <HubCard
            key={card.route}
            title={card.title}
            description={card.description}
            icon={card.icon}
            onClick={() => navigate(card.route)}
            gradient={card.gradient}
          />
        ))}
      </div>
    </div>
  );
};

export default CorporateLeasingOperationsHub;
