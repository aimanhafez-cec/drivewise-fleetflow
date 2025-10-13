import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QuotationSearch } from "@/components/quotes/QuotationSearch";
import { Plus, MoreVertical, Eye, Edit, Copy, FileText, Send, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { format } from "date-fns";

interface SearchFilters {
  query?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  validFrom?: string;
  validTo?: string;
  amountMin?: string;
  amountMax?: string;
  customer?: string;
  rfq?: string;
  vehicle?: string;
}

interface Customer {
  id: string;
  full_name: string;
  email: string;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  license_plate: string;
}

interface QuoteWithRelations {
  id: string;
  quote_number: string;
  customer_id: string;
  vehicle_id: string | null;
  rfq_id: string | null;
  status: string;
  total_amount: number;
  created_at: string;
  valid_until: string | null;
  customer?: Customer | null;
  vehicle?: Vehicle | null;
}

const ManageQuotations: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SearchFilters>({});
  const [quickFilter, setQuickFilter] = useState<string>("all");

  useEffect(() => {
    document.title = "Manage Quotations | Core Car Rental";
  }, []);

  // Fetch quotes with filters
  const { data: quotes = [], isLoading } = useQuery<QuoteWithRelations[]>({
    queryKey: ["quotes", filters, quickFilter],
    queryFn: async () => {
      let query = supabase
        .from("quotes")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply quick filter
      if (quickFilter !== "all") {
        query = query.eq("status", quickFilter);
      }

      // Apply search query
      if (filters.query) {
        query = query.ilike("quote_number", `%${filters.query}%`);
      }

      // Apply other filters
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte("created_at", filters.dateTo);
      }
      if (filters.validFrom) {
        query = query.gte("valid_until", filters.validFrom);
      }
      if (filters.validTo) {
        query = query.lte("valid_until", filters.validTo);
      }
      if (filters.amountMin) {
        query = query.gte("total_amount", filters.amountMin);
      }
      if (filters.amountMax) {
        query = query.lte("total_amount", filters.amountMax);
      }
      if (filters.customer) {
        query = query.eq("customer_id", filters.customer);
      }
      if (filters.rfq) {
        query = query.eq("rfq_id", filters.rfq);
      }
      if (filters.vehicle) {
        query = query.eq("vehicle_id", filters.vehicle);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch related data for each quote
      if (data && data.length > 0) {
        const customerIds = [...new Set(data.map(q => q.customer_id).filter(Boolean))] as string[];
        const vehicleIds = [...new Set(data.map(q => q.vehicle_id).filter(Boolean))] as string[];
        
        const [customersData, vehiclesData] = await Promise.all([
          customerIds.length > 0 
            ? supabase.from("customers").select("id, full_name, email").in("id", customerIds)
            : Promise.resolve({ data: [] as Customer[] }),
          vehicleIds.length > 0
            ? supabase.from("vehicles").select("id, make, model, license_plate").in("id", vehicleIds)
            : Promise.resolve({ data: [] as Vehicle[] }),
        ]);

        const customersMap = new Map<string, Customer>();
        customersData.data?.forEach(c => customersMap.set(c.id, c));
        
        const vehiclesMap = new Map<string, Vehicle>();
        vehiclesData.data?.forEach(v => vehiclesMap.set(v.id, v));

        return data.map(quote => ({
          ...quote,
          customer: quote.customer_id ? customersMap.get(quote.customer_id) : null,
          vehicle: quote.vehicle_id ? vehiclesMap.get(quote.vehicle_id) : null,
        })) as QuoteWithRelations[];
      }

      return (data || []) as QuoteWithRelations[];
    },
  });

  // Calculate KPIs
  const totalQuotes = quotes.length;
  const pendingQuotes = quotes.filter((q) => q.status === "draft" || q.status === "sent").length;
  const acceptedQuotes = quotes.filter((q) => q.status === "accepted").length;
  const totalValue = quotes.reduce((sum, q) => sum + (Number(q.total_amount) || 0), 0);

  const statusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100";
      case "sent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      case "expired":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const isExpiringSoon = (validUntil: string | null) => {
    if (!validUntil) return false;
    const daysUntilExpiry = Math.floor(
      (new Date(validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
  };

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Quotations</h1>
          <p className="text-muted-foreground">
            Create, track, and manage customer quotations
          </p>
        </div>
        <Button onClick={() => navigate("/quotes/new")} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Create New
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Total Quotes</p>
            <p className="text-3xl font-bold">{totalQuotes}</p>
          </div>
        </Card>
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Pending</p>
            <p className="text-3xl font-bold text-blue-600">{pendingQuotes}</p>
          </div>
        </Card>
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Accepted</p>
            <p className="text-3xl font-bold text-green-600">{acceptedQuotes}</p>
          </div>
        </Card>
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Total Value</p>
            <p className="text-3xl font-bold">{formatCurrency(totalValue)}</p>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <QuotationSearch onSearch={handleSearch} isLoading={isLoading} />

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={quickFilter === "all" ? "default" : "outline"}
          onClick={() => setQuickFilter("all")}
          size="sm"
        >
          All
        </Button>
        <Button
          variant={quickFilter === "draft" ? "default" : "outline"}
          onClick={() => setQuickFilter("draft")}
          size="sm"
        >
          Draft
        </Button>
        <Button
          variant={quickFilter === "sent" ? "default" : "outline"}
          onClick={() => setQuickFilter("sent")}
          size="sm"
        >
          Sent
        </Button>
        <Button
          variant={quickFilter === "accepted" ? "default" : "outline"}
          onClick={() => setQuickFilter("accepted")}
          size="sm"
        >
          Accepted
        </Button>
        <Button
          variant={quickFilter === "rejected" ? "default" : "outline"}
          onClick={() => setQuickFilter("rejected")}
          size="sm"
        >
          Rejected
        </Button>
        <Button
          variant={quickFilter === "expired" ? "default" : "outline"}
          onClick={() => setQuickFilter("expired")}
          size="sm"
        >
          Expired
        </Button>
      </div>

      {/* Main Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    Loading quotations...
                  </TableCell>
                </TableRow>
              ) : quotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-12 w-12 text-muted-foreground" />
                      <p className="text-lg font-medium">No quotations found</p>
                      <p className="text-sm text-muted-foreground">
                        Create your first quote to get started
                      </p>
                      <Button onClick={() => navigate("/quotes/new")} className="mt-4">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Quote
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                quotes.map((quote) => (
                  <TableRow key={quote.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell
                      onClick={() => navigate(`/quotes/${quote.id}`)}
                      className="font-medium"
                    >
                      {quote.quote_number}
                    </TableCell>
                    <TableCell onClick={() => navigate(`/quotes/${quote.id}`)}>
                      <div>
                        <p className="font-medium">{quote.customer?.full_name || "N/A"}</p>
                        <p className="text-sm text-muted-foreground">
                          {quote.customer?.email || ""}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell onClick={() => navigate(`/quotes/${quote.id}`)}>
                      {quote.vehicle ? (
                        <div>
                          <p className="font-medium">
                            {quote.vehicle.make} {quote.vehicle.model}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {quote.vehicle.license_plate}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell onClick={() => navigate(`/quotes/${quote.id}`)}>
                      {format(new Date(quote.created_at), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell onClick={() => navigate(`/quotes/${quote.id}`)}>
                      {quote.valid_until ? (
                        <div className="flex items-center gap-2">
                          {format(new Date(quote.valid_until), "MMM dd, yyyy")}
                          {isExpiringSoon(quote.valid_until) && (
                            <Badge variant="outline" className="text-orange-600">
                              Expiring Soon
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell onClick={() => navigate(`/quotes/${quote.id}`)} className="text-right">
                      {formatCurrency(Number(quote.total_amount) || 0)}
                    </TableCell>
                    <TableCell onClick={() => navigate(`/quotes/${quote.id}`)}>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColor(quote.status)}>
                          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        </Badge>
                        {quote.status === 'draft' && (
                          <Badge variant="outline" className="text-orange-600">
                            Incomplete
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => navigate(`/quotes/${quote.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/quotes/${quote.id}?edit=true`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            {quote.status === 'draft' ? 'Continue Editing' : 'Edit Quote'}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate Quote
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Revise Quote
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send className="mr-2 h-4 w-4" />
                            Send to Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Accepted
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <XCircle className="mr-2 h-4 w-4" />
                            Mark as Rejected
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default ManageQuotations;
