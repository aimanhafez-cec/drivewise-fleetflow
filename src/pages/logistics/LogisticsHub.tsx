import { useNavigate } from 'react-router-dom';
import HubCard from '@/components/navigation/HubCard';
import { Truck } from 'lucide-react';

const LogisticsHub = () => {
  const navigate = useNavigate();

  const logisticsCards = [
    {
      title: 'Manage Operation Logistics Request',
      description: 'Track and manage operational logistics requests, delivery schedules, and transportation coordination',
      icon: Truck,
      route: '/logistics/manage-requests',
      gradient: 'from-blue-500/10 to-cyan-500/10',
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Logistics</h1>
        <p className="text-muted-foreground text-lg">
          Manage all logistics operations and transportation requests
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {logisticsCards.map((card) => (
          <HubCard
            key={card.title}
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

export default LogisticsHub;
