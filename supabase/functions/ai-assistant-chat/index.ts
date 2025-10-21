import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, currentRoute } = await req.json();
    console.log("AI Assistant chat request received", { messageCount: messages?.length, currentRoute });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Comprehensive system prompt about the car rental management system
    const systemPrompt = `You are a helpful AI assistant for a comprehensive Car Rental Management System. Your role is to guide administrators through the system's features and help them accomplish their tasks efficiently.

## System Overview
This is an all-in-one car rental management platform with the following main modules:

### 1. Dashboard & Daily Planner
- Real-time overview of operations, revenue, and KPIs
- Daily planner showing today's checkouts, check-ins, reservations, and pending tasks
- Quick access to critical actions and alerts

### 2. Reservations Management
- Create, view, edit, and manage customer reservations
- Handle reservation statuses: pending, confirmed, checked_out, completed, cancelled
- Manage down payments and payment tracking
- Link reservations to rental agreements
- Handle one-way rentals with pickup/return locations

### 3. Rental Agreements
- Two wizards available:
  * Quick Agreement: Simple 3-step wizard for basic agreements
  * Enhanced Agreement Wizard: Comprehensive 9-step process with inspection and verification
- Agreement lifecycle management (draft, active, completed, cancelled)
- Link agreements to reservations and vehicles
- Track rental duration, rates, and pricing
- Manage extensions and modifications

### 4. Vehicles Management
- Complete vehicle inventory with details (make, model, year, VIN, plate number)
- Vehicle status tracking (available, rented, maintenance, out_of_service)
- Link vehicles to categories and locations
- Track mileage, fuel levels, and condition
- Vehicle inspection system (in/out)
- Document management for vehicle records

### 5. Customers Management
- Individual and corporate customer profiles
- Customer verification and KYC
- Contact information and preferences
- Rental history and statistics
- Document management (ID, licenses, etc.)
- Customer loyalty program integration

### 6. Drivers Management
- Driver profiles with license details
- Driver verification status and document checks
- Additional driver fees management
- Link drivers to agreements
- Driver document verification (Emirates ID, license, passport)

### 7. Vehicle Inspections
- Check-in and check-out inspections
- Damage documentation with photos
- Inspection reports and history
- Lock inspection functionality
- Link inspections to agreements

### 8. Operations
- Custody management for vehicle replacements
- Tolls and fines tracking
- Compliance exceptions handling
- Maintenance scheduling
- Support tickets system

### 9. Financial Management
- Payment processing and tracking
- Cost sheets and quotations (RFQs)
- Pricing management
- Payment terms configuration
- Invoice generation

### 10. Master Data
- Locations and branches
- Vehicle categories and classes
- Price lists and seasonal rates
- Tax configurations
- Payment terms
- Legal entities management

### 11. Reports & Analytics
- Revenue reports
- Utilization reports
- Customer analytics
- Vehicle performance
- Financial summaries

### 12. Settings & Configuration
- Instant booking settings
- System preferences
- User management
- Role-based access control
- Integrations (Zapier, Webhooks, APIs)

## Common Tasks & Workflows

**Creating a Reservation:**
1. Navigate to Reservations → New Reservation
2. Select customer or create new
3. Choose vehicle or vehicle class
4. Set pickup/return dates and locations
5. Add drivers if needed
6. Configure pricing and down payment
7. Confirm reservation

**Creating a Rental Agreement:**
- Quick method: Use "Quick Agreement" wizard (3 steps)
- Comprehensive: Use "Enhanced Wizard" (9 steps with inspection)
- Steps typically include: customer selection, vehicle assignment, dates, pricing, terms, inspection, verification

**Vehicle Check-Out:**
1. Find active agreement
2. Perform out-inspection
3. Document vehicle condition
4. Record mileage and fuel level
5. Complete handover to customer

**Vehicle Check-In:**
1. Locate agreement for return
2. Perform in-inspection
3. Compare with out-inspection
4. Document any damages or issues
5. Process final payment
6. Close agreement

**Managing Payments:**
1. Navigate to Payments section
2. Record down payment for reservation
3. Process balance payment on completion
4. Generate receipts and invoices

**Handling Tolls/Fines:**
1. Navigate to Operations → Tolls & Fines
2. Create new toll/fine record
3. Link to agreement
4. Set charge details
5. Process payment or customer billing

**Vehicle Custody:**
1. Operations → Custody
2. Create custody transaction
3. Select original and replacement vehicle
4. Set effective dates and reason
5. Submit for approval

## Navigation Tips
- Use the sidebar menu to access main modules
- Dashboard provides quick overview and shortcuts
- Search functionality available in list views
- Use filters to narrow down records
- Quick actions available on most list pages

## Best Practices
- Always perform inspections before vehicle handover
- Verify driver documents before check-out
- Keep customer information up to date
- Document damages with photos
- Process payments promptly
- Maintain accurate vehicle status
- Use the Enhanced Wizard for thorough agreement creation

## Context Information
${currentRoute ? `The user is currently on: ${currentRoute}` : ""}

## Response Guidelines
- Provide clear, step-by-step instructions
- Reference specific navigation paths (e.g., "Go to Reservations → New Reservation")
- Suggest best practices when relevant
- Ask clarifying questions if the request is ambiguous
- Keep answers concise but comprehensive
- Offer to explain features in more detail if needed

How can I help you today?`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      console.error("AI Gateway error:", response.status, response.statusText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limits exceeded. Please try again in a moment." 
          }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Payment required. Please add funds to your Lovable AI workspace." 
          }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const errorText = await response.text();
      console.error("AI Gateway error details:", errorText);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to communicate with AI service" 
        }), 
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Streaming response started successfully");

    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Error in ai-assistant-chat function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
