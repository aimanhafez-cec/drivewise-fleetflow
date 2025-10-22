import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, Building2 } from 'lucide-react';
import HubCard from '@/components/navigation/HubCard';

const CorporateLeasingHub: React.FC = () => {
  const navigate = useNavigate();

  const corporateLeasingCards = [
    {
      title: 'Manage Quotations',
      description: 'Create, manage, and track quotes for corporate leasing opportunities and convert them to agreements',
      icon: FileSpreadsheet,
      route: '/corporate-leasing/quotations',
      gradient: 'from-blue-500/10 to-cyan-500/10',
    },
    {
      title: 'Master Agreements',
      description: 'Manage corporate leasing master agreements, terms, pricing, and vehicle allocations',
      icon: Building2,
      route: '/corporate-leasing/master-agreements',
      gradient: 'from-purple-500/10 to-pink-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Corporate Leasing</h1>
        <p className="text-muted-foreground mt-2">
          Manage quotations and master agreements for corporate fleet leasing
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {corporateLeasingCards.map((card) => (
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

export default CorporateLeasingHub;
