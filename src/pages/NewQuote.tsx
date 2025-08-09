import React, { useEffect, useMemo, useState } from "react";
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
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

interface Customer { id: string; full_name: string; email: string }
interface Vehicle { id: string; make: string; model: string; year: number }

interface Line { description: string; qty: number; rate: number }

const NewQuote: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => { document.title = "New Quote | CarRental Pro"; }, []);

  const { data: customers = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, full_name, email").order("full_name");
      if (error) throw error;
      return data as Customer[];
    }
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles-basic"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicles").select("id, make, model, year").order("make");
      if (error) throw error;
      return data as Vehicle[];
    }
  });

  const [customerId, setCustomerId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([{ description: "Daily rental", qty: 1, rate: 50 }]);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + (Number(l.qty)||0) * (Number(l.rate)||0), 0), [lines]);
  const tax = useMemo(() => subtotal * (Number(taxRate)||0) / 100, [subtotal, taxRate]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  const addLine = () => setLines((l) => [...l, { description: "", qty: 1, rate: 0 }]);
  const removeLine = (i: number) => setLines((l) => l.filter((_, idx) => idx !== i));
  const patchLine = (i: number, patch: Partial<Line>) => setLines((l) => l.map((row, idx) => idx === i ? { ...row, ...patch } : row));

  const genQuoteNumber = () => `Q-${new Date().getFullYear()}-${Math.floor(1000 + Math.random()*9000)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      toast({ title: "Missing customer", description: "Select a customer", variant: "destructive" });
      return;
    }
    if (lines.length === 0) {
      toast({ title: "Missing items", description: "Add at least one line", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        customer_id: customerId,
        vehicle_id: vehicleId || null,
        items: lines.map(l => ({ ...l, amount: (Number(l.qty)||0) * (Number(l.rate)||0) })),
        subtotal,
        tax_amount: tax,
        total_amount: total,
        status: "draft",
        notes: notes || null,
        quote_number: genQuoteNumber(),
      };

      const { error } = await supabase.from("quotes").insert([payload]);
      if (error) throw error;

      toast({ title: "Quote created", description: "Your quote has been saved." });
      navigate("/quotes");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to create quote", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" className="p-2" onClick={() => navigate("/quotes")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Quote</h1>
          <p className="text-muted-foreground">Build a quote for a customer</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Quote Details</CardTitle>
            <CardDescription>Customer, optional vehicle, and line items</CardDescription>
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
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.full_name} ({c.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {customers.length === 0 && (
                  <p className="text-xs text-muted-foreground">No customers found. Create a customer first.</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Vehicle (optional)</Label>
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
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base">Line Items</Label>
                <Button type="button" variant="secondary" size="sm" onClick={addLine}>
                  <Plus className="mr-2 h-4 w-4" /> Add line
                </Button>
              </div>
              {lines.map((ln, i) => (
                <div key={i} className="grid gap-3 md:grid-cols-6 p-3 border rounded-lg">
                  <div className="md:col-span-3">
                    <Label>Description</Label>
                    <Input value={ln.description} onChange={(e) => patchLine(i, { description: e.target.value })} placeholder="e.g., 3 days rental" />
                  </div>
                  <div>
                    <Label>Qty</Label>
                    <Input type="number" min={1} value={ln.qty} onChange={(e) => patchLine(i, { qty: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label>Rate</Label>
                    <Input type="number" min={0} value={ln.rate} onChange={(e) => patchLine(i, { rate: Number(e.target.value) })} />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" variant="destructive" onClick={() => removeLine(i)} disabled={lines.length === 1}>
                      <Trash2 className="mr-2 h-4 w-4" /> Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input type="number" min={0} max={100} step={0.1} value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label>Subtotal</Label>
                <div className="text-sm">${subtotal.toFixed(2)}</div>
              </div>
              <div className="space-y-1">
                <Label>Total</Label>
                <div className="text-lg font-semibold">${total.toFixed(2)}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Any special terms..." />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate("/quotes")}>Cancel</Button>
              <Button type="submit" disabled={isLoading || customers.length === 0}>{isLoading ? "Saving..." : "Create Quote"}</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default NewQuote;
