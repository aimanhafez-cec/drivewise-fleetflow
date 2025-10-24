import HubCard from '@/components/navigation/HubCard';
import { FileText, Plus, Crown, UserCheck, CalendarClock, Receipt } from 'lucide-react';

const ExecutiveTransportationHub = () => {
  const executiveCards = [
    {
      title: 'Manage Service Contracts',
      icon: FileText,
      gradient: 'from-purple-500/10 to-pink-500/10',
      disabled: true,
    },
    {
      title: 'New Service Contract',
      icon: Plus,
      gradient: 'from-blue-500/10 to-cyan-500/10',
      disabled: true,
    },
    {
      title: 'Executive Fleet',
      icon: Crown,
      gradient: 'from-amber-500/10 to-yellow-500/10',
      disabled: true,
    },
    {
      title: 'Chauffeur Management',
      icon: UserCheck,
      gradient: 'from-emerald-500/10 to-teal-500/10',
      disabled: true,
    },
    {
      title: 'Service Requests',
      icon: CalendarClock,
      gradient: 'from-indigo-500/10 to-violet-500/10',
      disabled: true,
    },
    {
      title: 'Service Billing',
      icon: Receipt,
      gradient: 'from-rose-500/10 to-red-500/10',
      disabled: true,
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
            gradient={card.gradient}
            disabled={card.disabled}
          />
        ))}
      </div>
    </div>
  );
};

export default ExecutiveTransportationHub;
