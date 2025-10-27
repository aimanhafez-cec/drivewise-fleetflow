-- Create leads table for intake center
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_no TEXT UNIQUE NOT NULL,
  
  -- Source information
  source_type TEXT NOT NULL, -- aggregator, broker, direct, tourism, phone_email, social
  source_name TEXT NOT NULL,
  source_metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Status and priority
  status TEXT NOT NULL DEFAULT 'new', -- new, contacted, quoted, confirmed, rejected, expired
  priority TEXT NOT NULL DEFAULT 'medium', -- high, medium, low
  
  -- Customer information
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_nationality TEXT,
  language_preference TEXT DEFAULT 'en',
  
  -- Request details
  vehicle_category TEXT NOT NULL,
  alternative_categories TEXT[],
  pickup_datetime TIMESTAMPTZ NOT NULL,
  pickup_location TEXT NOT NULL,
  return_datetime TIMESTAMPTZ NOT NULL,
  return_location TEXT NOT NULL,
  duration_days INTEGER GENERATED ALWAYS AS (EXTRACT(DAY FROM (return_datetime - pickup_datetime))::INTEGER) STORED,
  estimated_value NUMERIC(10,2) NOT NULL,
  special_requests TEXT,
  
  -- Assignment and tracking
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,
  
  -- SLA tracking
  sla_response_deadline TIMESTAMPTZ,
  sla_breached BOOLEAN DEFAULT false,
  responded_at TIMESTAMPTZ,
  
  -- Conversion tracking
  converted_to_reservation_id UUID,
  conversion_rate_applied NUMERIC(5,2),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT valid_status CHECK (status IN ('new', 'contacted', 'quoted', 'confirmed', 'rejected', 'expired')),
  CONSTRAINT valid_priority CHECK (priority IN ('high', 'medium', 'low')),
  CONSTRAINT valid_dates CHECK (return_datetime > pickup_datetime)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_source_type ON public.leads(source_type);
CREATE INDEX IF NOT EXISTS idx_leads_sla_deadline ON public.leads(sla_response_deadline) WHERE sla_breached = false;

-- Create lead communications table
CREATE TABLE IF NOT EXISTS public.lead_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  
  communication_type TEXT NOT NULL, -- email, sms, whatsapp, call, note
  direction TEXT NOT NULL, -- inbound, outbound, system
  subject TEXT,
  content TEXT NOT NULL,
  
  sent_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_communication_type CHECK (communication_type IN ('email', 'sms', 'whatsapp', 'call', 'note', 'status_change')),
  CONSTRAINT valid_direction CHECK (direction IN ('inbound', 'outbound', 'system'))
);

CREATE INDEX IF NOT EXISTS idx_lead_communications_lead_id ON public.lead_communications(lead_id, created_at DESC);

-- Create agents table for assignment
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Skills and expertise
  languages TEXT[] DEFAULT '{"en"}'::TEXT[],
  regions TEXT[] DEFAULT '{"dubai"}'::TEXT[],
  vehicle_expertise TEXT[] DEFAULT '{"economy", "compact", "suv"}'::TEXT[],
  
  -- Status and availability
  status TEXT NOT NULL DEFAULT 'available', -- available, busy, away, offline
  max_concurrent_leads INTEGER DEFAULT 10,
  current_lead_count INTEGER DEFAULT 0,
  
  -- Performance metrics
  total_leads_handled INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  avg_response_time_minutes INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMPTZ,
  
  CONSTRAINT valid_agent_status CHECK (status IN ('available', 'busy', 'away', 'offline'))
);

CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents(status) WHERE status = 'available';
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON public.agents(user_id);

-- Create lead assignments history
CREATE TABLE IF NOT EXISTS public.lead_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id),
  
  assignment_method TEXT NOT NULL, -- manual, round_robin, skill_based, load_balanced
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unassigned_at TIMESTAMPTZ,
  
  CONSTRAINT valid_assignment_method CHECK (assignment_method IN ('manual', 'round_robin', 'skill_based', 'load_balanced'))
);

CREATE INDEX IF NOT EXISTS idx_lead_assignments_lead_id ON public.lead_assignments(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_assignments_agent_id ON public.lead_assignments(agent_id);

-- Function to generate lead number
CREATE OR REPLACE FUNCTION public.generate_lead_no()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  next_num INTEGER;
  result_no TEXT;
BEGIN
  SELECT COALESCE(
    (SELECT MAX(CAST(SUBSTRING(lead_no FROM 'LD-(\d+)') AS INTEGER))
     FROM public.leads
     WHERE lead_no ~ '^LD-\d+$'),
    0
  ) + 1 INTO next_num;
  
  result_no := 'LD-' || TO_CHAR(EXTRACT(YEAR FROM now()), 'FM0000') || '-' || LPAD(next_num::TEXT, 6, '0');
  RETURN result_no;
END;
$$;

-- Trigger to auto-generate lead number
CREATE OR REPLACE FUNCTION public.set_lead_no()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.lead_no IS NULL THEN
    NEW.lead_no := public.generate_lead_no();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_lead_no
  BEFORE INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.set_lead_no();

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION public.update_leads_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_leads_updated_at();

-- Trigger to set SLA deadline on insert
CREATE OR REPLACE FUNCTION public.set_lead_sla_deadline()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Set SLA deadline: 30 minutes for high priority, 2 hours for medium, 4 hours for low
  IF NEW.sla_response_deadline IS NULL THEN
    NEW.sla_response_deadline := CASE 
      WHEN NEW.priority = 'high' THEN NEW.created_at + INTERVAL '30 minutes'
      WHEN NEW.priority = 'medium' THEN NEW.created_at + INTERVAL '2 hours'
      ELSE NEW.created_at + INTERVAL '4 hours'
    END;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_lead_sla_deadline
  BEFORE INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.set_lead_sla_deadline();

-- Trigger to check SLA breach
CREATE OR REPLACE FUNCTION public.check_lead_sla_breach()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if SLA is breached when status changes or time passes
  IF NEW.responded_at IS NULL AND NEW.sla_response_deadline < now() THEN
    NEW.sla_breached := true;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_check_lead_sla_breach
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.check_lead_sla_breach();

-- Function to assign lead to agent (round-robin)
CREATE OR REPLACE FUNCTION public.assign_lead_round_robin(p_lead_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_agent_id UUID;
BEGIN
  -- Find available agent with lowest current load
  SELECT id INTO v_agent_id
  FROM public.agents
  WHERE status = 'available'
    AND current_lead_count < max_concurrent_leads
  ORDER BY current_lead_count ASC, last_activity_at ASC NULLS FIRST
  LIMIT 1;
  
  IF v_agent_id IS NULL THEN
    RAISE EXCEPTION 'No available agents found';
  END IF;
  
  -- Update lead
  UPDATE public.leads
  SET assigned_to = (SELECT user_id FROM public.agents WHERE id = v_agent_id),
      assigned_at = now(),
      updated_at = now()
  WHERE id = p_lead_id;
  
  -- Update agent
  UPDATE public.agents
  SET current_lead_count = current_lead_count + 1,
      last_activity_at = now(),
      updated_at = now()
  WHERE id = v_agent_id;
  
  -- Record assignment
  INSERT INTO public.lead_assignments (lead_id, agent_id, assignment_method)
  VALUES (p_lead_id, v_agent_id, 'round_robin');
  
  RETURN v_agent_id;
END;
$$;

-- Function to get lead statistics
CREATE OR REPLACE FUNCTION public.get_lead_statistics(p_date_from TIMESTAMPTZ DEFAULT (now() - INTERVAL '30 days'), p_date_to TIMESTAMPTZ DEFAULT now())
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_stats JSONB;
BEGIN
  WITH stats AS (
    SELECT 
      COUNT(*) as total_leads,
      COUNT(*) FILTER (WHERE status = 'new') as new_leads,
      COUNT(*) FILTER (WHERE status = 'contacted') as contacted_leads,
      COUNT(*) FILTER (WHERE status = 'quoted') as quoted_leads,
      COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_leads,
      COUNT(*) FILTER (WHERE status = 'rejected') as rejected_leads,
      COUNT(*) FILTER (WHERE status = 'expired') as expired_leads,
      COUNT(*) FILTER (WHERE sla_breached = true) as sla_breached_count,
      COUNT(*) FILTER (WHERE status = 'confirmed')::NUMERIC / NULLIF(COUNT(*), 0) * 100 as conversion_rate,
      AVG(EXTRACT(EPOCH FROM (responded_at - created_at)) / 60) FILTER (WHERE responded_at IS NOT NULL) as avg_response_time_minutes,
      SUM(estimated_value) FILTER (WHERE status = 'confirmed') as total_revenue,
      SUM(estimated_value) as potential_revenue
    FROM public.leads
    WHERE created_at BETWEEN p_date_from AND p_date_to
  )
  SELECT jsonb_build_object(
    'total_leads', COALESCE(total_leads, 0),
    'new_leads', COALESCE(new_leads, 0),
    'contacted_leads', COALESCE(contacted_leads, 0),
    'quoted_leads', COALESCE(quoted_leads, 0),
    'confirmed_leads', COALESCE(confirmed_leads, 0),
    'rejected_leads', COALESCE(rejected_leads, 0),
    'expired_leads', COALESCE(expired_leads, 0),
    'sla_breached_count', COALESCE(sla_breached_count, 0),
    'conversion_rate', ROUND(COALESCE(conversion_rate, 0), 2),
    'avg_response_time_minutes', ROUND(COALESCE(avg_response_time_minutes, 0), 1),
    'total_revenue', COALESCE(total_revenue, 0),
    'potential_revenue', COALESCE(potential_revenue, 0),
    'period_from', p_date_from,
    'period_to', p_date_to
  ) INTO v_stats
  FROM stats;
  
  RETURN v_stats;
END;
$$;

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leads
CREATE POLICY "Users can view all leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert leads"
  ON public.leads FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for lead_communications
CREATE POLICY "Users can view lead communications"
  ON public.lead_communications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert lead communications"
  ON public.lead_communications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for agents
CREATE POLICY "Users can view all agents"
  ON public.agents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own agent profile"
  ON public.agents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for lead_assignments
CREATE POLICY "Users can view lead assignments"
  ON public.lead_assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert lead assignments"
  ON public.lead_assignments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Enable realtime for leads table
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER TABLE public.leads REPLICA IDENTITY FULL;

-- Create notification trigger for new high-priority leads
CREATE OR REPLACE FUNCTION public.notify_high_priority_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.priority = 'high' AND NEW.status = 'new' THEN
    PERFORM pg_notify(
      'high_priority_lead',
      json_build_object(
        'lead_id', NEW.id,
        'lead_no', NEW.lead_no,
        'customer_name', NEW.customer_name,
        'estimated_value', NEW.estimated_value,
        'source_name', NEW.source_name
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_high_priority_lead
  AFTER INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_high_priority_lead();