import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { format, startOfTomorrow } from "date-fns";
import { cn } from "@/lib/utils";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
}

interface CustomerProfile {
  id: string; // profiles.id
  full_name: string;
  email: string;
}

interface LineItem {
  vehicleId: string;
  startDate?: Date;
  endDate?: Date;
  pickupLocation: string;
  returnLocation: string;
}

const ReservationsMulti: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // SEO minimal
  useEffect(() => {
    document.title = "Multi-Line Reservation | CEC Car Rental";
  }, []);

  const [customerId, setCustomerId] = useState<string>("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lines, setLines] = useState<LineItem[]>([
    { vehicleId: "", pickupLocation: "", returnLocation: "" },
  ]);

  const vehiclesQ = useQuery({
    queryKey: ["vehicles-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, make, model, year")
        .order("make");
      if (error) throw error;
      return (data || []) as Vehicle[];
    },
  });

  const customersQ = useQuery({
    queryKey: ["profiles-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name");
      if (error) throw error;
      return (data || []) as CustomerProfile[];
    },
  });

  const addLine = () => setLines((l) => [...l, { vehicleId: "", pickupLocation: "", returnLocation: "" }]);
  const removeLine = (idx: number) => setLines((l) => l.filter((_, i) => i !== idx));

  const updateLine = (idx: number, patch: Partial<LineItem>) => {
    setLines((prev) => prev.map((ln, i) => (i === idx ? { ...ln, ...patch } : ln)));
  };

  const validate = () => {
    if (!customerId) return "Select a customer";
    if (lines.length === 0) return "Add at least one line";
    for (let i = 0; i < lines.length; i++) {
      const ln = lines[i];
      if (!ln.vehicleId) return `Select vehicle for line ${i + 1}`;
      if (!ln.startDate || !ln.endDate) return `Pick dates for line ${i + 1}`;
      if (ln.startDate >= ln.endDate) return `End date must be after start date on line ${i + 1}`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast({ title: "Invalid form", description: err, variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      type ReservationInsert = import("@/integrations/supabase/types").Database["public"]["Tables"]["reservations"]["Insert"];
      const payload: ReservationInsert[] = lines.map((ln) => {
        const pickup = ln.pickupLocation || "Main Office";
        const ret = ln.returnLocation || pickup;
        return {
          customer_id: customerId,
          vehicle_id: ln.vehicleId || null,
          start_datetime: ln.startDate!.toISOString(),
          end_datetime: ln.endDate!.toISOString(),
          pickup_location: pickup,
          return_location: ret,
          status: "pending",
          special_requests: specialRequests || null,
        } as ReservationInsert;
      });

      const { error } = await supabase.from("reservations").insert(payload);
      if (error) throw error;

      toast({ title: "Success", description: `Created ${payload.length} reservations` });
      navigate("/reservations");
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to create", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate("/reservations")} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Multi‑Line Reservation</h1>
          <p className="text-muted-foreground">Create multiple reservations in a single flow</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Reservation Details</CardTitle>
            <CardDescription>Select a customer and add one or more vehicles and date ranges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Customer *</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customersQ.data?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.full_name} ({c.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requests">Special Requests</Label>
                <Textarea id="requests" value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} rows={3} placeholder="Any notes that apply to all lines" />
              </div>
            </div>

            <div className="space-y-4">
              {lines.map((ln, idx) => (
                <Card key={idx} className="border-dashed">
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label>Vehicle *</Label>
                        <Select value={ln.vehicleId} onValueChange={(v) => updateLine(idx, { vehicleId: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a vehicle" />
                          </SelectTrigger>
                          <SelectContent>
                            {vehiclesQ.data?.map((v) => (
                              <SelectItem key={v.id} value={v.id}>
                                {v.make} {v.model} ({v.year})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Start *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn("w-full justify-start text-left font-normal", !ln.startDate && "text-muted-foreground")}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {ln.startDate ? format(ln.startDate, "PPP") : <span>Pick date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={ln.startDate}
                              onSelect={(d) => updateLine(idx, { startDate: d || undefined })}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label>End *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn("w-full justify-start text-left font-normal", !ln.endDate && "text-muted-foreground")}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {ln.endDate ? format(ln.endDate, "PPP") : <span>Pick date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={ln.endDate}
                              onSelect={(d) => updateLine(idx, { endDate: d || undefined })}
                              disabled={(date) => date < (ln.startDate || new Date())}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Pickup Location</Label>
                        <Input value={ln.pickupLocation} onChange={(e) => updateLine(idx, { pickupLocation: e.target.value })} placeholder="e.g., Airport T1" />
                      </div>
                      <div className="space-y-2">
                        <Label>Return Location</Label>
                        <Input value={ln.returnLocation} onChange={(e) => updateLine(idx, { returnLocation: e.target.value })} placeholder="e.g., Downtown Office" />
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeLine(idx)} disabled={lines.length === 1}>
                        <Trash2 className="mr-2 h-4 w-4" /> Remove line
                      </Button>
                      {idx === lines.length - 1 && (
                        <Button type="button" variant="secondary" size="sm" onClick={addLine}>
                          <Plus className="mr-2 h-4 w-4" /> Add another vehicle
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate("/reservations")}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? "Creating..." : `Create ${lines.length} Reservation${lines.length > 1 ? "s" : ""}`}</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default ReservationsMulti;
