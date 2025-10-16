export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      addon_items: {
        Row: {
          category: string
          created_at: string
          currency: string
          default_unit_price: number
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean
          item_code: string
          item_name: string
          notes: string | null
          pricing_model: string
          uom: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          currency?: string
          default_unit_price?: number
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          item_code: string
          item_name: string
          notes?: string | null
          pricing_model: string
          uom?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          currency?: string
          default_unit_price?: number
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          item_code?: string
          item_name?: string
          notes?: string | null
          pricing_model?: string
          uom?: string
          updated_at?: string
        }
        Relationships: []
      }
      agreement_lines: {
        Row: {
          additions: Json | null
          agreement_id: string
          check_in_at: string | null
          check_out_at: string | null
          created_at: string
          discount: Json | null
          drivers: Json | null
          id: string
          in_location_id: string | null
          line_net: number
          line_total: number
          out_location_id: string | null
          rate_breakdown: Json | null
          tax_id: string | null
          tax_value: number | null
          updated_at: string
          vehicle_class_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          additions?: Json | null
          agreement_id: string
          check_in_at?: string | null
          check_out_at?: string | null
          created_at?: string
          discount?: Json | null
          drivers?: Json | null
          id?: string
          in_location_id?: string | null
          line_net?: number
          line_total?: number
          out_location_id?: string | null
          rate_breakdown?: Json | null
          tax_id?: string | null
          tax_value?: number | null
          updated_at?: string
          vehicle_class_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          additions?: Json | null
          agreement_id?: string
          check_in_at?: string | null
          check_out_at?: string | null
          created_at?: string
          discount?: Json | null
          drivers?: Json | null
          id?: string
          in_location_id?: string | null
          line_net?: number
          line_total?: number
          out_location_id?: string | null
          rate_breakdown?: Json | null
          tax_id?: string | null
          tax_value?: number | null
          updated_at?: string
          vehicle_class_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agreement_lines_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "agreements"
            referencedColumns: ["id"]
          },
        ]
      }
      agreements: {
        Row: {
          add_ons: Json | null
          agreement_date: string
          agreement_no: string | null
          checkout_datetime: string | null
          checkout_fuel: number | null
          checkout_odometer: number | null
          created_at: string
          created_by: string | null
          customer_id: string
          id: string
          notes: string | null
          rate_overrides: Json | null
          reservation_id: string | null
          return_datetime: string | null
          return_fuel: number | null
          return_odometer: number | null
          signed_timestamp: string | null
          status: Database["public"]["Enums"]["agreement_status"]
          total_amount: number | null
          updated_at: string
          vehicle_condition_checkout: Json | null
          vehicle_condition_return: Json | null
          vehicle_id: string | null
        }
        Insert: {
          add_ons?: Json | null
          agreement_date?: string
          agreement_no?: string | null
          checkout_datetime?: string | null
          checkout_fuel?: number | null
          checkout_odometer?: number | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          id?: string
          notes?: string | null
          rate_overrides?: Json | null
          reservation_id?: string | null
          return_datetime?: string | null
          return_fuel?: number | null
          return_odometer?: number | null
          signed_timestamp?: string | null
          status?: Database["public"]["Enums"]["agreement_status"]
          total_amount?: number | null
          updated_at?: string
          vehicle_condition_checkout?: Json | null
          vehicle_condition_return?: Json | null
          vehicle_id?: string | null
        }
        Update: {
          add_ons?: Json | null
          agreement_date?: string
          agreement_no?: string | null
          checkout_datetime?: string | null
          checkout_fuel?: number | null
          checkout_odometer?: number | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          id?: string
          notes?: string | null
          rate_overrides?: Json | null
          reservation_id?: string | null
          return_datetime?: string | null
          return_fuel?: number | null
          return_odometer?: number | null
          signed_timestamp?: string | null
          status?: Database["public"]["Enums"]["agreement_status"]
          total_amount?: number | null
          updated_at?: string
          vehicle_condition_checkout?: Json | null
          vehicle_condition_return?: Json | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agreements_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agreements_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agreements_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_units: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean | null
          legal_entity_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          legal_entity_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          legal_entity_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_units_legal_entity_id_fkey"
            columns: ["legal_entity_id"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      car_subscriptions: {
        Row: {
          admin_fee_model: string | null
          admin_fee_per_fine: number | null
          auto_charge_retries: number
          auto_create_service_jobs: boolean
          auto_renew: boolean
          bill_to_contact: string | null
          billing_day: Database["public"]["Enums"]["billing_day_type"]
          buyout_amount: number | null
          buyout_offer: boolean | null
          cancellation_notice: Database["public"]["Enums"]["cancellation_notice"]
          condition_report_cadence: Database["public"]["Enums"]["condition_report_cadence"]
          condition_report_out: Json | null
          contract_end_date: string | null
          contract_freeze_fee: number | null
          contract_start_date: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          customer_type: Database["public"]["Enums"]["customer_type"]
          delivery_collection: string
          deposit_amount: number | null
          dunning_rules: string
          early_cancellation_amount: number | null
          early_cancellation_fee: Database["public"]["Enums"]["early_cancellation_fee_type"]
          excess_km_rate: number
          exit_inspection: boolean
          extra_drivers_included: number
          final_billing: Database["public"]["Enums"]["final_billing_type"]
          fuel_level_out: string | null
          geo_restrictions: Database["public"]["Enums"]["geo_restrictions"]
          id: string
          included_km_month: number
          insurance: Database["public"]["Enums"]["insurance_type"]
          joining_setup_fee: number | null
          maintenance: Database["public"]["Enums"]["maintenance_inclusion"]
          maintenance_km_interval: number | null
          maintenance_month_interval: number | null
          maintenance_trigger: Database["public"]["Enums"]["maintenance_trigger"]
          mileage_rollover: Database["public"]["Enums"]["mileage_rollover"]
          minimum_commitment: Database["public"]["Enums"]["minimum_commitment"]
          monthly_fee: number
          notes: string | null
          odometer_out: number | null
          pause_freeze_allowed: boolean
          pause_freeze_limit: number | null
          payment_method: Database["public"]["Enums"]["payment_method_type"]
          plan: Database["public"]["Enums"]["subscription_plan"]
          plate_no: string | null
          preferred_workshop: Database["public"]["Enums"]["preferred_workshop"]
          registration_renewal: Database["public"]["Enums"]["maintenance_inclusion"]
          renewal_cycle: Database["public"]["Enums"]["renewal_cycle"]
          rental_type: string
          replacement_sla: number | null
          replacement_sla_unit:
            | Database["public"]["Enums"]["replacement_sla_unit"]
            | null
          replacement_vehicle: Database["public"]["Enums"]["maintenance_inclusion"]
          roadside_assistance: Database["public"]["Enums"]["maintenance_inclusion"]
          salik_darb_allowance_cap: number | null
          salik_darb_handling: Database["public"]["Enums"]["salik_handling"]
          security_deposit: string
          signed_date: string | null
          start_date: string
          status: Database["public"]["Enums"]["car_subscription_status"]
          subscription_id: string | null
          subscription_model: Database["public"]["Enums"]["subscription_model"]
          suspension_behavior: Database["public"]["Enums"]["suspension_behavior"]
          swap_allowed: boolean
          swap_frequency: Database["public"]["Enums"]["swap_frequency"]
          swap_request_flow: Database["public"]["Enums"]["swap_request_flow"]
          telematics_device: boolean | null
          telematics_device_id: string | null
          tracking_consent: boolean | null
          traffic_fines_handling: string
          tyres: Database["public"]["Enums"]["maintenance_inclusion"]
          updated_at: string
          upgrade_downgrade_fee: number | null
          vat_code: string
          vehicle_class_id: string | null
          vehicle_id: string | null
          vehicle_swap_rules: Database["public"]["Enums"]["vehicle_swap_rules"]
        }
        Insert: {
          admin_fee_model?: string | null
          admin_fee_per_fine?: number | null
          auto_charge_retries?: number
          auto_create_service_jobs?: boolean
          auto_renew?: boolean
          bill_to_contact?: string | null
          billing_day?: Database["public"]["Enums"]["billing_day_type"]
          buyout_amount?: number | null
          buyout_offer?: boolean | null
          cancellation_notice?: Database["public"]["Enums"]["cancellation_notice"]
          condition_report_cadence?: Database["public"]["Enums"]["condition_report_cadence"]
          condition_report_out?: Json | null
          contract_end_date?: string | null
          contract_freeze_fee?: number | null
          contract_start_date?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          customer_type: Database["public"]["Enums"]["customer_type"]
          delivery_collection?: string
          deposit_amount?: number | null
          dunning_rules?: string
          early_cancellation_amount?: number | null
          early_cancellation_fee?: Database["public"]["Enums"]["early_cancellation_fee_type"]
          excess_km_rate: number
          exit_inspection?: boolean
          extra_drivers_included?: number
          final_billing?: Database["public"]["Enums"]["final_billing_type"]
          fuel_level_out?: string | null
          geo_restrictions?: Database["public"]["Enums"]["geo_restrictions"]
          id?: string
          included_km_month: number
          insurance?: Database["public"]["Enums"]["insurance_type"]
          joining_setup_fee?: number | null
          maintenance?: Database["public"]["Enums"]["maintenance_inclusion"]
          maintenance_km_interval?: number | null
          maintenance_month_interval?: number | null
          maintenance_trigger?: Database["public"]["Enums"]["maintenance_trigger"]
          mileage_rollover?: Database["public"]["Enums"]["mileage_rollover"]
          minimum_commitment?: Database["public"]["Enums"]["minimum_commitment"]
          monthly_fee: number
          notes?: string | null
          odometer_out?: number | null
          pause_freeze_allowed?: boolean
          pause_freeze_limit?: number | null
          payment_method?: Database["public"]["Enums"]["payment_method_type"]
          plan?: Database["public"]["Enums"]["subscription_plan"]
          plate_no?: string | null
          preferred_workshop?: Database["public"]["Enums"]["preferred_workshop"]
          registration_renewal?: Database["public"]["Enums"]["maintenance_inclusion"]
          renewal_cycle?: Database["public"]["Enums"]["renewal_cycle"]
          rental_type?: string
          replacement_sla?: number | null
          replacement_sla_unit?:
            | Database["public"]["Enums"]["replacement_sla_unit"]
            | null
          replacement_vehicle?: Database["public"]["Enums"]["maintenance_inclusion"]
          roadside_assistance?: Database["public"]["Enums"]["maintenance_inclusion"]
          salik_darb_allowance_cap?: number | null
          salik_darb_handling?: Database["public"]["Enums"]["salik_handling"]
          security_deposit?: string
          signed_date?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["car_subscription_status"]
          subscription_id?: string | null
          subscription_model?: Database["public"]["Enums"]["subscription_model"]
          suspension_behavior?: Database["public"]["Enums"]["suspension_behavior"]
          swap_allowed?: boolean
          swap_frequency?: Database["public"]["Enums"]["swap_frequency"]
          swap_request_flow?: Database["public"]["Enums"]["swap_request_flow"]
          telematics_device?: boolean | null
          telematics_device_id?: string | null
          tracking_consent?: boolean | null
          traffic_fines_handling?: string
          tyres?: Database["public"]["Enums"]["maintenance_inclusion"]
          updated_at?: string
          upgrade_downgrade_fee?: number | null
          vat_code?: string
          vehicle_class_id?: string | null
          vehicle_id?: string | null
          vehicle_swap_rules?: Database["public"]["Enums"]["vehicle_swap_rules"]
        }
        Update: {
          admin_fee_model?: string | null
          admin_fee_per_fine?: number | null
          auto_charge_retries?: number
          auto_create_service_jobs?: boolean
          auto_renew?: boolean
          bill_to_contact?: string | null
          billing_day?: Database["public"]["Enums"]["billing_day_type"]
          buyout_amount?: number | null
          buyout_offer?: boolean | null
          cancellation_notice?: Database["public"]["Enums"]["cancellation_notice"]
          condition_report_cadence?: Database["public"]["Enums"]["condition_report_cadence"]
          condition_report_out?: Json | null
          contract_end_date?: string | null
          contract_freeze_fee?: number | null
          contract_start_date?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          customer_type?: Database["public"]["Enums"]["customer_type"]
          delivery_collection?: string
          deposit_amount?: number | null
          dunning_rules?: string
          early_cancellation_amount?: number | null
          early_cancellation_fee?: Database["public"]["Enums"]["early_cancellation_fee_type"]
          excess_km_rate?: number
          exit_inspection?: boolean
          extra_drivers_included?: number
          final_billing?: Database["public"]["Enums"]["final_billing_type"]
          fuel_level_out?: string | null
          geo_restrictions?: Database["public"]["Enums"]["geo_restrictions"]
          id?: string
          included_km_month?: number
          insurance?: Database["public"]["Enums"]["insurance_type"]
          joining_setup_fee?: number | null
          maintenance?: Database["public"]["Enums"]["maintenance_inclusion"]
          maintenance_km_interval?: number | null
          maintenance_month_interval?: number | null
          maintenance_trigger?: Database["public"]["Enums"]["maintenance_trigger"]
          mileage_rollover?: Database["public"]["Enums"]["mileage_rollover"]
          minimum_commitment?: Database["public"]["Enums"]["minimum_commitment"]
          monthly_fee?: number
          notes?: string | null
          odometer_out?: number | null
          pause_freeze_allowed?: boolean
          pause_freeze_limit?: number | null
          payment_method?: Database["public"]["Enums"]["payment_method_type"]
          plan?: Database["public"]["Enums"]["subscription_plan"]
          plate_no?: string | null
          preferred_workshop?: Database["public"]["Enums"]["preferred_workshop"]
          registration_renewal?: Database["public"]["Enums"]["maintenance_inclusion"]
          renewal_cycle?: Database["public"]["Enums"]["renewal_cycle"]
          rental_type?: string
          replacement_sla?: number | null
          replacement_sla_unit?:
            | Database["public"]["Enums"]["replacement_sla_unit"]
            | null
          replacement_vehicle?: Database["public"]["Enums"]["maintenance_inclusion"]
          roadside_assistance?: Database["public"]["Enums"]["maintenance_inclusion"]
          salik_darb_allowance_cap?: number | null
          salik_darb_handling?: Database["public"]["Enums"]["salik_handling"]
          security_deposit?: string
          signed_date?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["car_subscription_status"]
          subscription_id?: string | null
          subscription_model?: Database["public"]["Enums"]["subscription_model"]
          suspension_behavior?: Database["public"]["Enums"]["suspension_behavior"]
          swap_allowed?: boolean
          swap_frequency?: Database["public"]["Enums"]["swap_frequency"]
          swap_request_flow?: Database["public"]["Enums"]["swap_request_flow"]
          telematics_device?: boolean | null
          telematics_device_id?: string | null
          tracking_consent?: boolean | null
          traffic_fines_handling?: string
          tyres?: Database["public"]["Enums"]["maintenance_inclusion"]
          updated_at?: string
          upgrade_downgrade_fee?: number | null
          vat_code?: string
          vehicle_class_id?: string | null
          vehicle_id?: string | null
          vehicle_swap_rules?: Database["public"]["Enums"]["vehicle_swap_rules"]
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          example_models: string[] | null
          icon: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          example_models?: string[] | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          example_models?: string[] | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_persons: {
        Row: {
          created_at: string
          customer_id: string
          email: string | null
          full_name: string
          id: string
          is_primary: boolean | null
          phone: string | null
          position: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          email?: string | null
          full_name: string
          id?: string
          is_primary?: boolean | null
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          email?: string | null
          full_name?: string
          id?: string
          is_primary?: boolean | null
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_persons_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      corporate_leasing_agreements: {
        Row: {
          admin_fee_per_fine_aed: number | null
          agreement_no: string | null
          approver_customer_email: string | null
          approver_customer_name: string | null
          bill_to_site_id: string | null
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          billing_day: Database["public"]["Enums"]["billing_day"]
          co_terminus_lines: boolean
          committed_fleet_size: number | null
          contract_end_date: string | null
          contract_manager_id: string | null
          contract_start_date: string | null
          cost_allocation_mode: Database["public"]["Enums"]["cost_allocation_mode"]
          created_at: string
          created_by: string | null
          credit_limit: number | null
          credit_terms: Database["public"]["Enums"]["credit_terms"]
          currency: string
          customer_id: string
          customer_po_no: string | null
          customer_segment:
            | Database["public"]["Enums"]["customer_segment"]
            | null
          deposit_amount_aed: number | null
          discount_schema: Json | null
          early_termination_allowed: boolean
          early_termination_rule: string | null
          framework_model: Database["public"]["Enums"]["framework_model"]
          fuel_handling: string
          id: string
          insurance_excess_aed: number | null
          insurance_responsibility: Database["public"]["Enums"]["insurance_responsibility"]
          invoice_format: Database["public"]["Enums"]["invoice_format"]
          legal_entity_id: string | null
          line_item_granularity: Database["public"]["Enums"]["line_item_granularity"]
          maintenance_policy: Database["public"]["Enums"]["maintenance_policy"]
          master_term: Database["public"]["Enums"]["contract_term"]
          notes: string | null
          off_hire_notice_period: number
          registration_responsibility: string
          renewal_option: string | null
          rental_type: Database["public"]["Enums"]["rental_type"]
          replacement_sla_hours: number | null
          replacement_vehicle_included: boolean
          roadside_assistance_included: boolean
          salik_darb_handling: string
          security_instrument:
            | Database["public"]["Enums"]["security_instrument"]
            | null
          signed_by_customer: string | null
          signed_by_lessor: string | null
          signed_date: string | null
          sla_credits_enabled: boolean | null
          sla_credits_percentage: number | null
          status: Database["public"]["Enums"]["corporate_lease_status"]
          telematics_consent: boolean | null
          tolls_admin_fee_model: string
          traffic_fines_handling: string
          tyres_included_after_km: number | null
          tyres_policy: string | null
          updated_at: string
          vat_code: string
          workshop_preference: string
        }
        Insert: {
          admin_fee_per_fine_aed?: number | null
          agreement_no?: string | null
          approver_customer_email?: string | null
          approver_customer_name?: string | null
          bill_to_site_id?: string | null
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          billing_day?: Database["public"]["Enums"]["billing_day"]
          co_terminus_lines?: boolean
          committed_fleet_size?: number | null
          contract_end_date?: string | null
          contract_manager_id?: string | null
          contract_start_date?: string | null
          cost_allocation_mode: Database["public"]["Enums"]["cost_allocation_mode"]
          created_at?: string
          created_by?: string | null
          credit_limit?: number | null
          credit_terms?: Database["public"]["Enums"]["credit_terms"]
          currency?: string
          customer_id: string
          customer_po_no?: string | null
          customer_segment?:
            | Database["public"]["Enums"]["customer_segment"]
            | null
          deposit_amount_aed?: number | null
          discount_schema?: Json | null
          early_termination_allowed?: boolean
          early_termination_rule?: string | null
          framework_model: Database["public"]["Enums"]["framework_model"]
          fuel_handling?: string
          id?: string
          insurance_excess_aed?: number | null
          insurance_responsibility?: Database["public"]["Enums"]["insurance_responsibility"]
          invoice_format?: Database["public"]["Enums"]["invoice_format"]
          legal_entity_id?: string | null
          line_item_granularity?: Database["public"]["Enums"]["line_item_granularity"]
          maintenance_policy?: Database["public"]["Enums"]["maintenance_policy"]
          master_term: Database["public"]["Enums"]["contract_term"]
          notes?: string | null
          off_hire_notice_period?: number
          registration_responsibility?: string
          renewal_option?: string | null
          rental_type?: Database["public"]["Enums"]["rental_type"]
          replacement_sla_hours?: number | null
          replacement_vehicle_included?: boolean
          roadside_assistance_included?: boolean
          salik_darb_handling?: string
          security_instrument?:
            | Database["public"]["Enums"]["security_instrument"]
            | null
          signed_by_customer?: string | null
          signed_by_lessor?: string | null
          signed_date?: string | null
          sla_credits_enabled?: boolean | null
          sla_credits_percentage?: number | null
          status?: Database["public"]["Enums"]["corporate_lease_status"]
          telematics_consent?: boolean | null
          tolls_admin_fee_model?: string
          traffic_fines_handling?: string
          tyres_included_after_km?: number | null
          tyres_policy?: string | null
          updated_at?: string
          vat_code?: string
          workshop_preference?: string
        }
        Update: {
          admin_fee_per_fine_aed?: number | null
          agreement_no?: string | null
          approver_customer_email?: string | null
          approver_customer_name?: string | null
          bill_to_site_id?: string | null
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          billing_day?: Database["public"]["Enums"]["billing_day"]
          co_terminus_lines?: boolean
          committed_fleet_size?: number | null
          contract_end_date?: string | null
          contract_manager_id?: string | null
          contract_start_date?: string | null
          cost_allocation_mode?: Database["public"]["Enums"]["cost_allocation_mode"]
          created_at?: string
          created_by?: string | null
          credit_limit?: number | null
          credit_terms?: Database["public"]["Enums"]["credit_terms"]
          currency?: string
          customer_id?: string
          customer_po_no?: string | null
          customer_segment?:
            | Database["public"]["Enums"]["customer_segment"]
            | null
          deposit_amount_aed?: number | null
          discount_schema?: Json | null
          early_termination_allowed?: boolean
          early_termination_rule?: string | null
          framework_model?: Database["public"]["Enums"]["framework_model"]
          fuel_handling?: string
          id?: string
          insurance_excess_aed?: number | null
          insurance_responsibility?: Database["public"]["Enums"]["insurance_responsibility"]
          invoice_format?: Database["public"]["Enums"]["invoice_format"]
          legal_entity_id?: string | null
          line_item_granularity?: Database["public"]["Enums"]["line_item_granularity"]
          maintenance_policy?: Database["public"]["Enums"]["maintenance_policy"]
          master_term?: Database["public"]["Enums"]["contract_term"]
          notes?: string | null
          off_hire_notice_period?: number
          registration_responsibility?: string
          renewal_option?: string | null
          rental_type?: Database["public"]["Enums"]["rental_type"]
          replacement_sla_hours?: number | null
          replacement_vehicle_included?: boolean
          roadside_assistance_included?: boolean
          salik_darb_handling?: string
          security_instrument?:
            | Database["public"]["Enums"]["security_instrument"]
            | null
          signed_by_customer?: string | null
          signed_by_lessor?: string | null
          signed_date?: string | null
          sla_credits_enabled?: boolean | null
          sla_credits_percentage?: number | null
          status?: Database["public"]["Enums"]["corporate_lease_status"]
          telematics_consent?: boolean | null
          tolls_admin_fee_model?: string
          traffic_fines_handling?: string
          tyres_included_after_km?: number | null
          tyres_policy?: string | null
          updated_at?: string
          vat_code?: string
          workshop_preference?: string
        }
        Relationships: [
          {
            foreignKeyName: "corporate_leasing_agreements_bill_to_site_id_fkey"
            columns: ["bill_to_site_id"]
            isOneToOne: false
            referencedRelation: "customer_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corporate_leasing_agreements_legal_entity_id_fkey"
            columns: ["legal_entity_id"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      corporate_leasing_lines: {
        Row: {
          actual_pickup_date: string | null
          actual_return_date: string | null
          additional_services: Json | null
          agreement_id: string
          category_name: string | null
          cost_center_id: string | null
          created_at: string
          excess_km_rate_aed: number | null
          exterior_color: string | null
          id: string
          included_services: Json | null
          item_code: string | null
          item_description: string | null
          lease_end_date: string | null
          lease_start_date: string
          line_number: number
          line_status: string
          make: string | null
          model: string | null
          model_year: number | null
          monthly_km_allowance: number | null
          monthly_rate_aed: number
          pickup_location_id: string | null
          project_code: string | null
          return_location_id: string | null
          security_deposit_aed: number | null
          setup_fee_aed: number | null
          updated_at: string
          vehicle_class_id: string | null
          vehicle_id: string | null
          vin: string | null
        }
        Insert: {
          actual_pickup_date?: string | null
          actual_return_date?: string | null
          additional_services?: Json | null
          agreement_id: string
          category_name?: string | null
          cost_center_id?: string | null
          created_at?: string
          excess_km_rate_aed?: number | null
          exterior_color?: string | null
          id?: string
          included_services?: Json | null
          item_code?: string | null
          item_description?: string | null
          lease_end_date?: string | null
          lease_start_date: string
          line_number: number
          line_status?: string
          make?: string | null
          model?: string | null
          model_year?: number | null
          monthly_km_allowance?: number | null
          monthly_rate_aed: number
          pickup_location_id?: string | null
          project_code?: string | null
          return_location_id?: string | null
          security_deposit_aed?: number | null
          setup_fee_aed?: number | null
          updated_at?: string
          vehicle_class_id?: string | null
          vehicle_id?: string | null
          vin?: string | null
        }
        Update: {
          actual_pickup_date?: string | null
          actual_return_date?: string | null
          additional_services?: Json | null
          agreement_id?: string
          category_name?: string | null
          cost_center_id?: string | null
          created_at?: string
          excess_km_rate_aed?: number | null
          exterior_color?: string | null
          id?: string
          included_services?: Json | null
          item_code?: string | null
          item_description?: string | null
          lease_end_date?: string | null
          lease_start_date?: string
          line_number?: number
          line_status?: string
          make?: string | null
          model?: string | null
          model_year?: number | null
          monthly_km_allowance?: number | null
          monthly_rate_aed?: number
          pickup_location_id?: string | null
          project_code?: string | null
          return_location_id?: string | null
          security_deposit_aed?: number | null
          setup_fee_aed?: number | null
          updated_at?: string
          vehicle_class_id?: string | null
          vehicle_id?: string | null
          vin?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "corporate_leasing_lines_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "corporate_leasing_agreements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corporate_leasing_lines_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_centers: {
        Row: {
          budget_limit: number | null
          code: string
          created_at: string
          customer_id: string
          description: string | null
          id: string
          is_active: boolean | null
          manager_name: string | null
          name: string
          updated_at: string
        }
        Insert: {
          budget_limit?: number | null
          code: string
          created_at?: string
          customer_id: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          manager_name?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          budget_limit?: number | null
          code?: string
          created_at?: string
          customer_id?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          manager_name?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      cost_sheet_approvals: {
        Row: {
          action: Database["public"]["Enums"]["cost_sheet_approval_action"]
          approver_user_id: string
          comments: string | null
          cost_sheet_id: string
          created_at: string
          id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["cost_sheet_approval_action"]
          approver_user_id: string
          comments?: string | null
          cost_sheet_id: string
          created_at?: string
          id?: string
        }
        Update: {
          action?: Database["public"]["Enums"]["cost_sheet_approval_action"]
          approver_user_id?: string
          comments?: string | null
          cost_sheet_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_sheet_approvals_cost_sheet_id_fkey"
            columns: ["cost_sheet_id"]
            isOneToOne: false
            referencedRelation: "quote_cost_sheets"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_sheet_configurations: {
        Row: {
          created_at: string
          financing_rate_percent: number
          id: string
          insurance_per_month_aed: number
          is_active: boolean
          maintenance_per_month_aed: number
          name: string
          other_costs_per_month_aed: number
          overhead_percent: number
          registration_admin_per_month_aed: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          financing_rate_percent?: number
          id?: string
          insurance_per_month_aed?: number
          is_active?: boolean
          maintenance_per_month_aed?: number
          name: string
          other_costs_per_month_aed?: number
          overhead_percent?: number
          registration_admin_per_month_aed?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          financing_rate_percent?: number
          id?: string
          insurance_per_month_aed?: number
          is_active?: boolean
          maintenance_per_month_aed?: number
          name?: string
          other_costs_per_month_aed?: number
          overhead_percent?: number
          registration_admin_per_month_aed?: number
          updated_at?: string
        }
        Relationships: []
      }
      customer_sites: {
        Row: {
          address: Json | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string
          customer_id: string
          id: string
          is_active: boolean | null
          site_code: string | null
          site_name: string
          site_type: string | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          customer_id: string
          id?: string
          is_active?: boolean | null
          site_code?: string | null
          site_name: string
          site_type?: string | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          is_active?: boolean | null
          site_code?: string | null
          site_name?: string
          site_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: Json | null
          approval_required: boolean | null
          corporate_account_id: string | null
          created_at: string
          credit_limit: number | null
          credit_rating: number | null
          customer_type: Database["public"]["Enums"]["customer_type"] | null
          date_of_birth: string | null
          default_po_bpa_no: string | null
          email: string
          emergency_contact: Json | null
          full_name: string
          id: string
          license_expiry: string | null
          license_number: string | null
          national_id: string | null
          notes: string | null
          passport_number: string | null
          phone: string | null
          profile_photo_url: string | null
          total_rentals: number | null
          total_spent: number | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          approval_required?: boolean | null
          corporate_account_id?: string | null
          created_at?: string
          credit_limit?: number | null
          credit_rating?: number | null
          customer_type?: Database["public"]["Enums"]["customer_type"] | null
          date_of_birth?: string | null
          default_po_bpa_no?: string | null
          email: string
          emergency_contact?: Json | null
          full_name: string
          id?: string
          license_expiry?: string | null
          license_number?: string | null
          national_id?: string | null
          notes?: string | null
          passport_number?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          total_rentals?: number | null
          total_spent?: number | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          approval_required?: boolean | null
          corporate_account_id?: string | null
          created_at?: string
          credit_limit?: number | null
          credit_rating?: number | null
          customer_type?: Database["public"]["Enums"]["customer_type"] | null
          date_of_birth?: string | null
          default_po_bpa_no?: string | null
          email?: string
          emergency_contact?: Json | null
          full_name?: string
          id?: string
          license_expiry?: string | null
          license_number?: string | null
          national_id?: string | null
          notes?: string | null
          passport_number?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          total_rentals?: number | null
          total_spent?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      damage_markers: {
        Row: {
          agreement_id: string | null
          created_at: string
          created_by: string | null
          damage_type: string
          event: string
          id: string
          line_id: string
          notes: string | null
          occurred_at: string
          photos: Json | null
          reservation_id: string | null
          severity: string
          side: string
          updated_at: string
          x: number
          y: number
        }
        Insert: {
          agreement_id?: string | null
          created_at?: string
          created_by?: string | null
          damage_type: string
          event: string
          id?: string
          line_id: string
          notes?: string | null
          occurred_at?: string
          photos?: Json | null
          reservation_id?: string | null
          severity: string
          side: string
          updated_at?: string
          x: number
          y: number
        }
        Update: {
          agreement_id?: string | null
          created_at?: string
          created_by?: string | null
          damage_type?: string
          event?: string
          id?: string
          line_id?: string
          notes?: string | null
          occurred_at?: string
          photos?: Json | null
          reservation_id?: string | null
          severity?: string
          side?: string
          updated_at?: string
          x?: number
          y?: number
        }
        Relationships: []
      }
      damage_records: {
        Row: {
          agreement_id: string | null
          created_at: string
          damage_type: Database["public"]["Enums"]["damage_type"]
          description: string
          diagram_coordinates: Json | null
          id: string
          location_on_vehicle: string | null
          photos: string[] | null
          recorded_at: string
          recorded_by: string | null
          repair_cost: number | null
          repair_status: string | null
          severity: string | null
          vehicle_id: string
        }
        Insert: {
          agreement_id?: string | null
          created_at?: string
          damage_type: Database["public"]["Enums"]["damage_type"]
          description: string
          diagram_coordinates?: Json | null
          id?: string
          location_on_vehicle?: string | null
          photos?: string[] | null
          recorded_at?: string
          recorded_by?: string | null
          repair_cost?: number | null
          repair_status?: string | null
          severity?: string | null
          vehicle_id: string
        }
        Update: {
          agreement_id?: string | null
          created_at?: string
          damage_type?: Database["public"]["Enums"]["damage_type"]
          description?: string
          diagram_coordinates?: Json | null
          id?: string
          location_on_vehicle?: string | null
          photos?: string[] | null
          recorded_at?: string
          recorded_by?: string | null
          repair_cost?: number | null
          repair_status?: string | null
          severity?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "damage_records_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "agreements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "damage_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          additional_driver_fee: number | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string
          id: string
          license_expiry: string | null
          license_no: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          additional_driver_fee?: number | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name: string
          id?: string
          license_expiry?: string | null
          license_no: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          additional_driver_fee?: number | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string
          id?: string
          license_expiry?: string | null
          license_no?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      inspection_in: {
        Row: {
          agreement_id: string
          checklist: Json
          created_at: string
          damage_marker_ids: string[] | null
          device_info: string | null
          id: string
          line_id: string
          location_id: string | null
          media: Json | null
          metrics: Json
          performed_at: string
          performed_by_user_id: string | null
          signature: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          agreement_id: string
          checklist?: Json
          created_at?: string
          damage_marker_ids?: string[] | null
          device_info?: string | null
          id?: string
          line_id: string
          location_id?: string | null
          media?: Json | null
          metrics?: Json
          performed_at?: string
          performed_by_user_id?: string | null
          signature?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          agreement_id?: string
          checklist?: Json
          created_at?: string
          damage_marker_ids?: string[] | null
          device_info?: string | null
          id?: string
          line_id?: string
          location_id?: string | null
          media?: Json | null
          metrics?: Json
          performed_at?: string
          performed_by_user_id?: string | null
          signature?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      inspection_out: {
        Row: {
          agreement_id: string
          checklist: Json
          created_at: string
          damage_marker_ids: string[] | null
          device_info: string | null
          id: string
          line_id: string
          location_id: string | null
          media: Json | null
          metrics: Json
          performed_at: string
          performed_by_user_id: string | null
          signature: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          agreement_id: string
          checklist?: Json
          created_at?: string
          damage_marker_ids?: string[] | null
          device_info?: string | null
          id?: string
          line_id: string
          location_id?: string | null
          media?: Json | null
          metrics?: Json
          performed_at?: string
          performed_by_user_id?: string | null
          signature?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          agreement_id?: string
          checklist?: Json
          created_at?: string
          damage_marker_ids?: string[] | null
          device_info?: string | null
          id?: string
          line_id?: string
          location_id?: string | null
          media?: Json | null
          metrics?: Json
          performed_at?: string
          performed_by_user_id?: string | null
          signature?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      inspections: {
        Row: {
          checklist: Json | null
          created_at: string
          fuel_level: number | null
          id: string
          inspection_date: string
          notes: string | null
          odometer: number | null
          performed_by: string | null
          photos: string[] | null
          reservation_id: string | null
          status: string | null
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          checklist?: Json | null
          created_at?: string
          fuel_level?: number | null
          id?: string
          inspection_date?: string
          notes?: string | null
          odometer?: number | null
          performed_by?: string | null
          photos?: string[] | null
          reservation_id?: string | null
          status?: string | null
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          checklist?: Json | null
          created_at?: string
          fuel_level?: number | null
          id?: string
          inspection_date?: string
          notes?: string | null
          odometer?: number | null
          performed_by?: string | null
          photos?: string[] | null
          reservation_id?: string | null
          status?: string | null
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspections_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      instant_booking_profiles: {
        Row: {
          auto_approve_limit: number | null
          created_at: string
          customer_id: string
          default_rental_duration: unknown | null
          id: string
          notification_preferences: Json | null
          preferred_locations: string[] | null
          preferred_vehicle_categories: string[] | null
          saved_payment_methods: Json | null
          updated_at: string
        }
        Insert: {
          auto_approve_limit?: number | null
          created_at?: string
          customer_id: string
          default_rental_duration?: unknown | null
          id?: string
          notification_preferences?: Json | null
          preferred_locations?: string[] | null
          preferred_vehicle_categories?: string[] | null
          saved_payment_methods?: Json | null
          updated_at?: string
        }
        Update: {
          auto_approve_limit?: number | null
          created_at?: string
          customer_id?: string
          default_rental_duration?: unknown | null
          id?: string
          notification_preferences?: Json | null
          preferred_locations?: string[] | null
          preferred_vehicle_categories?: string[] | null
          saved_payment_methods?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "instant_booking_profiles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      instant_booking_rules: {
        Row: {
          advance_booking_hours: number | null
          blackout_dates: Json | null
          business_rules: Json | null
          created_at: string
          customer_type: Database["public"]["Enums"]["customer_type"]
          id: string
          is_active: boolean | null
          location_id: string | null
          max_auto_approve_amount: number
          requires_approval: boolean | null
          updated_at: string
          vehicle_category_id: string | null
        }
        Insert: {
          advance_booking_hours?: number | null
          blackout_dates?: Json | null
          business_rules?: Json | null
          created_at?: string
          customer_type: Database["public"]["Enums"]["customer_type"]
          id?: string
          is_active?: boolean | null
          location_id?: string | null
          max_auto_approve_amount?: number
          requires_approval?: boolean | null
          updated_at?: string
          vehicle_category_id?: string | null
        }
        Update: {
          advance_booking_hours?: number | null
          blackout_dates?: Json | null
          business_rules?: Json | null
          created_at?: string
          customer_type?: Database["public"]["Enums"]["customer_type"]
          id?: string
          is_active?: boolean | null
          location_id?: string | null
          max_auto_approve_amount?: number
          requires_approval?: boolean | null
          updated_at?: string
          vehicle_category_id?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          agreement_id: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          due_date: string | null
          id: string
          invoice_number: string
          line_items: Json
          notes: string | null
          reservation_id: string | null
          status: string | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          agreement_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          due_date?: string | null
          id?: string
          invoice_number: string
          line_items: Json
          notes?: string | null
          reservation_id?: string | null
          status?: string | null
          subtotal: number
          tax_amount?: number | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          agreement_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          line_items?: Json
          notes?: string | null
          reservation_id?: string | null
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "agreements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_entities: {
        Row: {
          code: string
          country_code: string | null
          created_at: string
          currency: string | null
          id: string
          is_active: boolean | null
          name: string
          tax_registration_no: string | null
          updated_at: string
          vat_rate: number | null
        }
        Insert: {
          code: string
          country_code?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          tax_registration_no?: string | null
          updated_at?: string
          vat_rate?: number | null
        }
        Update: {
          code?: string
          country_code?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          tax_registration_no?: string | null
          updated_at?: string
          vat_rate?: number | null
        }
        Relationships: []
      }
      location_lov: {
        Row: {
          address: Json | null
          business_hours: Json | null
          city: string
          code: string
          contact_email: string | null
          contact_phone: string | null
          coordinates: Json | null
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          terminal: string | null
          type: string
          updated_at: string
        }
        Insert: {
          address?: Json | null
          business_hours?: Json | null
          city: string
          code: string
          contact_email?: string | null
          contact_phone?: string | null
          coordinates?: Json | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          terminal?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          address?: Json | null
          business_hours?: Json | null
          city?: string
          code?: string
          contact_email?: string | null
          contact_phone?: string | null
          coordinates?: Json | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          terminal?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          read?: boolean
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          notes_assumptions: string | null
          opportunity_no: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          notes_assumptions?: string | null
          opportunity_no: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          notes_assumptions?: string | null
          opportunity_no?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_packages: {
        Row: {
          created_at: string
          description: string | null
          id: string
          opportunity_id: string
          package_name: string
          qty: number
          uom: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          opportunity_id: string
          package_name: string
          qty?: number
          uom?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          opportunity_id?: string
          package_name?: string
          qty?: number
          uom?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_packages_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          customer_id: string
          gateway_response: Json | null
          id: string
          invoice_id: string | null
          payment_method: string
          payment_type: string
          processed_at: string | null
          processed_by: string | null
          reservation_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id: string
          gateway_response?: Json | null
          id?: string
          invoice_id?: string | null
          payment_method: string
          payment_type: string
          processed_at?: string | null
          processed_by?: string | null
          reservation_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string
          gateway_response?: Json | null
          id?: string
          invoice_id?: string | null
          payment_method?: string
          payment_type?: string
          processed_at?: string | null
          processed_by?: string | null
          reservation_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: Json | null
          created_at: string
          credit_rating: number | null
          date_of_birth: string | null
          email: string
          emergency_contact: Json | null
          full_name: string
          id: string
          license_expiry: string | null
          license_number: string | null
          notes: string[] | null
          phone: string | null
          profile_photo_url: string | null
          total_rentals: number | null
          total_spent: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: Json | null
          created_at?: string
          credit_rating?: number | null
          date_of_birth?: string | null
          email: string
          emergency_contact?: Json | null
          full_name: string
          id?: string
          license_expiry?: string | null
          license_number?: string | null
          notes?: string[] | null
          phone?: string | null
          profile_photo_url?: string | null
          total_rentals?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: Json | null
          created_at?: string
          credit_rating?: number | null
          date_of_birth?: string | null
          email?: string
          emergency_contact?: Json | null
          full_name?: string
          id?: string
          license_expiry?: string | null
          license_number?: string | null
          notes?: string[] | null
          phone?: string | null
          profile_photo_url?: string | null
          total_rentals?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          applicable_vehicle_categories: string[] | null
          code: string
          created_at: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          min_booking_amount: number | null
          updated_at: string | null
          usage_limit: number | null
          used_count: number | null
          valid_from: string
          valid_to: string
        }
        Insert: {
          applicable_vehicle_categories?: string[] | null
          code: string
          created_at?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          min_booking_amount?: number | null
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from: string
          valid_to: string
        }
        Update: {
          applicable_vehicle_categories?: string[] | null
          code?: string
          created_at?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          min_booking_amount?: number | null
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string
          valid_to?: string
        }
        Relationships: []
      }
      quote_approvals: {
        Row: {
          action: string
          approver_user_id: string
          comments: string | null
          created_at: string | null
          id: string
          quote_id: string
        }
        Insert: {
          action: string
          approver_user_id: string
          comments?: string | null
          created_at?: string | null
          id?: string
          quote_id: string
        }
        Update: {
          action?: string
          approver_user_id?: string
          comments?: string | null
          created_at?: string | null
          id?: string
          quote_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_approvals_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_attachments: {
        Row: {
          attachment_type: string
          created_at: string | null
          description: string | null
          entered_by: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          file_url: string | null
          id: string
          mime_type: string | null
          quote_id: string
          updated_at: string | null
        }
        Insert: {
          attachment_type: string
          created_at?: string | null
          description?: string | null
          entered_by?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          mime_type?: string | null
          quote_id: string
          updated_at?: string | null
        }
        Update: {
          attachment_type?: string
          created_at?: string | null
          description?: string | null
          entered_by?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          mime_type?: string | null
          quote_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_attachments_entered_by_fkey"
            columns: ["entered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_attachments_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_cost_sheet_lines: {
        Row: {
          acquisition_cost_aed: number
          actual_margin_percent: number
          cost_sheet_id: string
          created_at: string
          id: string
          insurance_per_month_aed: number
          lease_term_months: number
          line_no: number
          maintenance_per_month_aed: number
          other_costs_per_month_aed: number
          quoted_rate_per_month_aed: number
          registration_admin_per_month_aed: number
          residual_value_percent: number
          suggested_rate_per_month_aed: number
          total_cost_per_month_aed: number
          updated_at: string
          vehicle_class_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          acquisition_cost_aed?: number
          actual_margin_percent?: number
          cost_sheet_id: string
          created_at?: string
          id?: string
          insurance_per_month_aed?: number
          lease_term_months: number
          line_no: number
          maintenance_per_month_aed?: number
          other_costs_per_month_aed?: number
          quoted_rate_per_month_aed?: number
          registration_admin_per_month_aed?: number
          residual_value_percent?: number
          suggested_rate_per_month_aed?: number
          total_cost_per_month_aed?: number
          updated_at?: string
          vehicle_class_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          acquisition_cost_aed?: number
          actual_margin_percent?: number
          cost_sheet_id?: string
          created_at?: string
          id?: string
          insurance_per_month_aed?: number
          lease_term_months?: number
          line_no?: number
          maintenance_per_month_aed?: number
          other_costs_per_month_aed?: number
          quoted_rate_per_month_aed?: number
          registration_admin_per_month_aed?: number
          residual_value_percent?: number
          suggested_rate_per_month_aed?: number
          total_cost_per_month_aed?: number
          updated_at?: string
          vehicle_class_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_cost_sheet_lines_cost_sheet_id_fkey"
            columns: ["cost_sheet_id"]
            isOneToOne: false
            referencedRelation: "quote_cost_sheets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_cost_sheet_lines_vehicle_class_id_fkey"
            columns: ["vehicle_class_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_cost_sheet_lines_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_cost_sheets: {
        Row: {
          approval_notes: string | null
          approved_at: string | null
          approved_by: string | null
          cost_sheet_no: string | null
          created_at: string
          financing_rate_percent: number
          id: string
          notes_assumptions: string | null
          overhead_percent: number
          quote_id: string
          residual_value_percent: number
          status: Database["public"]["Enums"]["cost_sheet_status"]
          submitted_at: string | null
          submitted_by: string | null
          target_margin_percent: number
          updated_at: string
          version: number
        }
        Insert: {
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          cost_sheet_no?: string | null
          created_at?: string
          financing_rate_percent?: number
          id?: string
          notes_assumptions?: string | null
          overhead_percent?: number
          quote_id: string
          residual_value_percent?: number
          status?: Database["public"]["Enums"]["cost_sheet_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          target_margin_percent?: number
          updated_at?: string
          version?: number
        }
        Update: {
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          cost_sheet_no?: string | null
          created_at?: string
          financing_rate_percent?: number
          id?: string
          notes_assumptions?: string | null
          overhead_percent?: number
          quote_id?: string
          residual_value_percent?: number
          status?: Database["public"]["Enums"]["cost_sheet_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          target_margin_percent?: number
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_cost_sheets_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          account_name: string | null
          annual_escalation_percentage: number | null
          approval_notes: string | null
          approved_at: string | null
          approved_by: string | null
          billing_plan: string | null
          billing_start_date: string | null
          business_unit_id: string | null
          contact_person_id: string | null
          contract_effective_from: string | null
          contract_effective_to: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          customer_bill_to: string | null
          customer_id: string
          customer_po_number: string | null
          customer_type: string | null
          default_addons: Json | null
          default_advance_rent_months: number | null
          default_deposit_amount: number | null
          default_price_list_id: string | null
          deposit_type: string | null
          duration_days: number | null
          email_invoice_to_contact: boolean | null
          grace_period_days: number | null
          id: string
          initial_fees: Json | null
          insurance_additional_driver: boolean | null
          insurance_coverage_package: string | null
          insurance_coverage_summary: string | null
          insurance_cross_border: boolean | null
          insurance_damage_waiver: boolean | null
          insurance_excess_aed: number | null
          insurance_glass_tire_cover: boolean | null
          insurance_notes: string | null
          insurance_pai_enabled: boolean | null
          insurance_personal_accident: boolean | null
          insurance_territorial_coverage: string | null
          insurance_theft_protection: boolean | null
          insurance_third_party_liability: boolean | null
          invoice_contact_person_id: string | null
          invoice_format: string | null
          items: Json
          late_fee_percentage: number | null
          legal_entity_id: string | null
          maintenance_coverage_summary: string | null
          maintenance_included: boolean | null
          maintenance_package_type: string | null
          maintenance_plan_source: string | null
          mileage_pooling_enabled: boolean | null
          monthly_maintenance_cost_per_vehicle: number | null
          notes: string | null
          opportunity_id: string | null
          payment_instructions: string | null
          payment_method: string | null
          payment_terms_id: string | null
          pickup_customer_site_id: string | null
          pickup_location_id: string | null
          pickup_type: string | null
          pooled_excess_km_rate: number | null
          pooled_mileage_allowance_km: number | null
          project: string | null
          proration_rule: string | null
          quote_date: string | null
          quote_description: string | null
          quote_entry_date: string | null
          quote_items: Json | null
          quote_number: string
          quote_type: string | null
          return_customer_site_id: string | null
          return_location_id: string | null
          return_type: string | null
          rfq_id: string | null
          sales_office_id: string | null
          sales_rep_id: string | null
          show_maintenance_separate_line: boolean | null
          status: string
          submitted_at: string | null
          submitted_by: string | null
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string
          valid_until: string | null
          validity_date_to: string | null
          vat_percentage: number | null
          vehicle_id: string | null
          vehicle_type_id: string | null
          version: number | null
          win_loss_reason: string | null
          withholding_tax_percentage: number | null
        }
        Insert: {
          account_name?: string | null
          annual_escalation_percentage?: number | null
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          billing_plan?: string | null
          billing_start_date?: string | null
          business_unit_id?: string | null
          contact_person_id?: string | null
          contract_effective_from?: string | null
          contract_effective_to?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          customer_bill_to?: string | null
          customer_id: string
          customer_po_number?: string | null
          customer_type?: string | null
          default_addons?: Json | null
          default_advance_rent_months?: number | null
          default_deposit_amount?: number | null
          default_price_list_id?: string | null
          deposit_type?: string | null
          duration_days?: number | null
          email_invoice_to_contact?: boolean | null
          grace_period_days?: number | null
          id?: string
          initial_fees?: Json | null
          insurance_additional_driver?: boolean | null
          insurance_coverage_package?: string | null
          insurance_coverage_summary?: string | null
          insurance_cross_border?: boolean | null
          insurance_damage_waiver?: boolean | null
          insurance_excess_aed?: number | null
          insurance_glass_tire_cover?: boolean | null
          insurance_notes?: string | null
          insurance_pai_enabled?: boolean | null
          insurance_personal_accident?: boolean | null
          insurance_territorial_coverage?: string | null
          insurance_theft_protection?: boolean | null
          insurance_third_party_liability?: boolean | null
          invoice_contact_person_id?: string | null
          invoice_format?: string | null
          items?: Json
          late_fee_percentage?: number | null
          legal_entity_id?: string | null
          maintenance_coverage_summary?: string | null
          maintenance_included?: boolean | null
          maintenance_package_type?: string | null
          maintenance_plan_source?: string | null
          mileage_pooling_enabled?: boolean | null
          monthly_maintenance_cost_per_vehicle?: number | null
          notes?: string | null
          opportunity_id?: string | null
          payment_instructions?: string | null
          payment_method?: string | null
          payment_terms_id?: string | null
          pickup_customer_site_id?: string | null
          pickup_location_id?: string | null
          pickup_type?: string | null
          pooled_excess_km_rate?: number | null
          pooled_mileage_allowance_km?: number | null
          project?: string | null
          proration_rule?: string | null
          quote_date?: string | null
          quote_description?: string | null
          quote_entry_date?: string | null
          quote_items?: Json | null
          quote_number: string
          quote_type?: string | null
          return_customer_site_id?: string | null
          return_location_id?: string | null
          return_type?: string | null
          rfq_id?: string | null
          sales_office_id?: string | null
          sales_rep_id?: string | null
          show_maintenance_separate_line?: boolean | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          valid_until?: string | null
          validity_date_to?: string | null
          vat_percentage?: number | null
          vehicle_id?: string | null
          vehicle_type_id?: string | null
          version?: number | null
          win_loss_reason?: string | null
          withholding_tax_percentage?: number | null
        }
        Update: {
          account_name?: string | null
          annual_escalation_percentage?: number | null
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          billing_plan?: string | null
          billing_start_date?: string | null
          business_unit_id?: string | null
          contact_person_id?: string | null
          contract_effective_from?: string | null
          contract_effective_to?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          customer_bill_to?: string | null
          customer_id?: string
          customer_po_number?: string | null
          customer_type?: string | null
          default_addons?: Json | null
          default_advance_rent_months?: number | null
          default_deposit_amount?: number | null
          default_price_list_id?: string | null
          deposit_type?: string | null
          duration_days?: number | null
          email_invoice_to_contact?: boolean | null
          grace_period_days?: number | null
          id?: string
          initial_fees?: Json | null
          insurance_additional_driver?: boolean | null
          insurance_coverage_package?: string | null
          insurance_coverage_summary?: string | null
          insurance_cross_border?: boolean | null
          insurance_damage_waiver?: boolean | null
          insurance_excess_aed?: number | null
          insurance_glass_tire_cover?: boolean | null
          insurance_notes?: string | null
          insurance_pai_enabled?: boolean | null
          insurance_personal_accident?: boolean | null
          insurance_territorial_coverage?: string | null
          insurance_theft_protection?: boolean | null
          insurance_third_party_liability?: boolean | null
          invoice_contact_person_id?: string | null
          invoice_format?: string | null
          items?: Json
          late_fee_percentage?: number | null
          legal_entity_id?: string | null
          maintenance_coverage_summary?: string | null
          maintenance_included?: boolean | null
          maintenance_package_type?: string | null
          maintenance_plan_source?: string | null
          mileage_pooling_enabled?: boolean | null
          monthly_maintenance_cost_per_vehicle?: number | null
          notes?: string | null
          opportunity_id?: string | null
          payment_instructions?: string | null
          payment_method?: string | null
          payment_terms_id?: string | null
          pickup_customer_site_id?: string | null
          pickup_location_id?: string | null
          pickup_type?: string | null
          pooled_excess_km_rate?: number | null
          pooled_mileage_allowance_km?: number | null
          project?: string | null
          proration_rule?: string | null
          quote_date?: string | null
          quote_description?: string | null
          quote_entry_date?: string | null
          quote_items?: Json | null
          quote_number?: string
          quote_type?: string | null
          return_customer_site_id?: string | null
          return_location_id?: string | null
          return_type?: string | null
          rfq_id?: string | null
          sales_office_id?: string | null
          sales_rep_id?: string | null
          show_maintenance_separate_line?: boolean | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          valid_until?: string | null
          validity_date_to?: string | null
          vat_percentage?: number | null
          vehicle_id?: string | null
          vehicle_type_id?: string | null
          version?: number | null
          win_loss_reason?: string | null
          withholding_tax_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_contact_person_id_fkey"
            columns: ["contact_person_id"]
            isOneToOne: false
            referencedRelation: "contact_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_legal_entity_id_fkey"
            columns: ["legal_entity_id"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_sales_office_id_fkey"
            columns: ["sales_office_id"]
            isOneToOne: false
            referencedRelation: "sales_offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_sales_rep_id_fkey"
            columns: ["sales_rep_id"]
            isOneToOne: false
            referencedRelation: "sales_representatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      report_templates: {
        Row: {
          columns: Json
          created_at: string
          created_by: string | null
          description: string | null
          email_recipients: string[] | null
          filters: Json | null
          group_by: string[] | null
          id: string
          is_active: boolean | null
          name: string
          report_type: string
          schedule_rule: string | null
          sort_by: Json | null
          updated_at: string
        }
        Insert: {
          columns: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          email_recipients?: string[] | null
          filters?: Json | null
          group_by?: string[] | null
          id?: string
          is_active?: boolean | null
          name: string
          report_type: string
          schedule_rule?: string | null
          sort_by?: Json | null
          updated_at?: string
        }
        Update: {
          columns?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          email_recipients?: string[] | null
          filters?: Json | null
          group_by?: string[] | null
          id?: string
          is_active?: boolean | null
          name?: string
          report_type?: string
          schedule_rule?: string | null
          sort_by?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          add_ons: Json | null
          airport_info: Json | null
          airport_surcharge: number | null
          auto_approved: boolean | null
          billing_address: Json | null
          booking_type: Database["public"]["Enums"]["booking_type"] | null
          converted_agreement_id: string | null
          created_at: string
          created_by: string | null
          cross_border_permits: Json | null
          customer_id: string
          darb_package: Json | null
          end_datetime: string
          estimated_tolls: number | null
          fuel_option: string | null
          id: string
          instant_booking_score: number | null
          mileage_package: Json | null
          one_way_surcharge: number | null
          pickup_location: string
          po_number: string | null
          rate_plan: Json | null
          referral_code: string | null
          return_location: string
          ro_number: string | null
          salik_package: Json | null
          special_requests: string | null
          start_datetime: string
          status: Database["public"]["Enums"]["reservation_status"]
          taxes: Json | null
          total_amount: number | null
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          add_ons?: Json | null
          airport_info?: Json | null
          airport_surcharge?: number | null
          auto_approved?: boolean | null
          billing_address?: Json | null
          booking_type?: Database["public"]["Enums"]["booking_type"] | null
          converted_agreement_id?: string | null
          created_at?: string
          created_by?: string | null
          cross_border_permits?: Json | null
          customer_id: string
          darb_package?: Json | null
          end_datetime: string
          estimated_tolls?: number | null
          fuel_option?: string | null
          id?: string
          instant_booking_score?: number | null
          mileage_package?: Json | null
          one_way_surcharge?: number | null
          pickup_location: string
          po_number?: string | null
          rate_plan?: Json | null
          referral_code?: string | null
          return_location: string
          ro_number?: string | null
          salik_package?: Json | null
          special_requests?: string | null
          start_datetime: string
          status?: Database["public"]["Enums"]["reservation_status"]
          taxes?: Json | null
          total_amount?: number | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          add_ons?: Json | null
          airport_info?: Json | null
          airport_surcharge?: number | null
          auto_approved?: boolean | null
          billing_address?: Json | null
          booking_type?: Database["public"]["Enums"]["booking_type"] | null
          converted_agreement_id?: string | null
          created_at?: string
          created_by?: string | null
          cross_border_permits?: Json | null
          customer_id?: string
          darb_package?: Json | null
          end_datetime?: string
          estimated_tolls?: number | null
          fuel_option?: string | null
          id?: string
          instant_booking_score?: number | null
          mileage_package?: Json | null
          one_way_surcharge?: number | null
          pickup_location?: string
          po_number?: string | null
          rate_plan?: Json | null
          referral_code?: string | null
          return_location?: string
          ro_number?: string | null
          salik_package?: Json | null
          special_requests?: string | null
          start_datetime?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          taxes?: Json | null
          total_amount?: number | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_converted_agreement_id_fkey"
            columns: ["converted_agreement_id"]
            isOneToOne: false
            referencedRelation: "agreements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      rfqs: {
        Row: {
          attachments: Json | null
          created_at: string
          created_by: string | null
          customer_id: string
          id: string
          notes: string | null
          pickup_at: string
          pickup_loc_id: string
          return_at: string
          return_loc_id: string
          rfq_no: string
          salesperson_id: string | null
          status: Database["public"]["Enums"]["rfq_status"]
          updated_at: string
          vehicle_type_id: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          id?: string
          notes?: string | null
          pickup_at: string
          pickup_loc_id: string
          return_at: string
          return_loc_id: string
          rfq_no: string
          salesperson_id?: string | null
          status?: Database["public"]["Enums"]["rfq_status"]
          updated_at?: string
          vehicle_type_id?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          id?: string
          notes?: string | null
          pickup_at?: string
          pickup_loc_id?: string
          return_at?: string
          return_loc_id?: string
          rfq_no?: string
          salesperson_id?: string | null
          status?: Database["public"]["Enums"]["rfq_status"]
          updated_at?: string
          vehicle_type_id?: string | null
        }
        Relationships: []
      }
      sales_offices: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      sales_representatives: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_active: boolean | null
          sales_office_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          sales_office_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          sales_office_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_representatives_sales_office_id_fkey"
            columns: ["sales_office_id"]
            isOneToOne: false
            referencedRelation: "sales_offices"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_billing_history: {
        Row: {
          actual_km: number | null
          admin_fees: number | null
          base_monthly_fee: number
          billing_period_end: string
          billing_period_start: string
          billing_status: string | null
          created_at: string
          excess_km: number | null
          excess_km_charges: number | null
          fine_charges: number | null
          id: string
          included_km: number
          invoice_id: string | null
          other_charges: number | null
          salik_darb_charges: number | null
          subscription_id: string
          subtotal: number
          total_amount: number
          vat_amount: number
        }
        Insert: {
          actual_km?: number | null
          admin_fees?: number | null
          base_monthly_fee: number
          billing_period_end: string
          billing_period_start: string
          billing_status?: string | null
          created_at?: string
          excess_km?: number | null
          excess_km_charges?: number | null
          fine_charges?: number | null
          id?: string
          included_km: number
          invoice_id?: string | null
          other_charges?: number | null
          salik_darb_charges?: number | null
          subscription_id: string
          subtotal: number
          total_amount: number
          vat_amount: number
        }
        Update: {
          actual_km?: number | null
          admin_fees?: number | null
          base_monthly_fee?: number
          billing_period_end?: string
          billing_period_start?: string
          billing_status?: string | null
          created_at?: string
          excess_km?: number | null
          excess_km_charges?: number | null
          fine_charges?: number | null
          id?: string
          included_km?: number
          invoice_id?: string | null
          other_charges?: number | null
          salik_darb_charges?: number | null
          subscription_id?: string
          subtotal?: number
          total_amount?: number
          vat_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "subscription_billing_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "car_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_kyc_documents: {
        Row: {
          created_at: string
          document_type: string
          document_url: string
          expiry_date: string | null
          id: string
          subscription_id: string
        }
        Insert: {
          created_at?: string
          document_type: string
          document_url: string
          expiry_date?: string | null
          id?: string
          subscription_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          document_url?: string
          expiry_date?: string | null
          id?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_kyc_documents_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "car_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_primary_drivers: {
        Row: {
          created_at: string
          driver_name: string
          email: string | null
          id: string
          mobile: string | null
          subscription_id: string
        }
        Insert: {
          created_at?: string
          driver_name: string
          email?: string | null
          id?: string
          mobile?: string | null
          subscription_id: string
        }
        Update: {
          created_at?: string
          driver_name?: string
          email?: string | null
          id?: string
          mobile?: string | null
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_primary_drivers_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "car_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_swap_history: {
        Row: {
          condition_report_in: Json | null
          condition_report_out: Json | null
          created_at: string
          created_by: string | null
          fuel_level_in: string | null
          fuel_level_out: string | null
          id: string
          new_vehicle_id: string | null
          odometer_in: number | null
          odometer_out: number | null
          old_vehicle_id: string | null
          subscription_id: string
          swap_date: string
          swap_reason: string | null
          upgrade_fee: number | null
        }
        Insert: {
          condition_report_in?: Json | null
          condition_report_out?: Json | null
          created_at?: string
          created_by?: string | null
          fuel_level_in?: string | null
          fuel_level_out?: string | null
          id?: string
          new_vehicle_id?: string | null
          odometer_in?: number | null
          odometer_out?: number | null
          old_vehicle_id?: string | null
          subscription_id: string
          swap_date: string
          swap_reason?: string | null
          upgrade_fee?: number | null
        }
        Update: {
          condition_report_in?: Json | null
          condition_report_out?: Json | null
          created_at?: string
          created_by?: string | null
          fuel_level_in?: string | null
          fuel_level_out?: string | null
          id?: string
          new_vehicle_id?: string | null
          odometer_in?: number | null
          odometer_out?: number | null
          old_vehicle_id?: string | null
          subscription_id?: string
          swap_date?: string
          swap_reason?: string | null
          upgrade_fee?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_swap_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "car_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_usage_tracking: {
        Row: {
          created_at: string
          id: string
          km_driven: number | null
          location_data: Json | null
          odometer_reading: number | null
          salik_darb_amount: number | null
          salik_darb_events: number | null
          subscription_id: string
          tracking_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          km_driven?: number | null
          location_data?: Json | null
          odometer_reading?: number | null
          salik_darb_amount?: number | null
          salik_darb_events?: number | null
          subscription_id: string
          tracking_date: string
        }
        Update: {
          created_at?: string
          id?: string
          km_driven?: number | null
          location_data?: Json | null
          odometer_reading?: number | null
          salik_darb_amount?: number | null
          salik_darb_events?: number | null
          subscription_id?: string
          tracking_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_usage_tracking_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "car_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          customer_id: string
          id: string
          message: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          ticket_no: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category: string
          created_at?: string
          customer_id: string
          id?: string
          message: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          ticket_no: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          customer_id?: string
          id?: string
          message?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          ticket_no?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      traffic_tickets: {
        Row: {
          agreement_id: string | null
          court_date: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          fine_amount: number
          id: string
          notes: string | null
          status: string | null
          ticket_date: string
          updated_at: string
          vehicle_id: string | null
          violation_type: string
        }
        Insert: {
          agreement_id?: string | null
          court_date?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          fine_amount: number
          id?: string
          notes?: string | null
          status?: string | null
          ticket_date: string
          updated_at?: string
          vehicle_id?: string | null
          violation_type: string
        }
        Update: {
          agreement_id?: string | null
          court_date?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          fine_amount?: number
          id?: string
          notes?: string | null
          status?: string | null
          ticket_date?: string
          updated_at?: string
          vehicle_id?: string | null
          violation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "traffic_tickets_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "agreements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traffic_tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traffic_tickets_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          permissions: Json | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permissions?: Json | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_exchanges: {
        Row: {
          agreement_id: string
          created_at: string
          created_by: string | null
          exchange_at: string
          fees_added: Json | null
          fuel_in_old: number
          fuel_out_new: number
          id: string
          line_id: string
          new_out_location_id: string | null
          new_vehicle_id: string
          notes: string | null
          odometer_in_old: number
          odometer_out_new: number
          old_vehicle_id: string
          photos: Json | null
          return_to_location_id: string | null
          segment_a: Json
          segment_b: Json
          updated_at: string
        }
        Insert: {
          agreement_id: string
          created_at?: string
          created_by?: string | null
          exchange_at: string
          fees_added?: Json | null
          fuel_in_old: number
          fuel_out_new: number
          id?: string
          line_id: string
          new_out_location_id?: string | null
          new_vehicle_id: string
          notes?: string | null
          odometer_in_old: number
          odometer_out_new: number
          old_vehicle_id: string
          photos?: Json | null
          return_to_location_id?: string | null
          segment_a: Json
          segment_b: Json
          updated_at?: string
        }
        Update: {
          agreement_id?: string
          created_at?: string
          created_by?: string | null
          exchange_at?: string
          fees_added?: Json | null
          fuel_in_old?: number
          fuel_out_new?: number
          id?: string
          line_id?: string
          new_out_location_id?: string | null
          new_vehicle_id?: string
          notes?: string | null
          odometer_in_old?: number
          odometer_out_new?: number
          old_vehicle_id?: string
          photos?: Json | null
          return_to_location_id?: string | null
          segment_a?: Json
          segment_b?: Json
          updated_at?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          category_id: string | null
          color: string | null
          created_at: string
          daily_rate: number | null
          engine_size: string | null
          features: string[] | null
          fuel_level: number | null
          id: string
          insurance_expiry: string | null
          item_code: string | null
          item_description: string | null
          license_expiry: string | null
          license_plate: string
          location: string | null
          make: string
          model: string
          monthly_rate: number | null
          odometer: number | null
          ownership_type: string | null
          photo_url: string | null
          status: Database["public"]["Enums"]["vehicle_status"]
          subtype: string | null
          transmission: string | null
          updated_at: string
          vin: string
          weekly_rate: number | null
          year: number
        }
        Insert: {
          category_id?: string | null
          color?: string | null
          created_at?: string
          daily_rate?: number | null
          engine_size?: string | null
          features?: string[] | null
          fuel_level?: number | null
          id?: string
          insurance_expiry?: string | null
          item_code?: string | null
          item_description?: string | null
          license_expiry?: string | null
          license_plate: string
          location?: string | null
          make: string
          model: string
          monthly_rate?: number | null
          odometer?: number | null
          ownership_type?: string | null
          photo_url?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          subtype?: string | null
          transmission?: string | null
          updated_at?: string
          vin: string
          weekly_rate?: number | null
          year: number
        }
        Update: {
          category_id?: string | null
          color?: string | null
          created_at?: string
          daily_rate?: number | null
          engine_size?: string | null
          features?: string[] | null
          fuel_level?: number | null
          id?: string
          insurance_expiry?: string | null
          item_code?: string | null
          item_description?: string | null
          license_expiry?: string | null
          license_plate?: string
          location?: string | null
          make?: string
          model?: string
          monthly_rate?: number | null
          odometer?: number | null
          ownership_type?: string | null
          photo_url?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          subtype?: string | null
          transmission?: string | null
          updated_at?: string
          vin?: string
          weekly_rate?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      agreement_has_locked_in_inspection: {
        Args: { agreement_id_param: string }
        Returns: boolean
      }
      agreement_has_locked_out_inspection: {
        Args: { agreement_id_param: string }
        Returns: boolean
      }
      generate_agreement_no: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_corporate_lease_no: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_cost_sheet_no: {
        Args: { p_quote_id: string; p_version: number }
        Returns: string
      }
      generate_reservation_no: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_rfq_no: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_subscription_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_ticket_no: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_vehicle_item_code: {
        Args: {
          p_category: string
          p_color: string
          p_make: string
          p_model: string
          p_year: number
        }
        Returns: string
      }
      generate_vehicle_item_description: {
        Args: {
          p_category: string
          p_color: string
          p_make: string
          p_model: string
          p_year: number
        }
        Returns: string
      }
    }
    Enums: {
      agreement_status: "active" | "completed" | "terminated" | "pending_return"
      billing_cycle: "Monthly"
      billing_day: "1st" | "15th" | "Month-End" | "Anniversary"
      billing_day_type: "Anniversary" | "1st" | "15th"
      booking_type: "INSTANT" | "STANDARD"
      cancellation_notice: "0" | "7" | "14" | "30"
      car_subscription_status:
        | "draft"
        | "active"
        | "suspended"
        | "cancelled"
        | "expired"
      condition_report_cadence:
        | "On start"
        | "On swap"
        | "Monthly"
        | "On start and swap"
      contract_term:
        | "12 months"
        | "24 months"
        | "36 months"
        | "48 months"
        | "Open-ended"
      corporate_lease_status:
        | "draft"
        | "pending_approval"
        | "active"
        | "suspended"
        | "terminated"
        | "expired"
      cost_allocation_mode: "Per Vehicle" | "Per Cost Center" | "Project"
      cost_sheet_approval_action: "approved" | "rejected" | "requested_changes"
      cost_sheet_status: "draft" | "pending_approval" | "approved" | "rejected"
      credit_terms: "Net 15" | "Net 30" | "Net 45" | "Custom"
      customer_segment: "SME" | "Enterprise" | "Government"
      customer_type: "Company" | "Person"
      damage_type:
        | "scratch"
        | "dent"
        | "crack"
        | "missing_part"
        | "interior_damage"
        | "other"
      early_cancellation_fee_type: "None" | "Fixed AED" | "% of remaining month"
      final_billing_type: "Pro-rata" | "Full month"
      framework_model: "Rate Card by Class" | "Fixed Rate per VIN"
      geo_restrictions: "UAE-only" | "GCC Allowed" | "Off-road Prohibited"
      insurance_responsibility: "Included (Lessor)" | "Customer Own Policy"
      insurance_type: "Comprehensive" | "Basic" | "Customer's Own"
      invoice_format: "Consolidated" | "Per Vehicle" | "Per Cost Center"
      line_item_granularity:
        | "Base Rent"
        | "Base Rent + Add-ons"
        | "Base Rent + Add-ons + Variable"
      maintenance_inclusion: "Included" | "Excluded"
      maintenance_policy: "Basic PM" | "Full (PM+wear)" | "Customer"
      maintenance_trigger: "Every X km" | "Every Y months" | "Both (first due)"
      mileage_rollover: "No" | "Yes"
      minimum_commitment: "None" | "1" | "3" | "6"
      payment_method_type:
        | "Card Autopay"
        | "Direct Debit"
        | "Invoice (Corporate)"
      payment_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "refunded"
      preferred_workshop: "OEM" | "In-house" | "Partner"
      renewal_cycle: "Monthly (anniversary)" | "3-Monthly"
      rental_type: "Corporate Leasing"
      replacement_sla_unit: "Hours" | "Days"
      reservation_status:
        | "pending"
        | "confirmed"
        | "checked_out"
        | "completed"
        | "cancelled"
      rfq_status: "new" | "under_review" | "quoted" | "cancelled"
      salik_handling: "Rebill Actual" | "Included Allowance"
      security_instrument: "None" | "Deposit per Vehicle" | "Bank Guarantee"
      subscription_model: "By Class" | "By Specific VIN"
      subscription_plan: "Essential" | "Standard" | "Premium" | "Custom"
      suspension_behavior: "Disallow driving" | "Notice only"
      swap_frequency: "1 per month" | "1 per quarter" | "None"
      swap_request_flow: "Self-service App" | "Call Center" | "Branch"
      user_role:
        | "admin"
        | "fleet_manager"
        | "rental_agent"
        | "customer"
        | "maintenance"
        | "finance"
      vehicle_status:
        | "available"
        | "rented"
        | "maintenance"
        | "out_of_service"
        | "reserved"
      vehicle_swap_rules: "Same class" | "Up to +1 class (fee)"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agreement_status: ["active", "completed", "terminated", "pending_return"],
      billing_cycle: ["Monthly"],
      billing_day: ["1st", "15th", "Month-End", "Anniversary"],
      billing_day_type: ["Anniversary", "1st", "15th"],
      booking_type: ["INSTANT", "STANDARD"],
      cancellation_notice: ["0", "7", "14", "30"],
      car_subscription_status: [
        "draft",
        "active",
        "suspended",
        "cancelled",
        "expired",
      ],
      condition_report_cadence: [
        "On start",
        "On swap",
        "Monthly",
        "On start and swap",
      ],
      contract_term: [
        "12 months",
        "24 months",
        "36 months",
        "48 months",
        "Open-ended",
      ],
      corporate_lease_status: [
        "draft",
        "pending_approval",
        "active",
        "suspended",
        "terminated",
        "expired",
      ],
      cost_allocation_mode: ["Per Vehicle", "Per Cost Center", "Project"],
      cost_sheet_approval_action: ["approved", "rejected", "requested_changes"],
      cost_sheet_status: ["draft", "pending_approval", "approved", "rejected"],
      credit_terms: ["Net 15", "Net 30", "Net 45", "Custom"],
      customer_segment: ["SME", "Enterprise", "Government"],
      customer_type: ["Company", "Person"],
      damage_type: [
        "scratch",
        "dent",
        "crack",
        "missing_part",
        "interior_damage",
        "other",
      ],
      early_cancellation_fee_type: [
        "None",
        "Fixed AED",
        "% of remaining month",
      ],
      final_billing_type: ["Pro-rata", "Full month"],
      framework_model: ["Rate Card by Class", "Fixed Rate per VIN"],
      geo_restrictions: ["UAE-only", "GCC Allowed", "Off-road Prohibited"],
      insurance_responsibility: ["Included (Lessor)", "Customer Own Policy"],
      insurance_type: ["Comprehensive", "Basic", "Customer's Own"],
      invoice_format: ["Consolidated", "Per Vehicle", "Per Cost Center"],
      line_item_granularity: [
        "Base Rent",
        "Base Rent + Add-ons",
        "Base Rent + Add-ons + Variable",
      ],
      maintenance_inclusion: ["Included", "Excluded"],
      maintenance_policy: ["Basic PM", "Full (PM+wear)", "Customer"],
      maintenance_trigger: ["Every X km", "Every Y months", "Both (first due)"],
      mileage_rollover: ["No", "Yes"],
      minimum_commitment: ["None", "1", "3", "6"],
      payment_method_type: [
        "Card Autopay",
        "Direct Debit",
        "Invoice (Corporate)",
      ],
      payment_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
      ],
      preferred_workshop: ["OEM", "In-house", "Partner"],
      renewal_cycle: ["Monthly (anniversary)", "3-Monthly"],
      rental_type: ["Corporate Leasing"],
      replacement_sla_unit: ["Hours", "Days"],
      reservation_status: [
        "pending",
        "confirmed",
        "checked_out",
        "completed",
        "cancelled",
      ],
      rfq_status: ["new", "under_review", "quoted", "cancelled"],
      salik_handling: ["Rebill Actual", "Included Allowance"],
      security_instrument: ["None", "Deposit per Vehicle", "Bank Guarantee"],
      subscription_model: ["By Class", "By Specific VIN"],
      subscription_plan: ["Essential", "Standard", "Premium", "Custom"],
      suspension_behavior: ["Disallow driving", "Notice only"],
      swap_frequency: ["1 per month", "1 per quarter", "None"],
      swap_request_flow: ["Self-service App", "Call Center", "Branch"],
      user_role: [
        "admin",
        "fleet_manager",
        "rental_agent",
        "customer",
        "maintenance",
        "finance",
      ],
      vehicle_status: [
        "available",
        "rented",
        "maintenance",
        "out_of_service",
        "reserved",
      ],
      vehicle_swap_rules: ["Same class", "Up to +1 class (fee)"],
    },
  },
} as const
