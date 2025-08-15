import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AgreementWizard } from '@/components/agreements/AgreementWizard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const AgreementWizardPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const fromReservation = searchParams.get('fromReservation');
  const reservationId = fromReservation || id;

  const { data: reservation, isLoading } = useQuery({
    queryKey: ['reservation', reservationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          profiles:customer_id (
            full_name,
            email,
            phone
          ),
          vehicles (
            make,
            model,
            license_plate,
            year
          )
        `)
        .eq('id', reservationId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!reservationId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </CardContent>
        </Card>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <h3 className="text-lg font-semibold">Reservation Not Found</h3>
          <p className="text-muted-foreground">
            The reservation you're trying to convert doesn't exist.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <AgreementWizard 
      reservationId={reservationId!} 
      reservation={reservation} 
    />
  );
};

export default AgreementWizardPage;