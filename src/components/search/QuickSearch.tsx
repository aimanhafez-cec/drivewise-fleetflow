import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface VehicleResult {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vin: string;
}

interface ReservationResult {
  id: string;
  ro_number: string | null;
  po_number: string | null;
  start_datetime: string;
  end_datetime: string;
}

interface CustomerResult {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

const useDebounced = (value: string, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const QuickSearch: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debounced = useDebounced(query);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const enabled = debounced.trim().length >= 2;

  const vehiclesQuery = useQuery({
    queryKey: ["quick-search-vehicles", debounced],
    enabled,
    queryFn: async () => {
      const q = debounced.trim();
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, make, model, year, license_plate, vin")
        .or(
          `make.ilike.%${q}%,model.ilike.%${q}%,license_plate.ilike.%${q}%,vin.ilike.%${q}%`
        )
        .limit(8);
      if (error) throw error;
      return (data || []) as VehicleResult[];
    },
  });

  const reservationsQuery = useQuery({
    queryKey: ["quick-search-reservations", debounced],
    enabled,
    queryFn: async () => {
      const q = debounced.trim();
      const { data, error } = await supabase
        .from("reservations")
        .select("id, ro_number, po_number, start_datetime, end_datetime")
        .or(
          `ro_number.ilike.%${q}%,po_number.ilike.%${q}%`
        )
        .limit(8);
      if (error) throw error;
      return (data || []) as ReservationResult[];
    },
  });
  
  const customersQuery = useQuery({
    queryKey: ["quick-search-customers", debounced],
    enabled,
    queryFn: async () => {
      const q = debounced.trim();
      const { data, error } = await supabase
        .from("customers")
        .select("id, full_name, email, phone")
        .or(
          `full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`
        )
        .limit(8);
      if (error) throw error;
      return (data || []) as CustomerResult[];
    },
  });

  const vehicles = vehiclesQuery.data || [];
  const reservations = reservationsQuery.data || [];
  const customers = customersQuery.data || [];

  const placeholder = useMemo(
    () => "Search vehicles (VIN/plate/make) or reservations (RO/PO/ID)...",
    []
  );

  const openReservation = (id: string) => {
    navigate("/reservations");
    toast({
      title: "Opening reservation",
      description: `Reservation ID ${id} — view from the list for now`,
    });
    setOpen(false);
  };

  const openVehicle = (id: string) => {
    navigate(`/vehicles/${id}`);
    setOpen(false);
  };

  const openCustomer = (id: string) => {
    navigate(`/customers/${id}`);
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="hidden md:inline-flex"
      >
        <Search className="mr-2 h-4 w-4" />
        Quick Search
        <span className="ml-2 text-xs text-muted-foreground">Ctrl/⌘+K</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="md:hidden"
        aria-label="Quick Search"
      >
        <Search className="h-4 w-4" />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder={placeholder}
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Vehicles">
            {vehicles.map((v) => (
              <CommandItem key={v.id} onSelect={() => openVehicle(v.id)}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{v.make} {v.model}</span>
                  <span className="text-muted-foreground">{v.year}</span>
                  <span className="text-muted-foreground">• {v.license_plate}</span>
                  <span className="text-muted-foreground">• {v.vin.slice(0,8)}…</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Reservations">
            {reservations.map((r) => (
              <CommandItem key={r.id} onSelect={() => openReservation(r.id)}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">ID: {r.id}</span>
                  {r.ro_number && (
                    <span className="text-muted-foreground">RO {r.ro_number}</span>
                  )}
                  {r.po_number && (
                    <span className="text-muted-foreground">PO {r.po_number}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Customers">
            {customers.map((r) => (
              <CommandItem key={r.id} onSelect={() => openCustomer(r.id)}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">ID: {r.id}</span>
                  {r.full_name && (
                    <span className="text-muted-foreground">Name: {r.full_name}</span>
                  )}
                  {r.email && (
                    <span className="text-muted-foreground">Email: {r.email}</span>
                  )}
                  {r.phone && (
                    <span className="text-muted-foreground">Phone: {r.phone}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default QuickSearch;
