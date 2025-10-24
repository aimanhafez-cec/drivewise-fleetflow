import { useNavigate } from 'react-router-dom';
import HubCard from '@/components/navigation/HubCard';
import { FileText, Plus, Crown, UserCheck, CalendarClock, Receipt } from 'lucide-react';

const LimousineAgreementsHub = () => {
  const navigate = useNavigate();

  const limousineCards = [
    {
      title: 'Manage Limousine Agreements',
      icon: FileText,
      route: '/limousine-agreements/manage',
      gradient: 'from-purple-500/10 to-pink-500/10',
    },
    {
      title: 'New Limousine Agreement',
      icon: Plus,
      route: '/limousine-agreements/new',
      gradient: 'from-blue-500/10 to-cyan-500/10',
    },
    {
      title: 'Limousine Fleet',
      icon: Crown,
      route: '/limousine-agreements/fleet',
      gradient: 'from-amber-500/10 to-yellow-500/10',
    },
    {
      title: 'Chauffeur Management',
      icon: UserCheck,
      route: '/limousine-agreements/chauffeurs',
      gradient: 'from-emerald-500/10 to-teal-500/10',
    },
    {
      title: 'Service Requests',
      icon: CalendarClock,
      route: '/limousine-agreements/requests',
      gradient: 'from-indigo-500/10 to-violet-500/10',
    },
    {
      title: 'Premium Billing',
      icon: Receipt,
      route: '/limousine-agreements/billing',
      gradient: 'from-rose-500/10 to-red-500/10',
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Limousine Agreements</h1>
        <p className="text-muted-foreground text-lg">
          Manage premium limousine service agreements and operations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {limousineCards.map((card) => (
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

export default LimousineAgreementsHub;
