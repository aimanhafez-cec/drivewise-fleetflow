import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Settings2 } from 'lucide-react';
import HubCard from '@/components/navigation/HubCard';

const OperationsHub: React.FC = () => {
  const navigate = useNavigate();

  const operationCards = [
    {
      title: 'Manage Replacement',
      description: 'Track and manage vehicle replacements, swap schedules, and fleet rotations',
      icon: RefreshCw,
      route: '/operations/replacement',
      gradient: 'from-purple-500/10 to-pink-500/10',
    },
    {
      title: 'Maintenance',
      description: 'Schedule and track vehicle maintenance, repairs, and service records',
      icon: Settings2,
      route: '/operations/maintenance',
      gradient: 'from-blue-500/10 to-indigo-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Operations</h1>
        <p className="text-muted-foreground mt-2">
          Manage vehicle operations, replacements, and maintenance schedules
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {operationCards.map((card) => (
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

export default OperationsHub;
