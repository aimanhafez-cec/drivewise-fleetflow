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
      quotes: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string
          id: string
          items: Json
          notes: string | null
          quote_number: string
          rfq_id: string | null
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string
          valid_until: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id: string
          id?: string
          items?: Json
          notes?: string | null
          quote_number: string
          rfq_id?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          valid_until?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string
          id?: string
          items?: Json
          notes?: string | null
          quote_number?: string
          rfq_id?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          valid_until?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
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
          auto_approved: boolean | null
          billing_address: Json | null
          booking_type: Database["public"]["Enums"]["booking_type"] | null
          converted_agreement_id: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          end_datetime: string
          id: string
          instant_booking_score: number | null
          pickup_location: string
          po_number: string | null
          rate_plan: Json | null
          referral_code: string | null
          return_location: string
          ro_number: string | null
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
          auto_approved?: boolean | null
          billing_address?: Json | null
          booking_type?: Database["public"]["Enums"]["booking_type"] | null
          converted_agreement_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          end_datetime: string
          id?: string
          instant_booking_score?: number | null
          pickup_location: string
          po_number?: string | null
          rate_plan?: Json | null
          referral_code?: string | null
          return_location: string
          ro_number?: string | null
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
          auto_approved?: boolean | null
          billing_address?: Json | null
          booking_type?: Database["public"]["Enums"]["booking_type"] | null
          converted_agreement_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          end_datetime?: string
          id?: string
          instant_booking_score?: number | null
          pickup_location?: string
          po_number?: string | null
          rate_plan?: Json | null
          referral_code?: string | null
          return_location?: string
          ro_number?: string | null
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
          license_expiry: string | null
          license_plate: string
          location: string | null
          make: string
          model: string
          monthly_rate: number | null
          odometer: number | null
          ownership_type: string | null
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
          license_expiry?: string | null
          license_plate: string
          location?: string | null
          make: string
          model: string
          monthly_rate?: number | null
          odometer?: number | null
          ownership_type?: string | null
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
          license_expiry?: string | null
          license_plate?: string
          location?: string | null
          make?: string
          model?: string
          monthly_rate?: number | null
          odometer?: number | null
          ownership_type?: string | null
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
      generate_reservation_no: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_rfq_no: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      agreement_status: "active" | "completed" | "terminated" | "pending_return"
      booking_type: "INSTANT" | "STANDARD"
      customer_type: "B2B" | "B2C" | "CORPORATE"
      damage_type:
        | "scratch"
        | "dent"
        | "crack"
        | "missing_part"
        | "interior_damage"
        | "other"
      payment_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "refunded"
      reservation_status:
        | "pending"
        | "confirmed"
        | "checked_out"
        | "completed"
        | "cancelled"
      rfq_status: "new" | "under_review" | "quoted" | "cancelled"
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
      booking_type: ["INSTANT", "STANDARD"],
      customer_type: ["B2B", "B2C", "CORPORATE"],
      damage_type: [
        "scratch",
        "dent",
        "crack",
        "missing_part",
        "interior_damage",
        "other",
      ],
      payment_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
      ],
      reservation_status: [
        "pending",
        "confirmed",
        "checked_out",
        "completed",
        "cancelled",
      ],
      rfq_status: ["new", "under_review", "quoted", "cancelled"],
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
    },
  },
} as const
