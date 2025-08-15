import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [view, setView] = useState<ViewType>(() => 
    (searchParams.get("view") as ViewType) || "week"
  );
  const [resourceMode, setResourceMode] = useState(false);
  const [filters, setFilters] = useState({
    vehicleClass: searchParams.get("class") || "",
    vehicleMake: searchParams.get("make") || "",
    vehicleModel: searchParams.get("model") || "",
    vehicleVin: searchParams.get("vin") || "",
    locations: searchParams.get("locations")?.split(",") || [],
    status: searchParams.get("status")?.split(",") || [],
    salesperson: searchParams.get("salesperson") || "",
    dateRange: {
      from: searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined,
      to: searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined,
    }
  });

  useEffect(() => {
    document.title = "Daily Planner | CarRental Pro";
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
      // For now, let's fetch from reservations and agreements
      const [reservationsResult, agreementsResult] = await Promise.all([
        supabase
          .from("reservations")
          .select(`
            id, status, start_datetime, end_datetime, pickup_location, return_location, ro_number,
            customers!inner(full_name)
          `)
          .gte("start_datetime", dateRange.start.toISOString())
          .lte("end_datetime", dateRange.end.toISOString()),
        supabase
          .from("agreements")
          .select(`
            id, status, checkout_datetime, return_datetime, agreement_no,
            customers!inner(full_name)
          `)
          .gte("checkout_datetime", dateRange.start.toISOString())
          .lte("return_datetime", dateRange.end.toISOString())
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
    if (newFilters.vehicleMake) params.set("make", newFilters.vehicleMake);
    if (newFilters.vehicleModel) params.set("model", newFilters.vehicleModel);
    if (newFilters.vehicleVin) params.set("vin", newFilters.vehicleVin);
    if (newFilters.locations.length) params.set("locations", newFilters.locations.join(","));
    if (newFilters.status.length) params.set("status", newFilters.status.join(","));
    if (newFilters.salesperson) params.set("salesperson", newFilters.salesperson);
    if (newFilters.dateRange.from) params.set("from", newFilters.dateRange.from.toISOString());
    if (newFilters.dateRange.to) params.set("to", newFilters.dateRange.to.toISOString());
    params.set("view", view);
    setSearchParams(params);
  };

  const resetFilters = () => {
    const emptyFilters = {
      vehicleClass: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleVin: "",
      locations: [],
      status: [],
      salesperson: "",
      dateRange: { from: undefined, to: undefined }
    };
    updateFilters(emptyFilters);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Planner</h1>
          <p className="text-muted-foreground">Schedule and manage vehicle reservations and agreements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Saved Views
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Reservation
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
      />

      {/* KPIs */}
      <PlannerKPIs events={events} />

      {/* Calendar Controls */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Tabs value={view} onValueChange={(v) => setView(v as ViewType)}>
                <TabsList>
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
                >
                  <Car className="mr-2 h-4 w-4" />
                  Resource View
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate("today")}
                data-testid="btn-today"
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

          <div className="text-xl font-semibold">{formatDateHeader()}</div>
        </CardHeader>

        <CardContent>
          {resourceMode && (view === "week" || view === "day") ? (
            <ResourceView 
              events={events}
              dateRange={dateRange}
              view={view}
              isLoading={isLoading}
            />
          ) : (
            <CalendarView 
              events={events}
              dateRange={dateRange}
              view={view}
              currentDate={currentDate}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyPlanner;