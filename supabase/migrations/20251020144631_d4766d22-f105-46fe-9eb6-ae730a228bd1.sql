-- ================================================
-- PHASE 1: Fleet Operations & Vehicle Status Schema
-- Core Models and Enums (Idempotent Version)
-- ================================================

-- 1. CREATE ENUMS (only if not exists)
-- ================================================

DO $$ BEGIN
  CREATE TYPE movement_type AS ENUM (
    'ownership_transfer',
    'inter_branch',
    'department_reallocation',
    'third_party'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE vehicle_operational_status AS ENUM (
    'available',
    'reserved',
    'rented',
    'under_maintenance',
    'accident_repair',
    'registration_pending',
    'internal_use',
    'sold',
    'de_fleeted'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE work_order_status AS ENUM (
    'open',
    'in_progress',
    'waiting_parts',
    'qa',
    'closed',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE work_order_reason AS ENUM (
    'pm',
    'breakdown',
    'accident',
    'recall',
    'inspection',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE priority_level AS ENUM (
    'low',
    'normal',
    'high',
    'urgent'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE expense_category AS ENUM (
    'registration',
    'fines',
    'cleaning',
    'towing',
    'transport',
    'parking',
    'diagnostics',
    'insurance',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. ENHANCE EXISTING VEHICLES TABLE
-- ================================================

ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS branch_id TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS cost_center TEXT,
ADD COLUMN IF NOT EXISTS ownership_entity TEXT DEFAULT 'Autostrad',
ADD COLUMN IF NOT EXISTS rented_to_company UUID,
ADD COLUMN IF NOT EXISTS operational_status vehicle_operational_status DEFAULT 'available',
ADD COLUMN IF NOT EXISTS last_status_change TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS expected_available_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS acquisition_date DATE,
ADD COLUMN IF NOT EXISTS book_value NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS depreciation_bucket TEXT,
ADD COLUMN IF NOT EXISTS funding_source TEXT,
ADD COLUMN IF NOT EXISTS asset_id TEXT;

-- Add foreign key for rented_to_company if not exists
DO $$ BEGIN
  ALTER TABLE vehicles 
  ADD CONSTRAINT fk_vehicles_rented_to_company 
  FOREIGN KEY (rented_to_company) REFERENCES customers(id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_vehicles_operational_status ON vehicles(operational_status);
CREATE INDEX IF NOT EXISTS idx_vehicles_branch ON vehicles(branch_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_expected_available ON vehicles(expected_available_date) WHERE expected_available_date IS NOT NULL;

-- 3. VEHICLE MOVEMENTS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS vehicle_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movement_no TEXT NOT NULL UNIQUE,
  movement_type movement_type NOT NULL,
  status approval_status DEFAULT 'pending',
  
  vehicle_ids UUID[] NOT NULL,
  
  from_owner TEXT,
  from_branch_id TEXT,
  from_department TEXT,
  from_cost_center TEXT,
  
  to_owner TEXT,
  to_branch_id TEXT,
  to_department TEXT,
  to_cost_center TEXT,
  
  effective_from TIMESTAMPTZ NOT NULL,
  expected_arrival TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  
  transport_job_ref TEXT,
  carrier_vendor TEXT,
  tracking_ref TEXT,
  
  odometer_at_dispatch INTEGER,
  fuel_level_at_dispatch INTEGER,
  handover_photos JSONB DEFAULT '[]',
  handover_notes TEXT,
  
  transfer_price NUMERIC(10,2),
  cost_center_change BOOLEAN DEFAULT false,
  gl_accounts JSONB,
  requires_finance_approval BOOLEAN DEFAULT false,
  
  reason_code TEXT NOT NULL,
  reason_description TEXT,
  documents JSONB DEFAULT '[]',
  
  submitted_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  rejected_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES profiles(id),
  rejection_reason TEXT,
  completed_at TIMESTAMPTZ,
  
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Movement number generator
CREATE OR REPLACE FUNCTION generate_movement_no()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_num INTEGER;
  result_no TEXT;
BEGIN
  SELECT COALESCE(
    (SELECT MAX(CAST(SUBSTRING(movement_no FROM 'MOV-(\d+)') AS INTEGER)) 
     FROM vehicle_movements 
     WHERE movement_no ~ '^MOV-\d+$'), 
    0
  ) + 1 INTO next_num;
  
  result_no := 'MOV-' || LPAD(next_num::TEXT, 6, '0');
  RETURN result_no;
END;
$$;

CREATE OR REPLACE FUNCTION set_movement_no()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.movement_no IS NULL THEN
    NEW.movement_no := generate_movement_no();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_movement_no ON vehicle_movements;
CREATE TRIGGER trg_set_movement_no
BEFORE INSERT ON vehicle_movements
FOR EACH ROW
EXECUTE FUNCTION set_movement_no();

CREATE INDEX IF NOT EXISTS idx_movements_status ON vehicle_movements(status);
CREATE INDEX IF NOT EXISTS idx_movements_vehicles ON vehicle_movements USING GIN(vehicle_ids);
CREATE INDEX IF NOT EXISTS idx_movements_effective_from ON vehicle_movements(effective_from);
CREATE INDEX IF NOT EXISTS idx_movements_created_by ON vehicle_movements(created_by);

-- 4. WORK ORDERS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_number TEXT NOT NULL UNIQUE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE RESTRICT NOT NULL,
  
  reason work_order_reason NOT NULL,
  priority priority_level DEFAULT 'normal',
  status work_order_status DEFAULT 'open',
  
  incident_ref TEXT,
  custody_transaction_id UUID REFERENCES custody_transactions(id),
  mileage INTEGER,
  fault_codes JSONB,
  
  assigned_to UUID REFERENCES profiles(id),
  workshop_vendor TEXT,
  bay_allocation TEXT,
  
  scheduled_start TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  estimated_cost NUMERIC(10,2),
  labor_cost NUMERIC(10,2),
  parts_cost NUMERIC(10,2),
  tax_amount NUMERIC(10,2),
  total_cost NUMERIC(10,2),
  cost_approved BOOLEAN DEFAULT false,
  cost_posted BOOLEAN DEFAULT false,
  
  qa_checklist JSONB,
  qa_passed BOOLEAN,
  test_drive_notes TEXT,
  
  requires_approval BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  
  photos JSONB DEFAULT '[]',
  documents JSONB DEFAULT '[]',
  notes TEXT,
  
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION generate_wo_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_num INTEGER;
  result_no TEXT;
BEGIN
  SELECT COALESCE(
    (SELECT MAX(CAST(SUBSTRING(wo_number FROM 'WO-(\d+)') AS INTEGER)) 
     FROM work_orders 
     WHERE wo_number ~ '^WO-\d+$'), 
    0
  ) + 1 INTO next_num;
  
  result_no := 'WO-' || LPAD(next_num::TEXT, 6, '0');
  RETURN result_no;
END;
$$;

CREATE OR REPLACE FUNCTION set_wo_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.wo_number IS NULL THEN
    NEW.wo_number := generate_wo_number();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_wo_number ON work_orders;
CREATE TRIGGER trg_set_wo_number
BEFORE INSERT ON work_orders
FOR EACH ROW
EXECUTE FUNCTION set_wo_number();

CREATE INDEX IF NOT EXISTS idx_wo_vehicle ON work_orders(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_wo_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_wo_priority ON work_orders(priority);
CREATE INDEX IF NOT EXISTS idx_wo_due_date ON work_orders(due_date) WHERE status NOT IN ('closed', 'cancelled');
CREATE INDEX IF NOT EXISTS idx_wo_assigned_to ON work_orders(assigned_to);

-- 5. WORK ORDER TASKS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS work_order_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE NOT NULL,
  
  task_number INTEGER NOT NULL,
  complaint TEXT NOT NULL,
  cause TEXT,
  correction TEXT,
  
  estimated_hours NUMERIC(5,2),
  actual_hours NUMERIC(5,2),
  technician_id UUID REFERENCES profiles(id),
  
  status TEXT DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  
  labor_rate NUMERIC(8,2),
  labor_cost NUMERIC(10,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(work_order_id, task_number)
);

CREATE INDEX IF NOT EXISTS idx_wo_tasks_wo ON work_order_tasks(work_order_id);

-- 6. WORK ORDER PARTS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS work_order_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE NOT NULL,
  
  part_number TEXT,
  part_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  
  supplier TEXT,
  ordered_from TEXT,
  ordered_at TIMESTAMPTZ,
  expected_eta TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  
  unit_price NUMERIC(10,2),
  total_price NUMERIC(10,2),
  
  status TEXT DEFAULT 'pending',
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wo_parts_wo ON work_order_parts(work_order_id);
CREATE INDEX IF NOT EXISTS idx_wo_parts_eta ON work_order_parts(expected_eta) WHERE status = 'ordered';

-- 7. VEHICLE STATUS HISTORY TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS vehicle_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  
  from_status vehicle_operational_status,
  to_status vehicle_operational_status NOT NULL,
  
  reason_code TEXT NOT NULL,
  reason_description TEXT,
  expected_available_at TIMESTAMPTZ,
  
  linked_object_type TEXT,
  linked_object_id UUID,
  
  changed_by UUID REFERENCES profiles(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  
  attachments JSONB DEFAULT '[]',
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_status_history_vehicle ON vehicle_status_history(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_status_history_date ON vehicle_status_history(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_status_history_to_status ON vehicle_status_history(to_status);

-- 8. FLEET EXPENSES TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS fleet_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_no TEXT NOT NULL UNIQUE,
  
  vehicle_id UUID REFERENCES vehicles(id),
  
  category expense_category NOT NULL,
  subcategory TEXT,
  
  vendor TEXT NOT NULL,
  invoice_number TEXT,
  invoice_date DATE NOT NULL,
  
  amount NUMERIC(10,2) NOT NULL,
  tax_code TEXT DEFAULT '5% VAT',
  tax_amount NUMERIC(10,2),
  total_amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'AED',
  
  branch_id TEXT,
  cost_center TEXT,
  gl_account TEXT,
  
  status approval_status DEFAULT 'pending',
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  posted BOOLEAN DEFAULT false,
  posted_at TIMESTAMPTZ,
  
  attachments JSONB DEFAULT '[]',
  
  linked_object_type TEXT,
  linked_object_id UUID,
  
  notes TEXT,
  
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION generate_expense_no()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_num INTEGER;
  result_no TEXT;
BEGIN
  SELECT COALESCE(
    (SELECT MAX(CAST(SUBSTRING(expense_no FROM 'EXP-(\d+)') AS INTEGER)) 
     FROM fleet_expenses 
     WHERE expense_no ~ '^EXP-\d+$'), 
    0
  ) + 1 INTO next_num;
  
  result_no := 'EXP-' || LPAD(next_num::TEXT, 6, '0');
  RETURN result_no;
END;
$$;

CREATE OR REPLACE FUNCTION set_expense_no()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.expense_no IS NULL THEN
    NEW.expense_no := generate_expense_no();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_expense_no ON fleet_expenses;
CREATE TRIGGER trg_set_expense_no
BEFORE INSERT ON fleet_expenses
FOR EACH ROW
EXECUTE FUNCTION set_expense_no();

CREATE INDEX IF NOT EXISTS idx_expenses_vehicle ON fleet_expenses(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON fleet_expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON fleet_expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON fleet_expenses(invoice_date DESC);

-- 9. SLA CONFIGURATIONS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS sla_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  applies_to TEXT NOT NULL,
  reason_code TEXT,
  branch_id TEXT,
  priority priority_level,
  
  approval_sla_hours INTEGER,
  completion_sla_hours INTEGER,
  response_sla_hours INTEGER,
  
  escalate_before_hours INTEGER DEFAULT 1,
  escalate_to_role TEXT,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sla_applies_to ON sla_configurations(applies_to);

-- 10. UPDATE TRIGGERS
-- ================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_vehicle_movements_updated_at ON vehicle_movements;
CREATE TRIGGER trg_vehicle_movements_updated_at
BEFORE UPDATE ON vehicle_movements
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_work_orders_updated_at ON work_orders;
CREATE TRIGGER trg_work_orders_updated_at
BEFORE UPDATE ON work_orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_wo_tasks_updated_at ON work_order_tasks;
CREATE TRIGGER trg_wo_tasks_updated_at
BEFORE UPDATE ON work_order_tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_wo_parts_updated_at ON work_order_parts;
CREATE TRIGGER trg_wo_parts_updated_at
BEFORE UPDATE ON work_order_parts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_fleet_expenses_updated_at ON fleet_expenses;
CREATE TRIGGER trg_fleet_expenses_updated_at
BEFORE UPDATE ON fleet_expenses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_sla_config_updated_at ON sla_configurations;
CREATE TRIGGER trg_sla_config_updated_at
BEFORE UPDATE ON sla_configurations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 11. ROW LEVEL SECURITY
-- ================================================

ALTER TABLE vehicle_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_configurations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can manage vehicle movements" ON vehicle_movements;
CREATE POLICY "Staff can manage vehicle movements"
ON vehicle_movements FOR ALL
USING (true);

DROP POLICY IF EXISTS "Staff can manage work orders" ON work_orders;
CREATE POLICY "Staff can manage work orders"
ON work_orders FOR ALL
USING (true);

DROP POLICY IF EXISTS "Staff can manage work order tasks" ON work_order_tasks;
CREATE POLICY "Staff can manage work order tasks"
ON work_order_tasks FOR ALL
USING (true);

DROP POLICY IF EXISTS "Staff can manage work order parts" ON work_order_parts;
CREATE POLICY "Staff can manage work order parts"
ON work_order_parts FOR ALL
USING (true);

DROP POLICY IF EXISTS "Staff can view status history" ON vehicle_status_history;
CREATE POLICY "Staff can view status history"
ON vehicle_status_history FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Staff can manage fleet expenses" ON fleet_expenses;
CREATE POLICY "Staff can manage fleet expenses"
ON fleet_expenses FOR ALL
USING (true);

DROP POLICY IF EXISTS "Staff can view SLA configurations" ON sla_configurations;
CREATE POLICY "Staff can view SLA configurations"
ON sla_configurations FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Staff can manage SLA configurations" ON sla_configurations;
CREATE POLICY "Staff can manage SLA configurations"
ON sla_configurations FOR ALL
USING (true);

-- 12. AUTOMATION TRIGGERS
-- ================================================

CREATE OR REPLACE FUNCTION auto_set_vehicle_under_maintenance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IN ('open', 'in_progress') THEN
    UPDATE vehicles
    SET 
      operational_status = 'under_maintenance',
      last_status_change = NOW()
    WHERE id = NEW.vehicle_id
    AND operational_status NOT IN ('rented', 'reserved');
    
    INSERT INTO vehicle_status_history (
      vehicle_id,
      from_status,
      to_status,
      reason_code,
      reason_description,
      linked_object_type,
      linked_object_id,
      changed_by
    )
    SELECT 
      NEW.vehicle_id,
      v.operational_status,
      'under_maintenance'::vehicle_operational_status,
      'work_order_opened',
      'Work order ' || NEW.wo_number || ' opened',
      'work_order',
      NEW.id,
      NEW.created_by
    FROM vehicles v
    WHERE v.id = NEW.vehicle_id
    AND v.operational_status != 'under_maintenance'::vehicle_operational_status;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_wo_auto_status ON work_orders;
CREATE TRIGGER trg_wo_auto_status
AFTER INSERT OR UPDATE OF status ON work_orders
FOR EACH ROW
EXECUTE FUNCTION auto_set_vehicle_under_maintenance();

CREATE OR REPLACE FUNCTION log_vehicle_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.operational_status IS DISTINCT FROM NEW.operational_status THEN
    INSERT INTO vehicle_status_history (
      vehicle_id,
      from_status,
      to_status,
      reason_code,
      changed_by
    ) VALUES (
      NEW.id,
      OLD.operational_status,
      NEW.operational_status,
      'manual_change',
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_vehicle_status ON vehicles;
CREATE TRIGGER trg_log_vehicle_status
AFTER UPDATE OF operational_status ON vehicles
FOR EACH ROW
EXECUTE FUNCTION log_vehicle_status_change();

-- 13. SEED DATA
-- ================================================

INSERT INTO sla_configurations (applies_to, reason_code, priority, approval_sla_hours, completion_sla_hours, response_sla_hours) 
VALUES
('work_order', 'breakdown', 'urgent', 1, 4, 1),
('work_order', 'breakdown', 'high', 2, 8, 2),
('work_order', 'pm', 'normal', 4, 48, 4),
('work_order', 'accident', 'high', 2, 72, 2),
('vehicle_movement', NULL, NULL, 8, 48, 2),
('custody_transaction', NULL, NULL, 4, 24, 2)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE vehicle_movements IS 'Tracks vehicle ownership transfers and inter-branch movements';
COMMENT ON TABLE work_orders IS 'Maintenance and repair job tracking with cost management';
COMMENT ON TABLE work_order_tasks IS 'Individual tasks within a work order (complaint → cause → correction)';
COMMENT ON TABLE work_order_parts IS 'Parts required and used in work orders';
COMMENT ON TABLE vehicle_status_history IS 'Complete audit trail of vehicle operational status changes';
COMMENT ON TABLE fleet_expenses IS 'Non-contract operational expenses (registration, fines, cleaning, etc.)';
COMMENT ON TABLE sla_configurations IS 'Configurable SLA rules by operation type, reason, and priority';