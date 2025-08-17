import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText } from "lucide-react";

interface Quote {
  id: string;
  quote_number: string;
  status: string;
  total_amount: number;
  created_at: string;
}

const statusColor = (s: string) => {
  switch (s) {
    case "accepted":
      return "bg-green-100 text-green-800";
    case "sent":
      return "bg-blue-100 text-blue-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "expired":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const Quotes: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Quotations | CEC Car Rental";
  }, []);

  const { data: quotes = [] } = useQuery({
    queryKey: ["quotes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("id, quote_number, status, total_amount, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Quote[];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
          <p className="text-muted-foreground">Create and manage customer quotes</p>
        </div>
        <Button onClick={() => navigate("/quotes/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Quote
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Quotes</CardTitle>
          <CardDescription>Latest quotations created for customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {quotes.length === 0 && (
              <p className="text-sm text-muted-foreground">No quotes yet. Create your first one.</p>
            )}
            {quotes.map((q) => (
              <div key={q.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{q.quote_number}</p>
                    <p className="text-xs text-muted-foreground">Created {new Date(q.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">AED {Number(q.total_amount || 0).toFixed(2)}</p>
                </div>
                <Badge className={statusColor(q.status)}>{q.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Quotes;
