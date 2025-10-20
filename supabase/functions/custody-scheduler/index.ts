import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScheduledTaskResult {
  task: string;
  success: boolean;
  count?: number;
  error?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const results: ScheduledTaskResult[] = [];

    console.log('Starting custody scheduled tasks...');

    // Task 1: Auto-detect SLA breaches
    try {
      const { data: slaCount, error: slaError } = await supabaseClient
        .rpc('auto_detect_sla_breaches');

      if (slaError) throw slaError;

      results.push({
        task: 'sla_breach_detection',
        success: true,
        count: slaCount,
      });

      console.log(`SLA Detection: ${slaCount} custodies marked as breached`);
    } catch (error) {
      results.push({
        task: 'sla_breach_detection',
        success: false,
        error: error.message,
      });
      console.error('SLA Detection Error:', error);
    }

    // Task 2: Check expiring documents (next 30 days)
    try {
      const { data: expiringDocs, error: docsError } = await supabaseClient
        .rpc('check_document_expiry', { p_days_ahead: 30 });

      if (docsError) throw docsError;

      results.push({
        task: 'document_expiry_check',
        success: true,
        count: expiringDocs?.length || 0,
      });

      console.log(`Document Expiry: ${expiringDocs?.length || 0} documents expiring soon`);

      // Send notifications for expiring documents
      if (expiringDocs && expiringDocs.length > 0) {
        for (const doc of expiringDocs) {
          if (doc.days_until_expiry <= 7 && doc.days_until_expiry > 0) {
            // Send notification for documents expiring in 7 days
            await supabaseClient.functions.invoke('custody-notifications', {
              body: {
                custody_id: doc.custody_id,
                event_type: 'document_expiring_soon',
                metadata: {
                  document_type: doc.document_type,
                  days_until_expiry: doc.days_until_expiry,
                },
              },
            });
          } else if (doc.is_expired) {
            // Send notification for expired documents
            await supabaseClient.functions.invoke('custody-notifications', {
              body: {
                custody_id: doc.custody_id,
                event_type: 'document_expired',
                metadata: {
                  document_type: doc.document_type,
                },
              },
            });
          }
        }
      }
    } catch (error) {
      results.push({
        task: 'document_expiry_check',
        success: false,
        error: error.message,
      });
      console.error('Document Expiry Check Error:', error);
    }

    // Task 3: Check overdue custodies
    try {
      const { data: overdueCustodies, error: overdueError } = await supabaseClient
        .rpc('get_overdue_custodies');

      if (overdueError) throw overdueError;

      results.push({
        task: 'overdue_custodies_check',
        success: true,
        count: overdueCustodies?.length || 0,
      });

      console.log(`Overdue Custodies: ${overdueCustodies?.length || 0} custodies overdue`);

      // Send notifications for overdue custodies
      if (overdueCustodies && overdueCustodies.length > 0) {
        for (const custody of overdueCustodies) {
          if (custody.days_overdue >= 7 && custody.days_overdue % 7 === 0) {
            // Send weekly reminder for overdue custodies
            await supabaseClient.functions.invoke('custody-notifications', {
              body: {
                custody_id: custody.custody_id,
                event_type: 'custody_overdue',
                metadata: {
                  days_overdue: custody.days_overdue,
                  expected_return_date: custody.expected_return_date,
                },
              },
            });
          }
        }
      }
    } catch (error) {
      results.push({
        task: 'overdue_custodies_check',
        success: false,
        error: error.message,
      });
      console.error('Overdue Custodies Check Error:', error);
    }

    // Task 4: Retry failed webhooks
    try {
      const { data: failedWebhooks, error: webhookError } = await supabaseClient
        .rpc('retry_failed_webhooks', {
          p_max_age_hours: 24,
          p_max_retries: 3,
        });

      if (webhookError) throw webhookError;

      results.push({
        task: 'webhook_retry',
        success: true,
        count: failedWebhooks?.length || 0,
      });

      console.log(`Webhook Retry: ${failedWebhooks?.length || 0} webhooks to retry`);

      // Retry failed webhooks
      if (failedWebhooks && failedWebhooks.length > 0) {
        for (const webhook of failedWebhooks) {
          try {
            await supabaseClient.functions.invoke('custody-notifications', {
              body: {
                custody_id: webhook.custody_id,
                event_type: webhook.event_type,
                metadata: {
                  retry: true,
                  retry_count: webhook.retry_count + 1,
                },
              },
            });

            // Update webhook log with retry info
            await supabaseClient
              .from('custody_webhook_logs')
              .update({
                metadata: {
                  retry_count: webhook.retry_count + 1,
                  last_retry_at: new Date().toISOString(),
                },
              })
              .eq('id', webhook.webhook_id);
          } catch (error) {
            console.error(`Failed to retry webhook ${webhook.webhook_id}:`, error);
          }
        }
      }
    } catch (error) {
      results.push({
        task: 'webhook_retry',
        success: false,
        error: error.message,
      });
      console.error('Webhook Retry Error:', error);
    }

    // Task 5: Auto-close extremely overdue custodies (90+ days)
    try {
      const { data: autoClosedCustodies, error: autoCloseError } = await supabaseClient
        .rpc('auto_close_expired_custodies', { p_days_overdue: 90 });

      if (autoCloseError) throw autoCloseError;

      const closedCount = autoClosedCustodies?.filter(c => c.custody_id !== null).length || 0;

      results.push({
        task: 'auto_close_expired',
        success: true,
        count: closedCount,
      });

      console.log(`Auto-close: ${closedCount} custodies auto-closed`);

      // Send notifications for auto-closed custodies
      if (autoClosedCustodies && autoClosedCustodies.length > 0) {
        for (const custody of autoClosedCustodies) {
          if (custody.custody_id) {
            await supabaseClient.functions.invoke('custody-notifications', {
              body: {
                custody_id: custody.custody_id,
                event_type: 'custody_auto_closed',
                metadata: {
                  custody_no: custody.custody_no,
                },
              },
            });
          }
        }
      }
    } catch (error) {
      results.push({
        task: 'auto_close_expired',
        success: false,
        error: error.message,
      });
      console.error('Auto-close Error:', error);
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log('Custody scheduled tasks completed:', {
      total: results.length,
      successful: successCount,
      failed: failureCount,
    });

    return new Response(
      JSON.stringify({
        success: failureCount === 0,
        summary: {
          total_tasks: results.length,
          successful: successCount,
          failed: failureCount,
        },
        results,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: failureCount === 0 ? 200 : 207,
      }
    );
  } catch (error) {
    console.error('Custody Scheduler Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
