import { supabase } from '@/integrations/supabase/client';

export interface NotificationPreferences {
  id?: string;
  user_id?: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  notify_on_submission: boolean;
  notify_on_approval: boolean;
  notify_on_rejection: boolean;
  notify_on_handover: boolean;
  notify_on_closure: boolean;
  notify_on_sla_breach: boolean;
  email_address?: string;
  phone_number?: string;
}

export interface IntegrationSettings {
  id: string;
  integration_type: 'fleet' | 'billing' | 'claims';
  is_enabled: boolean;
  endpoint_url?: string;
  api_key_name?: string;
  config: Record<string, any>;
}

export interface WebhookLog {
  id: string;
  custody_id?: string;
  webhook_type: string;
  endpoint: string;
  payload: any;
  response: any;
  status_code: number;
  success: boolean;
  error_message?: string;
  created_at: string;
}

export class IntegrationsAPI {
  // ==========================================
  // NOTIFICATION PREFERENCES
  // ==========================================

  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    const { data, error } = await supabase
      .from('custody_notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }

    return data;
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    // Try update first
    const { data: existing } = await supabase
      .from('custody_notification_preferences')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('custody_notification_preferences')
        .update(preferences)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('custody_notification_preferences')
        .insert({ ...preferences, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  // ==========================================
  // INTEGRATION SETTINGS
  // ==========================================

  async getIntegrationSettings(type?: 'fleet' | 'billing' | 'claims'): Promise<IntegrationSettings[]> {
    let query = supabase.from('custody_integration_settings').select('*');

    if (type) {
      query = query.eq('integration_type', type);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as IntegrationSettings[];
  }

  async updateIntegrationSettings(
    type: 'fleet' | 'billing' | 'claims',
    settings: Partial<IntegrationSettings>
  ): Promise<IntegrationSettings> {
    const { data, error } = await supabase
      .from('custody_integration_settings')
      .update(settings)
      .eq('integration_type', type)
      .select()
      .single();

    if (error) throw error;
    return data as IntegrationSettings;
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  async sendNotification(
    custodyId: string,
    eventType: 'submitted' | 'approved' | 'rejected' | 'handover' | 'closed' | 'sla_breach',
    metadata?: Record<string, any>
  ): Promise<void> {
    const { error } = await supabase.functions.invoke('custody-notifications', {
      body: {
        custody_id: custodyId,
        event_type: eventType,
        metadata,
      },
    });

    if (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  // ==========================================
  // WEBHOOKS
  // ==========================================

  async triggerWebhook(
    custodyId: string,
    integrationType: 'fleet' | 'billing' | 'claims',
    action: string,
    data?: Record<string, any>
  ): Promise<void> {
    const { error } = await supabase.functions.invoke('custody-webhook', {
      body: {
        custody_id: custodyId,
        integration_type: integrationType,
        action,
        data,
      },
    });

    if (error) {
      console.error('Failed to trigger webhook:', error);
      throw error;
    }
  }

  async getWebhookLogs(custodyId?: string, limit: number = 50): Promise<WebhookLog[]> {
    let query = supabase
      .from('custody_webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (custodyId) {
      query = query.eq('custody_id', custodyId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  // ==========================================
  // WORKFLOW AUTOMATION
  // ==========================================

  async handleCustodyStatusChange(
    custodyId: string,
    oldStatus: string,
    newStatus: string,
    custody: any
  ): Promise<void> {
    // Send notification
    const eventMap: Record<string, any> = {
      'pending_approval': 'submitted',
      'approved': 'approved',
      'draft': 'rejected',
      'active': 'handover',
      'closed': 'closed',
    };

    if (eventMap[newStatus]) {
      await this.sendNotification(custodyId, eventMap[newStatus]);
    }

    // Trigger integrations based on status
    const settings = await this.getIntegrationSettings();

    for (const setting of settings) {
      if (!setting.is_enabled) continue;

      switch (newStatus) {
        case 'active':
          if (setting.integration_type === 'fleet') {
            await this.triggerWebhook(
              custodyId,
              'fleet',
              'update_vehicle_status',
              { status: 'in_custody', custody }
            );
          }
          break;

        case 'closed':
          if (setting.integration_type === 'billing' && setting.config.auto_create_invoice) {
            await this.triggerWebhook(
              custodyId,
              'billing',
              'create_invoice',
              { custody }
            );
          }
          if (setting.integration_type === 'fleet') {
            await this.triggerWebhook(
              custodyId,
              'fleet',
              'update_vehicle_status',
              { status: 'available', custody }
            );
          }
          break;

        case 'pending_approval':
          if (
            setting.integration_type === 'claims' &&
            custody.reason_code === 'accident' &&
            setting.config.auto_submit_accidents
          ) {
            await this.triggerWebhook(
              custodyId,
              'claims',
              'submit_claim',
              { custody }
            );
          }
          break;
      }
    }
  }
}

// Export singleton instance
export const integrationsApi = new IntegrationsAPI();
