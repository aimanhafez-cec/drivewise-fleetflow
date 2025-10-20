import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookRequest {
  custody_id: string;
  integration_type: 'fleet' | 'billing' | 'claims';
  action: string;
  data?: Record<string, any>;
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

    const { custody_id, integration_type, action, data }: WebhookRequest = await req.json();

    console.log(`Processing webhook for custody ${custody_id}, type: ${integration_type}, action: ${action}`);

    // Fetch integration settings
    const { data: integration, error: integrationError } = await supabaseClient
      .from('custody_integration_settings')
      .select('*')
      .eq('integration_type', integration_type)
      .single();

    if (integrationError || !integration) {
      throw new Error(`Integration ${integration_type} not configured`);
    }

    if (!integration.is_enabled) {
      throw new Error(`Integration ${integration_type} is disabled`);
    }

    // Fetch custody details
    const { data: custody, error: custodyError } = await supabaseClient
      .from('custody_transactions')
      .select('*')
      .eq('id', custody_id)
      .single();

    if (custodyError || !custody) {
      throw new Error(`Custody transaction not found: ${custodyError?.message}`);
    }

    // Prepare webhook payload
    const webhookPayload = {
      custody_no: custody.custody_no,
      custody_id: custody.id,
      action: action,
      timestamp: new Date().toISOString(),
      data: {
        ...data,
        custody_details: {
          reason_code: custody.reason_code,
          custodian_name: custody.custodian_name,
          custodian_type: custody.custodian_type,
          effective_from: custody.effective_from,
          expected_return_date: custody.expected_return_date,
          original_vehicle_id: custody.original_vehicle_id,
          replacement_vehicle_id: custody.replacement_vehicle_id,
        },
      },
    };

    // Call external webhook
    let response;
    let success = false;
    let statusCode = 0;
    let errorMessage = null;

    if (integration.endpoint_url) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        // Add API key if configured
        if (integration.api_key_name) {
          const apiKey = Deno.env.get(integration.api_key_name);
          if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
          }
        }

        console.log(`Calling webhook: ${integration.endpoint_url}`);
        
        const webhookResponse = await fetch(integration.endpoint_url, {
          method: 'POST',
          headers,
          body: JSON.stringify(webhookPayload),
        });

        statusCode = webhookResponse.status;
        success = webhookResponse.ok;
        response = await webhookResponse.json();

        console.log(`Webhook response: ${statusCode}`, response);
      } catch (error: any) {
        console.error('Webhook call failed:', error);
        errorMessage = error.message;
        success = false;
      }
    } else {
      // Simulate success for demonstration
      console.log('No endpoint configured, simulating webhook call');
      response = { message: 'Simulated webhook call', payload: webhookPayload };
      success = true;
      statusCode = 200;
    }

    // Log webhook call
    await supabaseClient
      .from('custody_webhook_logs')
      .insert({
        custody_id: custody_id,
        webhook_type: integration_type,
        endpoint: integration.endpoint_url || 'simulated',
        payload: webhookPayload,
        response: response,
        status_code: statusCode,
        success: success,
        error_message: errorMessage,
      });

    // Handle specific integration actions
    if (success) {
      await handleIntegrationAction(supabaseClient, integration_type, action, custody, response);
    }

    return new Response(
      JSON.stringify({
        success: success,
        integration_type,
        action,
        custody_no: custody.custody_no,
        status_code: statusCode,
        response: response,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: success ? 200 : 500,
      }
    );

  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function handleIntegrationAction(
  supabase: any,
  integrationType: string,
  action: string,
  custody: any,
  response: any
) {
  console.log(`Handling ${integrationType} action: ${action}`);

  switch (integrationType) {
    case 'fleet':
      // Update vehicle status in your fleet system
      if (action === 'update_vehicle_status') {
        // In a real system, you would update the vehicles table
        console.log('Would update vehicle status');
      }
      break;

    case 'billing':
      // Create invoice or post charges
      if (action === 'create_invoice') {
        // In a real system, you would create an invoice record
        console.log('Would create invoice');
      }
      break;

    case 'claims':
      // Submit insurance claim
      if (action === 'submit_claim') {
        // In a real system, you would integrate with claims system
        console.log('Would submit insurance claim');
      }
      break;
  }
}
