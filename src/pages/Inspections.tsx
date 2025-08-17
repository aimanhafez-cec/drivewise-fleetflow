import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ClipboardCheck } from "lucide-react";

interface Inspection {
  id: string;
  inspection_date: string;
  status: string | null;
  odometer: number | null;
  fuel_level: number | null;
}

const statusColor = (s?: string | null) => {
  switch (s) {
    case "passed":
      return "bg-green-100 text-green-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "needs_attention":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const Inspections: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => { document.title = "Inspections | CEC Car Rental"; }, []);

  const { data: inspections = [] } = useQuery({
    queryKey: ["inspections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inspections")
        .select("id, inspection_date, status, odometer, fuel_level")
        .order("inspection_date", { ascending: false });
      if (error) throw error;
      return (data || []) as Inspection[];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inspections</h1>
          <p className="text-muted-foreground">Record pre/post-rental vehicle inspections</p>
        </div>
        <Button onClick={() => navigate("/inspections/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Inspection
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Inspections</CardTitle>
          <CardDescription>Most recent vehicle inspections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {inspections.length === 0 && (
              <p className="text-sm text-muted-foreground">No inspections yet.</p>
            )}
            {inspections.map((insp) => (
              <div key={insp.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <ClipboardCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">#{insp.id.slice(0,8)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(insp.inspection_date).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm">Odo: {insp.odometer ?? '-'} • Fuel: {insp.fuel_level ?? '-'}</p>
                </div>
                <Badge className={statusColor(insp.status || undefined)}>{insp.status || 'n/a'}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inspections;
