import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Plus, ListPlus } from "lucide-react";
import { format, addDays, startOfToday } from "date-fns";

interface Res {
  id: string;
  start_datetime: string;
  end_datetime: string;
  status: string;
  vehicle_id: string | null;
  customer_id: string;
}

const Planner: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Rental Daily Planner | CarRental Pro";
  }, []);

  const start = startOfToday();
  const end = addDays(start, 13);

  const { data: reservations = [] } = useQuery({
    queryKey: ["planner", start.toISOString(), end.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("id, start_datetime, end_datetime, status, vehicle_id, customer_id")
        .gte("start_datetime", start.toISOString())
        .lte("end_datetime", end.toISOString())
        .order("start_datetime");
      if (error) throw error;
      return (data || []) as Res[];
    },
  });

  const grouped = useMemo(() => {
    const map: Record<string, Res[]> = {};
    reservations.forEach((r) => {
      const key = format(new Date(r.start_datetime), "yyyy-MM-dd");
      map[key] = map[key] ? [...map[key], r] : [r];
    });
    return map;
  }, [reservations]);

  const days = Array.from({ length: 14 }).map((_, i) => addDays(start, i));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rental Daily Planner</h1>
          <p className="text-muted-foreground">Plan upcoming checkouts and returns; create or open reservations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/reservations/new")}> 
            <Plus className="mr-2 h-4 w-4" /> New Reservation
          </Button>
          <Button variant="secondary" onClick={() => navigate("/reservations/new-multi")}> 
            <ListPlus className="mr-2 h-4 w-4" /> Multi-Line
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Next 14 Days</CardTitle>
          <CardDescription>Click an entry to open reservations list</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {days.map((d) => {
            const key = format(d, "yyyy-MM-dd");
            const list = grouped[key] || [];
            return (
              <div key={key} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{format(d, "EEE, MMM d")}</span>
                </div>
                {list.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No reservations</p>
                ) : (
                  <ul className="space-y-2">
                    {list.map((r) => (
                      <li key={r.id}>
                        <button
                          className="w-full text-left text-sm hover:underline"
                          onClick={() => navigate("/reservations")}
                        >
                          #{r.id.slice(0, 8)} • {format(new Date(r.start_datetime), "p")} → {format(new Date(r.end_datetime), "p")} • {r.status}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default Planner;
