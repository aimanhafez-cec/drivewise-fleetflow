import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Calendar, Users, TrendingUp, Shield, Clock } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: Car,
      title: 'Fleet Management',
      description: 'Comprehensive vehicle tracking and maintenance scheduling',
    },
    {
      icon: Calendar,
      title: 'Reservation System',
      description: 'Easy booking and scheduling with conflict detection',
    },
    {
      icon: Users,
      title: 'Customer Management',
      description: 'Complete customer profiles and rental history',
    },
    {
      icon: TrendingUp,
      title: 'Analytics & Reports',
      description: 'Real-time insights and business intelligence',
    },
    {
      icon: Shield,
      title: 'Damage Tracking',
      description: 'Digital damage reports with photo documentation',
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Live status updates and notifications',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <Car className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-6">
              CEC Car Rental
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Complete car rental management system with fleet tracking, 
              reservations, customer management, and comprehensive reporting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="text-lg px-8 py-3"
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/auth')}
                className="text-lg px-8 py-3"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Everything you need to manage your rental business
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From vehicle tracking to customer management, our platform 
            provides all the tools you need to run a successful car rental business.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-muted/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Ready to streamline your rental business?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of rental companies already using CEC Car Rental 
            to manage their operations more efficiently.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="text-lg px-8 py-3"
          >
            Start Your Free Trial
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
