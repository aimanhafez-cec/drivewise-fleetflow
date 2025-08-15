import { supabase } from '@/integrations/supabase/client';

export interface DamageMarker {
  id?: string;
  agreement_id?: string;
  reservation_id?: string;
  line_id: string;
  event: 'OUT' | 'IN' | 'EXCHANGE';
  side: 'FRONT' | 'REAR' | 'LEFT' | 'RIGHT' | 'TOP';
  x: number;
  y: number;
  damage_type: 'SCRATCH' | 'DENT' | 'CRACK' | 'PAINT' | 'GLASS' | 'TIRE' | 'OTHER';
  severity: 'LOW' | 'MED' | 'HIGH';
  occurred_at: string;
  notes?: string;
  photos?: Array<{ id: string; url: string; name: string }>;
  created_by?: string;
}

export interface TrafficTicket {
  id?: string;
  agreement_id?: string;
  reservation_id?: string;
  line_id?: string;
  customer_id: string;
  driver_id?: string;
  vehicle_id?: string;
  ticket_date: string;
  violation_type: string;
  fine_amount: number;
  court_date?: string;
  status: 'PENDING' | 'PAID' | 'DISPUTED' | 'TRANSFERRED';
  notes?: string;
  created_by?: string;
}

export interface VehicleExchange {
  id?: string;
  agreement_id: string;
  line_id: string;
  exchange_at: string;
  old_vehicle_id: string;
  new_vehicle_id: string;
  return_to_location_id?: string;
  new_out_location_id?: string;
  odometer_in_old: number;
  fuel_in_old: number;
  odometer_out_new: number;
  fuel_out_new: number;
  fees_added?: Array<{ id: string; name: string; amount: number }>;
  segment_a: {
    outAt: string;
    inAt: string;
    lineNet: number;
    tax: number;
    total: number;
  };
  segment_b: {
    outAt: string;
    inAt: string;
    lineNet: number;
    tax: number;
    total: number;
  };
  notes?: string;
  photos?: Array<{ id: string; url: string; name: string }>;
  created_by?: string;
}

class DamageAPI {
  async getDamageMarkers(agreementId: string, lineId?: string) {
    let query = supabase
      .from('damage_markers')
      .select('*')
      .eq('agreement_id', agreementId);

    if (lineId) {
      query = query.eq('line_id', lineId);
    }

    const { data, error } = await query.order('occurred_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createDamageMarker(marker: DamageMarker) {
    const { data, error } = await supabase
      .from('damage_markers')
      .insert([marker])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateDamageMarker(id: string, updates: Partial<DamageMarker>) {
    const { data, error } = await supabase
      .from('damage_markers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteDamageMarker(id: string) {
    const { error } = await supabase
      .from('damage_markers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

class TicketsAPI {
  async getTrafficTickets(agreementId: string) {
    const { data, error } = await supabase
      .from('traffic_tickets')
      .select('*')
      .eq('agreement_id', agreementId)
      .order('ticket_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createTrafficTicket(ticket: TrafficTicket) {
    const { data, error } = await supabase
      .from('traffic_tickets')
      .insert([ticket])
      .select()
      .single();

    if (error) throw error;

    // If bill_to_customer is true, create a misc charge
    if ((ticket as any).bill_to_customer) {
      await this.createMiscChargeForTicket(ticket.agreement_id!, ticket);
    }

    return data;
  }

  async updateTrafficTicket(id: string, updates: Partial<TrafficTicket>) {
    const { data, error } = await supabase
      .from('traffic_tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async createMiscChargeForTicket(agreementId: string, ticket: TrafficTicket) {
    // This would integrate with your misc charges system
    // For now, just log that a charge should be created
    console.log('Should create misc charge for ticket:', {
      agreementId,
      ticketId: ticket.id,
      amount: ticket.fine_amount,
      description: `Traffic Ticket (${ticket.violation_type})`
    });
  }
}

class ExchangeAPI {
  async getVehicleExchanges(agreementId: string) {
    const { data, error } = await supabase
      .from('vehicle_exchanges')
      .select('*')
      .eq('agreement_id', agreementId)
      .order('exchange_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createVehicleExchange(exchange: VehicleExchange) {
    // Start a transaction-like operation
    const { data: exchangeData, error: exchangeError } = await supabase
      .from('vehicle_exchanges')
      .insert([exchange])
      .select()
      .single();

    if (exchangeError) throw exchangeError;

    // Update the agreement line to reflect the exchange
    await this.updateAgreementLineForExchange(exchange);

    // Create damage markers for exchange inspection
    await this.createExchangeInspection(exchange);

    return exchangeData;
  }

  private async updateAgreementLineForExchange(exchange: VehicleExchange) {
    // Update the line to use the new vehicle
    const { error } = await supabase
      .from('agreement_lines')
      .update({
        vehicle_id: exchange.new_vehicle_id,
        // Add exchange metadata
        additions: [
          ...([] as any[]), // existing additions
          {
            type: 'vehicle_exchange',
            exchange_id: exchange.id,
            old_vehicle_id: exchange.old_vehicle_id,
            exchange_at: exchange.exchange_at
          }
        ]
      })
      .eq('id', exchange.line_id);

    if (error) throw error;
  }

  private async createExchangeInspection(exchange: VehicleExchange) {
    // Create damage markers for the exchange event
    const exchangeMarkers = [
      // Old vehicle check-in marker (if needed)
      // New vehicle check-out marker (if needed)
    ];

    if (exchangeMarkers.length > 0) {
      const { error } = await supabase
        .from('damage_markers')
        .insert(exchangeMarkers);

      if (error) throw error;
    }
  }

  async undoExchange(exchangeId: string) {
    // Get the exchange record
    const { data: exchange, error: fetchError } = await supabase
      .from('vehicle_exchanges')
      .select('*')
      .eq('id', exchangeId)
      .single();

    if (fetchError) throw fetchError;

    // Check if it's within the undo window (10 minutes)
    const exchangeTime = new Date(exchange.created_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - exchangeTime.getTime()) / (1000 * 60);

    if (diffMinutes > 10) {
      throw new Error('Exchange cannot be undone after 10 minutes');
    }

    // Revert the agreement line
    const { error: revertError } = await supabase
      .from('agreement_lines')
      .update({
        vehicle_id: exchange.old_vehicle_id,
        // Remove exchange from additions
      })
      .eq('id', exchange.line_id);

    if (revertError) throw revertError;

    // Delete the exchange record
    const { error: deleteError } = await supabase
      .from('vehicle_exchanges')
      .delete()
      .eq('id', exchangeId);

    if (deleteError) throw deleteError;
  }
}

class PricingAPI {
  async recalculateAgreementSummary(agreementId: string) {
    // Get all agreement lines
    const { data: lines, error: linesError } = await supabase
      .from('agreement_lines')
      .select('*')
      .eq('agreement_id', agreementId);

    if (linesError) throw linesError;

    // Get all traffic tickets that are billed to customer
    const { data: tickets, error: ticketsError } = await supabase
      .from('traffic_tickets')
      .select('*')
      .eq('agreement_id', agreementId);

    if (ticketsError) throw ticketsError;

    // Calculate totals (simplified)
    const lineTotal = lines?.reduce((sum, line) => sum + (line.line_total || 0), 0) || 0;
    const ticketTotal = tickets?.reduce((sum, ticket) => sum + (ticket.fine_amount || 0), 0) || 0;
    const grandTotal = lineTotal + ticketTotal;

    // Update agreement totals
    const { data, error } = await supabase
      .from('agreements')
      .update({
        total_amount: grandTotal,
        updated_at: new Date().toISOString()
      })
      .eq('id', agreementId)
      .select()
      .single();

    if (error) throw error;

    return {
      lineTotal,
      ticketTotal,
      grandTotal,
      agreement: data
    };
  }
}

// Export API instances
export const damageAPI = new DamageAPI();
export const ticketsAPI = new TicketsAPI();
export const exchangeAPI = new ExchangeAPI();
export const pricingAPI = new PricingAPI();