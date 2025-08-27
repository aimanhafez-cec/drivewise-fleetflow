import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar,
  ChevronLeft, 
  ChevronRight,
  Filter,
  RotateCcw,
  Plus,
  Clock,
  Users,
  AlertTriangle,
  Car,
  Wrench
} from "lucide-react";
import { format, addDays, startOfToday, startOfWeek, startOfMonth, endOfMonth, endOfWeek } from "date-fns";
import { PlannerFilters } from "@/components/planner/PlannerFilters";
import { PlannerKPIs } from "@/components/planner/PlannerKPIs";
import { CalendarView } from "@/components/planner/CalendarView";
import { ResourceView } from "@/components/planner/ResourceView";
import { EventLegend } from "@/components/planner/EventLegend";
import { NewReservationModal } from "@/components/planner/NewReservationModal";
import { ConflictDialog } from "@/components/planner/ConflictDialog";

type ViewType = "month" | "week" | "day";

interface PlannerEvent {
  id: string;
  kind: "RESERVATION" | "AGREEMENT" | "HOLD" | "MAINTENANCE";
  status: string;
  vehicleId?: string;
  vehicleLabel?: string;
  classId?: string;
  locationId?: string;
  start: string;
  end: string;
  customer?: string;
  origin?: string;
  destination?: string;
  shortNo?: string;
  actions: string[];
}

const DailyPlanner: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [view, setView] = useState<ViewType>(() => 
    (searchParams.get("view") as ViewType) || "week"
  );
  const [resourceMode, setResourceMode] = useState(false);
  const [showNewReservationModal, setShowNewReservationModal] = useState(false);
  const [newReservationPrefill, setNewReservationPrefill] = useState<any>(null);
  const [conflictDialog, setConflictDialog] = useState<any>(null);
  const [filters, setFilters] = useState({
    vehicleClass: searchParams.get("class") || "",
    customer: searchParams.get("customer") || "",
    locations: searchParams.get("locations")?.split(",") || [],
    status: searchParams.get("status")?.split(",") || [],
    dateRange: {
      from: searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined,
      to: searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined,
    }
  });

  useEffect(() => {
    document.title = "Daily Planner | Core Car Rental";
  }, []);

  // Calculate date range based on current view
  const dateRange = useMemo(() => {
    switch (view) {
      case "month":
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate)
        };
      case "week":
        return {
          start: startOfWeek(currentDate),
          end: endOfWeek(currentDate)
        };
      case "day":
        return {
          start: currentDate,
          end: currentDate
        };
      default:
        return {
          start: currentDate,
          end: addDays(currentDate, 1)
        };
    }
  }, [currentDate, view]);

  // Fetch planner events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["planner-events", dateRange.start.toISOString(), dateRange.end.toISOString(), filters],
    queryFn: async () => {
      // Build reservations query with filters
      let reservationsQuery = supabase
        .from("reservations")
        .select(`
          id, status, start_datetime, end_datetime, pickup_location, return_location, ro_number,
          customers!inner(full_name),
          vehicles(id, category_id, categories(name))
        `)
        .gte("start_datetime", dateRange.start.toISOString())
        .lte("start_datetime", dateRange.end.toISOString());

      // Apply vehicle class filter
      if (filters.vehicleClass) {
        reservationsQuery = reservationsQuery.eq("vehicles.category_id", filters.vehicleClass);
      }

      // Apply customer filter (search by name)
      if (filters.customer) {
        reservationsQuery = reservationsQuery.ilike("customers.full_name", `%${filters.customer}%`);
      }

      // Apply status filter
      if (filters.status.length > 0) {
        reservationsQuery = reservationsQuery.in("status", filters.status as any);
      }

      // Apply locations filter
      if (filters.locations.length > 0) {
        reservationsQuery = reservationsQuery.or(
          filters.locations.map(loc => `pickup_location.eq.${loc},return_location.eq.${loc}`).join(',')
        );
      }

      // Build agreements query with filters
      let agreementsQuery = supabase
        .from("agreements")
        .select(`
          id, status, checkout_datetime, return_datetime, agreement_no,
          customers!inner(full_name),
          vehicles(id, category_id, categories(name))
        `)
        .gte("checkout_datetime", dateRange.start.toISOString())
        .lte("checkout_datetime", dateRange.end.toISOString());

      // Apply vehicle class filter to agreements
      if (filters.vehicleClass) {
        agreementsQuery = agreementsQuery.eq("vehicles.category_id", filters.vehicleClass);
      }

      // Apply customer filter to agreements
      if (filters.customer) {
        agreementsQuery = agreementsQuery.ilike("customers.full_name", `%${filters.customer}%`);
      }

      // Apply status filter to agreements
      if (filters.status.length > 0) {
        agreementsQuery = agreementsQuery.in("status", filters.status as any);
      }

      const [reservationsResult, agreementsResult] = await Promise.all([
        reservationsQuery,
        agreementsQuery
      ]);

      const plannerEvents: PlannerEvent[] = [];

      // Convert reservations
      if (reservationsResult.data) {
        reservationsResult.data.forEach(res => {
          plannerEvents.push({
            id: res.id,
            kind: "RESERVATION",
            status: res.status,
            start: res.start_datetime,
            end: res.end_datetime,
            customer: res.customers?.full_name,
            origin: res.pickup_location,
            destination: res.return_location,
            shortNo: res.ro_number?.slice(-4) || res.id.slice(0, 4),
            actions: ["OPEN", "CONVERT", "ASSIGN", "CANCEL"]
          });
        });
      }

      // Convert agreements
      if (agreementsResult.data) {
        agreementsResult.data.forEach(agr => {
          if (agr.checkout_datetime && agr.return_datetime) {
            plannerEvents.push({
              id: agr.id,
              kind: "AGREEMENT",
              status: agr.status,
              start: agr.checkout_datetime,
              end: agr.return_datetime,
              customer: agr.customers?.full_name,
              shortNo: agr.agreement_no?.slice(-4) || agr.id.slice(0, 4),
              actions: ["OPEN", "CHECK_OUT", "CHECK_IN", "CANCEL"]
            });
          }
        });
      }

      return plannerEvents;
    },
  });

  const navigateDate = (direction: "prev" | "next" | "today") => {
    if (direction === "today") {
      setCurrentDate(new Date());
    } else {
      const delta = direction === "next" ? 1 : -1;
      setCurrentDate(prev => {
        switch (view) {
          case "month":
            return new Date(prev.getFullYear(), prev.getMonth() + delta, 1);
          case "week":
            return addDays(prev, delta * 7);
          case "day":
            return addDays(prev, delta);
          default:
            return prev;
        }
      });
    }
  };

  const updateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    // Update URL params
    const params = new URLSearchParams();
    if (newFilters.vehicleClass) params.set("class", newFilters.vehicleClass);
    if (newFilters.customer) params.set("customer", newFilters.customer);
    if (newFilters.locations.length) params.set("locations", newFilters.locations.join(","));
    if (newFilters.status.length) params.set("status", newFilters.status.join(","));
    if (newFilters.dateRange.from) params.set("from", newFilters.dateRange.from.toISOString());
    if (newFilters.dateRange.to) params.set("to", newFilters.dateRange.to.toISOString());
    params.set("view", view);
    setSearchParams(params);
  };

  const resetFilters = () => {
    const emptyFilters = {
      vehicleClass: "",
      customer: "",
      locations: [],
      status: [],
      dateRange: { from: undefined, to: undefined }
    };
    updateFilters(emptyFilters);
  };

  const handleSearch = () => {
    console.log("Search button clicked! Invalidating queries...");
    // Invalidate and refetch the planner events query
    queryClient.invalidateQueries({ queryKey: ["planner-events"] });
    toast({
      title: "Search triggered",
      description: "Refreshing planner data..."
    });
  };

  const formatDateHeader = () => {
    switch (view) {
      case "month":
        return format(currentDate, "MMMM yyyy");
      case "week":
        return `${format(dateRange.start, "MMM d")} - ${format(dateRange.end, "MMM d, yyyy")}`;
      case "day":
        return format(currentDate, "EEEE, MMMM d, yyyy");
      default:
        return format(currentDate, "MMMM yyyy");
    }
  };

  // Event action handlers
  const handleEventAction = async (action: string, eventId: string) => {
    try {
      switch (action) {
        case "OPEN":
          // Navigate to details page
          const event = events.find(e => e.id === eventId);
          if (event) {
            if (event.kind === "RESERVATION") {
              navigate(`/reservations/${eventId}`);
            } else if (event.kind === "AGREEMENT") {
              navigate(`/agreements/${eventId}`);
            }
          }
          break;
        case "CONVERT":
          // Convert reservation to agreement - using mock for now
          console.log("Converting reservation to agreement:", eventId);
          toast({
            title: "Success",
            description: "Reservation converted to agreement successfully"
          });
          break;
        case "CHECK_OUT":
        case "CHECK_IN":
          // Navigate to check-out/check-in flow
          navigate(`/agreements/${eventId}`, { state: { action } });
          break;
        case "ASSIGN":
          // Open vehicle assignment modal
          toast({
            title: "Vehicle Assignment",
            description: "Vehicle assignment feature coming soon"
          });
          break;
        case "CANCEL":
          // Cancel reservation/agreement
          if (confirm("Are you sure you want to cancel this item?")) {
            // Implement cancellation logic
            toast({
              title: "Cancelled",
              description: "Item cancelled successfully"
            });
          }
          break;
      }
    } catch (error) {
      console.error("Error handling event action:", error);
      toast({
        title: "Error",
        description: "Failed to perform action",
        variant: "destructive"
      });
    }
  };

  const handleCreateEvent = (date: Date, vehicleId?: string) => {
    setNewReservationPrefill({
      startDateTime: date,
      endDateTime: new Date(date.getTime() + 24 * 60 * 60 * 1000),
      vehicleId,
      location: "airport" // Default location
    });
    setShowNewReservationModal(true);
  };

  const handleEventMove = async (eventId: string, newStart: Date, newEnd: Date, newVehicleId?: string) => {
    // Mock API call - implement conflict checking
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock conflict detection (30% chance)
      if (Math.random() < 0.3) {
        throw {
          status: 409,
          data: {
            cause: "Vehicle is already booked during this time period",
            overlappingEvents: [
              {
                id: "conflict_1",
                kind: "RESERVATION",
                status: "confirmed",
                customer: "John Doe",
                shortNo: "R123",
                start: newStart.toISOString(),
                end: newEnd.toISOString(),
                vehicleLabel: "Toyota Camry • ABC123"
              }
            ],
            suggestions: [
              { vehicleId: "alt_1", vehicleLabel: "Honda Accord • DEF456", available: true },
              { vehicleId: "alt_2", vehicleLabel: "Nissan Altima • GHI789", available: true }
            ]
          }
        };
      }

      toast({
        title: "Event Moved",
        description: "Event successfully moved to new time slot"
      });
    } catch (error: any) {
      if (error.status === 409) {
        throw error; // Let useDragAndDrop handle conflicts
      }
      throw error;
    }
  };

  const handleConflictDetected = (conflicts: any) => {
    setConflictDialog({
      open: true,
      conflictDetails: conflicts
    });
  };

  const handleNewReservationSubmit = async (data: any) => {
    try {
      // Mock reservation creation
      console.log("Creating reservation:", data);
      
      toast({
        title: "Success",
        description: "New reservation created successfully"
      });
    } catch (error) {
      console.error("Error creating reservation:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">Daily Planner</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Schedule and manage vehicle reservations and agreements</p>
        </div>
        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Filter className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Saved Views</span>
            <span className="sm:hidden">Views</span>
          </Button>
          <Button onClick={() => setShowNewReservationModal(true)} size="sm" className="flex-1 sm:flex-none">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">New Reservation</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Legend */}
      <EventLegend />

      {/* Filters */}
      <PlannerFilters 
        filters={filters}
        onFiltersChange={updateFilters}
        onReset={resetFilters}
        onSearch={handleSearch}
      />

      {/* KPIs */}
      <PlannerKPIs events={events} />

      {/* Calendar Controls */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <Tabs value={view} onValueChange={(v) => setView(v as ViewType)}>
                <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                  <TabsTrigger value="month" data-testid="view-month">Month</TabsTrigger>
                  <TabsTrigger value="week" data-testid="view-week">Week</TabsTrigger>
                  <TabsTrigger value="day" data-testid="view-day">Day</TabsTrigger>
                </TabsList>
              </Tabs>

              {(view === "week" || view === "day") && (
                <Button
                  variant={resourceMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setResourceMode(!resourceMode)}
                  data-testid="toggle-resource"
                  className="w-full sm:w-auto"
                >
                  <Car className="mr-2 h-4 w-4" />
                  Resource View
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate("today")}
                data-testid="btn-today"
                className="flex-1 sm:flex-none"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate("prev")}
                data-testid="btn-prev"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate("next")}
                data-testid="btn-next"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="text-lg sm:text-xl font-semibold truncate">{formatDateHeader()}</div>
        </CardHeader>

        <CardContent className="min-w-0 overflow-hidden">
          {resourceMode && (view === "week" || view === "day") ? (
            <ResourceView 
              events={events}
              dateRange={dateRange}
              view={view}
              isLoading={isLoading}
              onEventAction={handleEventAction}
              onCreateEvent={handleCreateEvent}
              onEventMove={handleEventMove}
              onConflictDetected={handleConflictDetected}
            />
          ) : (
            <CalendarView 
              events={events}
              dateRange={dateRange}
              view={view}
              currentDate={currentDate}
              isLoading={isLoading}
              onEventAction={handleEventAction}
              onCreateEvent={handleCreateEvent}
              onEventMove={handleEventMove}
              onConflictDetected={handleConflictDetected}
            />
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <NewReservationModal
        open={showNewReservationModal}
        onOpenChange={setShowNewReservationModal}
        prefillData={newReservationPrefill}
        onSubmit={handleNewReservationSubmit}
      />

      <ConflictDialog
        open={conflictDialog?.open || false}
        onOpenChange={(open) => setConflictDialog(open ? conflictDialog : null)}
        conflictDetails={conflictDialog?.conflictDetails || null}
        onKeep={() => {
          toast({ title: "Changes Kept", description: "Event moved despite conflicts" });
          setConflictDialog(null);
        }}
        onUndo={() => {
          toast({ title: "Changes Undone", description: "Event returned to original position" });
          setConflictDialog(null);
        }}
        onSuggestionSelect={(vehicleId) => {
          toast({ title: "Vehicle Selected", description: "Event moved to suggested vehicle" });
          setConflictDialog(null);
        }}
      />
    </div>
  );
};

export default DailyPlanner;