import { useNavigate } from 'react-router-dom';
import HubCard from '@/components/navigation/HubCard';
import { FileText, Plus, Crown, UserCheck, CalendarClock, Receipt } from 'lucide-react';

const ExecutiveTransportationHub = () => {
  const navigate = useNavigate();

  const executiveCards = [
    {
      title: 'Manage Service Contracts',
      icon: FileText,
      route: '/executive-transportation/manage',
      gradient: 'from-purple-500/10 to-pink-500/10',
    },
    {
      title: 'New Service Contract',
      icon: Plus,
      route: '/executive-transportation/new',
      gradient: 'from-blue-500/10 to-cyan-500/10',
    },
    {
      title: 'Executive Fleet',
      icon: Crown,
      route: '/executive-transportation/fleet',
      gradient: 'from-amber-500/10 to-yellow-500/10',
    },
    {
      title: 'Chauffeur Management',
      icon: UserCheck,
      route: '/executive-transportation/chauffeurs',
      gradient: 'from-emerald-500/10 to-teal-500/10',
    },
    {
      title: 'Service Requests',
      icon: CalendarClock,
      route: '/executive-transportation/requests',
      gradient: 'from-indigo-500/10 to-violet-500/10',
    },
    {
      title: 'Service Billing',
      icon: Receipt,
      route: '/executive-transportation/billing',
      gradient: 'from-rose-500/10 to-red-500/10',
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Executive Transportation</h1>
        <p className="text-muted-foreground text-lg">
          Manage executive transportation services including limousine and chauffeur operations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {executiveCards.map((card) => (
          <HubCard
            key={card.title}
            title={card.title}
            icon={card.icon}
            onClick={() => navigate(card.route)}
            gradient={card.gradient}
          />
        ))}
      </div>
    </div>
  );
};

export default ExecutiveTransportationHub;
