import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  custody_id: string;
  event_type: 'submitted' | 'approved' | 'rejected' | 'handover' | 'closed' | 'sla_breach';
  recipients?: string[]; // Optional specific recipients
  metadata?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { custody_id, event_type, recipients, metadata }: NotificationRequest = await req.json();

    console.log(`Processing notification for custody ${custody_id}, event: ${event_type}`);

    // Fetch custody details
    const { data: custody, error: custodyError } = await supabaseClient
      .from('custody_transactions')
      .select('*')
      .eq('id', custody_id)
      .single();

    if (custodyError || !custody) {
      throw new Error(`Custody transaction not found: ${custodyError?.message}`);
    }

    // Determine recipients based on event type
    let notificationRecipients = recipients || [];

    if (!recipients || recipients.length === 0) {
      // Auto-determine recipients based on event type
      switch (event_type) {
        case 'submitted':
          // Notify approvers
          const { data: approvers } = await supabaseClient
            .from('custody_approvals')
            .select('approver_user_id')
            .eq('custody_id', custody_id)
            .eq('status', 'pending');
          
          if (approvers) {
            notificationRecipients = approvers
              .map(a => a.approver_user_id)
              .filter(Boolean);
          }
          break;
        
        case 'approved':
        case 'rejected':
          // Notify creator
          if (custody.created_by) {
            notificationRecipients = [custody.created_by];
          }
          break;
        
        case 'handover':
          // Notify customer and operations team
          if (custody.customer_id) {
            notificationRecipients = [custody.customer_id];
          }
          break;
        
        case 'closed':
          // Notify all stakeholders
          const stakeholders = [custody.created_by, custody.customer_id].filter(Boolean);
          notificationRecipients = stakeholders;
          break;
        
        case 'sla_breach':
          // Notify managers and supervisors
          // In a real system, this would fetch from a management hierarchy
          break;
      }
    }

    // Get notification preferences for each recipient
    const notificationsSent: any[] = [];
    
    for (const userId of notificationRecipients) {
      const { data: preferences } = await supabaseClient
        .from('custody_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Check if user wants this type of notification
      const eventKey = `notify_on_${event_type === 'handover' ? 'handover' : 
                         event_type === 'submitted' ? 'submission' :
                         event_type}`;
      
      if (!preferences || preferences[eventKey] === false) {
        console.log(`User ${userId} has disabled ${event_type} notifications`);
        continue;
      }

      // Get user email
      const { data: user } = await supabaseClient.auth.admin.getUserById(userId);
      
      if (!user?.user?.email) {
        console.log(`No email found for user ${userId}`);
        continue;
      }

      // For now, log the notification (in production, integrate with Resend or similar)
      const notificationData = {
        to: preferences?.email_address || user.user.email,
        subject: `Custody ${event_type.toUpperCase()}: ${custody.custody_no}`,
        body: generateNotificationBody(event_type, custody, metadata),
      };

      console.log('Notification to send:', notificationData);
      notificationsSent.push(notificationData);

      // Log to webhook logs
      await supabaseClient
        .from('custody_webhook_logs')
        .insert({
          custody_id: custody_id,
          webhook_type: 'notification',
          endpoint: notificationData.to,
          payload: notificationData,
          success: true,
          status_code: 200,
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        notifications_sent: notificationsSent.length,
        event_type,
        custody_no: custody.custody_no,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error sending notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function generateNotificationBody(
  event_type: string, 
  custody: any, 
  metadata?: Record<string, any>
): string {
  const baseInfo = `Custody Transaction: ${custody.custody_no}\nReason: ${custody.reason_code}\nCustodian: ${custody.custodian_name}`;
  
  switch (event_type) {
    case 'submitted':
      return `A new custody transaction has been submitted for approval.\n\n${baseInfo}\n\nPlease review and approve at your earliest convenience.`;
    
    case 'approved':
      return `Custody transaction has been approved.\n\n${baseInfo}\n\nYou can now proceed with vehicle handover.`;
    
    case 'rejected':
      return `Custody transaction has been rejected.\n\n${baseInfo}\n\nReason: ${metadata?.rejection_reason || 'Not specified'}`;
    
    case 'handover':
      return `Vehicle handover is scheduled.\n\n${baseInfo}\n\nEffective from: ${new Date(custody.effective_from).toLocaleDateString()}`;
    
    case 'closed':
      return `Custody transaction has been closed.\n\n${baseInfo}\n\nReturn date: ${custody.actual_return_date ? new Date(custody.actual_return_date).toLocaleDateString() : 'Not specified'}`;
    
    case 'sla_breach':
      return `⚠️ SLA BREACH ALERT\n\n${baseInfo}\n\nThe custody transaction has exceeded its SLA targets. Immediate action required.`;
    
    default:
      return `Custody transaction update.\n\n${baseInfo}`;
  }
}
