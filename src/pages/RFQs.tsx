import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter } from "lucide-react";
import { format } from "date-fns";

const RFQs: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    document.title = "RFQs | Core Car Rental";
  }, []);

  const { data: rfqs, isLoading } = useQuery({
    queryKey: ["rfqs", searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("rfqs")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter as any);
      }

      if (searchTerm) {
        query = query.or(`rfq_no.ilike.%${searchTerm}%,profiles.full_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch related data for each RFQ
      const enrichedData = await Promise.all(
        (data || []).map(async (rfq: any) => {
          const [customerResult, categoryResult] = await Promise.all([
            supabase.from("profiles").select("full_name, email").eq("id", rfq.customer_id).single(),
            rfq.vehicle_type_id ? supabase.from("categories").select("name").eq("id", rfq.vehicle_type_id).single() : Promise.resolve({ data: null })
          ]);
          
          return {
            ...rfq,
            customer: customerResult.data,
            vehicle_type: categoryResult.data
          } as any;
        })
      );
      
      return enrichedData;
    },
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      new: "default",
      under_review: "secondary",
      quoted: "destructive", 
      cancelled: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">RFQs</h1>
          <p className="text-muted-foreground">Manage customer requests for quotes</p>
        </div>
        <Button onClick={() => navigate("/rfqs/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New RFQ
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="flt-search"
                  placeholder="Search RFQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="flt-status" className="w-[200px] text-muted-foreground">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* RFQs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Requests for Quote</CardTitle>
        </CardHeader>
        <CardContent>
          <Table id="rfqs-table">
            <TableHeader>
              <TableRow className="text-card-foreground bg-slate-800">
                <TableHead>RFQ #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Trip Dates</TableHead>
                <TableHead>Locations</TableHead>
                <TableHead>Vehicle Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow className="text-card-foreground">
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading RFQs...
                  </TableCell>
                </TableRow>
              ) : rfqs && rfqs.length > 0 ? (
                rfqs.map((rfq) => (
                  <TableRow key={rfq.id} className="cursor-pointer hover:bg-muted/50 text-card-foreground">
                    <TableCell className="font-medium">{rfq.rfq_no}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{rfq.customer?.full_name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(rfq.pickup_at), "MMM dd, yyyy")}</div>
                        <div className="text-card-foreground">
                          {format(new Date(rfq.return_at), "MMM dd, yyyy")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>From: {rfq.pickup_loc_id}</div>
                        <div className="text-card-foreground">To: {rfq.return_loc_id}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-card-foreground">{rfq.vehicle_type?.name || "Any"}</TableCell>
                    <TableCell className="text-card-foreground">{getStatusBadge(rfq.status)}</TableCell>
                    <TableCell className="text-sm text-card-foreground">
                      {format(new Date(rfq.created_at), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/rfqs/${rfq.id}`)}
                        className="text-muted-foreground"
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="text-card-foreground">
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-muted-foreground">
                      <Filter className="h-8 w-8 mx-auto mb-2" />
                      <p>No RFQs found</p>
                      <p className="text-sm">Create your first RFQ to get started</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RFQs;