import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to provide context based on current route
function getRouteContext(route: string): string {
  const routeContextMap: Record<string, string> = {
    '/dashboard': 'This is the main Dashboard showing KPIs, revenue metrics, daily planner, and quick access to critical actions. Help users understand the metrics and navigate to specific features.',
    '/reservations': 'This is the Reservations page where users can create, view, and manage customer reservations. Focus on reservation workflows, status management, and payment processing.',
    '/agreements': 'This is the Agreements page with two creation options: Quick Agreement (3-step) and Enhanced Wizard (9-step with inspection). Help with agreement lifecycle, extensions, and modifications.',
    '/vehicles': 'This is the Vehicles management page for fleet inventory, status tracking, maintenance, and documents. Focus on vehicle operations and status updates.',
    '/customers': 'This is the Customers page for managing individual and corporate profiles, verification, documents, and rental history. Help with customer onboarding and KYC processes.',
    '/inspections': 'This is the Inspections page for check-in/check-out procedures, damage documentation, and inspection reports. Focus on inspection workflows and documentation.',
    '/operations': 'This is the Operations hub for custody management, tolls/fines, compliance exceptions, and support tickets. Help with operational workflows and issue resolution.',
    '/payments': 'This is the Payments page for processing transactions, recording payments, handling refunds, and generating invoices. Focus on financial operations.',
    '/rfqs': 'This is the RFQ (Request for Quotation) page for creating, tracking, and converting RFQs to quotations. Help with the quotation workflow.',
    '/daily-planner': 'This is the Daily Planner showing today\'s check-ins, check-outs, and pending tasks. Focus on helping prioritize and complete daily operations.',
    '/reports': 'This is the Reports section for generating revenue, utilization, and customer analytics. Help with report generation and data interpretation.',
    '/settings': 'This is the Settings page for system configuration including instant booking, price lists, locations, and tax settings. Focus on configuration options.',
    '/master-agreements': 'This is the Master Agreements page for long-term corporate rental agreements. Help with corporate agreement management.',
    '/transactions': 'This is the Transactions page showing all financial transactions. Help with transaction tracking and reconciliation.',
    '/instant-booking': 'This is the Instant Booking portal for customer self-service reservations. Help with instant booking configuration and management.',
    '/instant-booking/new': 'This is the Instant Booking Wizard where customers or staff create instant bookings. You can help create bookings with natural language commands like "weekend [customer name]", "week [customer name]", or "month [customer name]". The wizard will auto-fill with smart defaults based on the customer\'s last booking.',
    '/manage-quotations': 'This is the Quotations management page for creating, tracking, and converting quotes to agreements. Focus on quotation workflows.',
    '/reservations/new': 'This is the New Reservation Wizard where staff create bookings for customers. You can help create bookings with natural language commands like "weekend [customer name]", "week [customer name]", or "month [customer name]". The wizard will auto-fill with smart defaults based on the customer\'s last booking.',
  };

  // Find matching route or return default
  for (const [path, context] of Object.entries(routeContextMap)) {
    if (route.startsWith(path)) {
      return context;
    }
  }

  return 'The user is on a page in the car rental management system. Provide general guidance based on their question.';
}

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

## Current Context
${currentRoute ? `The user is currently on: ${currentRoute}

${getRouteContext(currentRoute)}` : "No specific page context available."}

## Natural Language Booking Commands

**IMPORTANT: Only available on /instant-booking/new or /reservations/new pages.**

When the user is on the instant booking wizard (/instant-booking/new) or new reservation wizard (/reservations/new), you can help them create bookings using natural language:

**Supported Commands:**
- "weekend [customer name]" - Create a weekend booking (Fri-Sun) for the customer
- "week [customer name]" - Create a 1-week booking for the customer  
- "month [customer name]" - Create a 1-month booking for the customer

**Workflow:**
1. **Check Current Page**: If user tries a booking command but is NOT on /instant-booking/new or /reservations/new, respond: "To create a booking, please navigate to the Instant Booking page (/instant-booking/new) or Reservations page (/reservations/new) first. Would you like me to guide you there?"
2. **Parse Command**: Extract customer name and booking type (weekend/week/month)
3. **Search Customer**: Use "search_customer_by_name" tool to find the customer
4. **Handle Search Results**:
   - **Success (1 match)**: Use "create_quick_booking" tool with the appropriate booking type
   - **Customer Not Found**: "I couldn't find a customer named '[name]'. Would you like to create a new customer, or try a different search term?"
   - **Ambiguous Match (multiple results)**: List all matching customers with their phone/email and ask: "I found [X] customers matching '[name]'. Which one do you mean? [List names with distinguishing info]"
5. **Handle Booking Creation**:
   - **Success**: "The usual [booking type] booking for [customer name] has been created. Please proceed to the next step."
   - **Invalid Booking Type**: "I'm not sure what '[type]' booking means. I can create: weekend (Fri-Sun), week (7 days), or month (30 days) bookings. Which would you like?"
   - **Tool Failure**: "I ran into an issue creating the booking automatically. Would you like to create it manually, or should I try again?"
6. **Smart Defaults Note**: If customer has booking history, dates from the preset + their preferred vehicle class and locations will be pre-filled. If no history, system defaults are applied.

**Examples:**

✅ **Basic Weekend Booking:**
- User: "weekend Mohamed gamal"
  → Search → Found 1 match → Create booking → "The usual weekend booking for Mohamed gamal has been created. Please proceed to the next step."

✅ **Week Booking:**
- User: "book a week for Sarah Ahmed"  
  → Search → Found 1 match → Create 7-day booking → "The usual week booking for Sarah Ahmed has been created. Please proceed to the next step."

❌ **Customer Not Found:**
- User: "weekend John Nonexistent"
  → Search returns no results → "I couldn't find a customer named 'John Nonexistent'. Would you like to create a new customer, or try a different search term?"

⚠️ **Ambiguous Customer:**
- User: "weekend Mohammed"
  → Search returns multiple results → "I found 3 customers named 'Mohammed'. Which one do you mean?
    1. Mohammed Ali (050-123-4567, mohammed.ali@email.com)
    2. Mohammed Hassan (050-234-5678, m.hassan@email.com)
    3. Mohammed Gamal (050-345-6789, gamal.m@email.com)"

❌ **Invalid Booking Type:**
- User: "fortnight Ahmed Hassan"
  → Invalid type → "I'm not sure what 'fortnight' booking means. I can create: weekend (Fri-Sun), week (7 days), or month (30 days) bookings. Which would you like for Ahmed Hassan?"

❌ **Wrong Page:**
- User tries booking command on /dashboard
  → "To create a booking, please navigate to the Instant Booking page (/instant-booking/new) or Reservations page (/reservations/new) first. Would you like me to guide you there?"

**Error Recovery:**
- If tools fail, acknowledge the issue and suggest manual workflow
- If customer search is ambiguous, always provide distinguishing information (phone, email)
- If no booking history exists, reassure user that system defaults will be applied
- Always offer alternative solutions when automation fails

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
Current page context has been provided above.

## Response Guidelines
- ALWAYS prioritize helping with tasks on the current page first
- Provide clear, step-by-step instructions with specific navigation paths
- Reference the current page context in your responses when relevant
- Suggest best practices when relevant
- Ask clarifying questions if the request is ambiguous
- Keep answers concise but comprehensive
- Offer to explain features in more detail if needed
- Use markdown formatting for better readability (headers, lists, code blocks)

How can I help you today?`;

    // Define tools for booking commands
    const tools = [
      {
        type: "function",
        function: {
          name: "search_customer_by_name",
          description: "Search for a customer by their full name or partial name in the rental system",
          parameters: {
            type: "object",
            properties: {
              name: { 
                type: "string", 
                description: "Customer name to search for (full name or partial)" 
              }
            },
            required: ["name"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_quick_booking",
          description: "Create or pre-fill a booking with smart defaults based on booking type and customer history",
          parameters: {
            type: "object",
            properties: {
              customerId: { 
                type: "string", 
                description: "Customer UUID from the search results" 
              },
              customerName: { 
                type: "string", 
                description: "Customer full name for display purposes" 
              },
              bookingType: { 
                type: "string", 
                enum: ["weekend", "week", "month", "custom"],
                description: "Type of booking duration: weekend (Fri-Sun), week (7 days), month (30 days), or custom"
              },
              pickupDate: { 
                type: "string", 
                description: "ISO date string for pickup (optional, will use preset if not provided)" 
              },
              returnDate: { 
                type: "string", 
                description: "ISO date string for return (optional, will use preset if not provided)" 
              }
            },
            required: ["customerId", "customerName", "bookingType"]
          }
        }
      }
    ];

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
        tools: tools,
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
