import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, FileText, CreditCard, TrendingUp, Wallet, DollarSign, AlertTriangle } from 'lucide-react';
import HubCard from '@/components/navigation/HubCard';

const TransactionsHub: React.FC = () => {
  const navigate = useNavigate();

  const transactionCards = [
    {
      title: 'Manage Expenses',
      description: 'Track and categorize business expenses, upload receipts, and manage cost centers',
      icon: Receipt,
      route: '/transactions/expenses',
      gradient: 'from-blue-500/10 to-cyan-500/10',
    },
    {
      title: 'Manage Invoices',
      description: 'Create, send, and track invoices for your rental agreements and services',
      icon: FileText,
      route: '/transactions/invoices',
      gradient: 'from-purple-500/10 to-pink-500/10',
    },
    {
      title: 'Payment Processing',
      description: 'Process payments, refunds, and manage payment methods for customers',
      icon: CreditCard,
      route: '/transactions/payments',
      gradient: 'from-green-500/10 to-emerald-500/10',
    },
    {
      title: 'Revenue Reports',
      description: 'Analyze revenue trends, track performance, and generate financial insights',
      icon: TrendingUp,
      route: '/transactions/revenue',
      gradient: 'from-orange-500/10 to-amber-500/10',
    },
    {
      title: 'Account Ledger',
      description: 'View complete transaction history and account balances for all customers',
      icon: Wallet,
      route: '/transactions/ledger',
      gradient: 'from-indigo-500/10 to-violet-500/10',
    },
    {
      title: 'Financial Summary',
      description: 'Get a comprehensive overview of your financial performance and key metrics',
      icon: DollarSign,
      route: '/transactions/summary',
      gradient: 'from-rose-500/10 to-red-500/10',
    },
    {
      title: 'Cost & Compliance',
      description: 'Manage tolls, fines, compliance exceptions, and billing cycles',
      icon: AlertTriangle,
      route: '/transactions/cost-compliance',
      gradient: 'from-yellow-500/10 to-orange-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground mt-2">
          Manage all financial transactions, invoices, payments, and reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {transactionCards.map((card) => (
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

export default TransactionsHub;
