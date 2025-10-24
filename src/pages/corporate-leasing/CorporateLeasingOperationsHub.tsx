import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Users, ClipboardCheck, AlertTriangle, Navigation, RefreshCw } from 'lucide-react';
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
    {
      title: 'Manage Inspections',
      description: 'Create and manage vehicle inspections including check-out, check-in, periodic, and random inspections',
      icon: ClipboardCheck,
      route: '/corporate-leasing-operations/manage-inspections',
      gradient: 'from-purple-500/10 to-pink-500/10',
    },
    {
      title: 'Traffic Fines',
      description: 'Monitor and reconcile traffic fines from UAE authorities',
      icon: AlertTriangle,
      route: '/corporate-leasing-operations/traffic-fines',
      gradient: 'from-red-500/10 to-orange-500/10',
    },
    {
      title: 'Toll Transactions',
      description: 'Track and manage toll crossings from Salik and Darb systems',
      icon: Navigation,
      route: '/corporate-leasing-operations/toll-transactions',
      gradient: 'from-cyan-500/10 to-blue-500/10',
    },
    {
      title: 'Manage Replacement Requests',
      description: 'Handle vehicle replacement requests for corporate leasing agreements due to maintenance, accidents, or upgrades',
      icon: RefreshCw,
      route: '/corporate-leasing-operations/replacement-requests',
      gradient: 'from-amber-500/10 to-yellow-500/10',
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
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
