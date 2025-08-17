import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

interface Vehicle { id: string; make: string; model: string; year: number }
interface Reservation { id: string }

const NewInspection: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => { document.title = "New Inspection | CEC Car Rental"; }, []);

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles-basic"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicles").select("id, make, model, year").order("make");
      if (error) throw error;
      return data as Vehicle[];
    }
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ["reservations-basic"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reservations").select("id").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data as Reservation[];
    }
  });

  const [vehicleId, setVehicleId] = useState("");
  const [reservationId, setReservationId] = useState("");
  const [odometer, setOdometer] = useState<string>("");
  const [fuel, setFuel] = useState<string>("");
  const [status, setStatus] = useState<string>("passed");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId) { toast({ title: "Missing vehicle", description: "Select a vehicle", variant: "destructive" }); return; }

    setIsLoading(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const performed_by = userRes?.user?.id || null;
      const payload = {
        vehicle_id: vehicleId,
        reservation_id: reservationId || null,
        odometer: odometer ? Number(odometer) : null,
        fuel_level: fuel ? Number(fuel) : null,
        notes: notes || null,
        performed_by,
        status,
      };

      const { error } = await supabase.from("inspections").insert([payload]);
      if (error) throw error;
      toast({ title: "Inspection saved", description: "Your inspection was recorded." });
      navigate("/inspections");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save inspection", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" className="p-2" onClick={() => navigate("/inspections")}> 
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Inspection</h1>
          <p className="text-muted-foreground">Record a vehicle inspection</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Inspection Details</CardTitle>
            <CardDescription>Vehicle, optional reservation, and measurements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Vehicle *</Label>
                <Select value={vehicleId} onValueChange={setVehicleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.make} {v.model} ({v.year})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reservation (optional)</Label>
                <Select value={reservationId} onValueChange={setReservationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reservation" />
                  </SelectTrigger>
                  <SelectContent>
                    {reservations.map(r => (
                      <SelectItem key={r.id} value={r.id}>#{r.id.slice(0,8)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Odometer</Label>
                <Input type="number" value={odometer} onChange={(e) => setOdometer(e.target.value)} placeholder="e.g., 45231" />
              </div>
              <div className="space-y-2">
                <Label>Fuel Level</Label>
                <Select value={fuel} onValueChange={setFuel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">1/4</SelectItem>
                    <SelectItem value="50">2/4</SelectItem>
                    <SelectItem value="75">3/4</SelectItem>
                    <SelectItem value="100">Full</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passed">Passed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="needs_attention">Needs attention</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Any observations..." />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate("/inspections")}>Cancel</Button>
              <Button type="submit" disabled={isLoading || !vehicleId}>{isLoading ? "Saving..." : "Save Inspection"}</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default NewInspection;
