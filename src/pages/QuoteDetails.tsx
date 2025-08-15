import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Send, 
  Copy, 
  Share, 
  Calendar, 
  RotateCcw,
  CreditCard,
  Ban,
  ArrowRight,
  User,
  Car,
  Clock,
  DollarSign
} from "lucide-react";

interface Quote {
  id: string;
  quote_number: string;
  status: string;
  customer_id: string;
  vehicle_id?: string;
  items: any[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  valid_until?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    email: string;
    phone?: string;
  };
  vehicles?: {
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
}

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const, color: "bg-gray-100 text-gray-800" },
  sent: { label: "Sent", variant: "default" as const, color: "bg-blue-100 text-blue-800" },
  viewed: { label: "Viewed", variant: "default" as const, color: "bg-purple-100 text-purple-800" },
  accepted: { label: "Accepted", variant: "default" as const, color: "bg-green-100 text-green-800" },
  declined: { label: "Declined", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
  expired: { label: "Expired", variant: "outline" as const, color: "bg-yellow-100 text-yellow-800" },
  converted: { label: "Converted", variant: "default" as const, color: "bg-emerald-100 text-emerald-800" },
};

const QuoteDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = "Quote Details | CarRental Pro";
  }, []);

  const { data: quote, isLoading } = useQuery({
    queryKey: ["quote", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;
      
      // Fetch related data
      const [customerResult, vehicleResult] = await Promise.all([
        supabase.from("profiles").select("full_name, email, phone").eq("id", data.customer_id).single(),
        data.vehicle_id ? supabase.from("vehicles").select("make, model, year, license_plate").eq("id", data.vehicle_id).single() : Promise.resolve({ data: null })
      ]);
      
      return {
        ...data,
        customer: customerResult.data,
        vehicle: vehicleResult.data
      } as any;
    },
    enabled: !!id,
  });

  const sendQuoteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const { error } = await supabase
        .from("quotes")
        .update({ status: "sent" })
        .eq("id", quoteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote", id] });
      toast({ title: "Success", description: "Quote sent successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send quote", variant: "destructive" });
    },
  });

  const convertToReservationMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      // This would call your conversion API
      const { data, error } = await supabase
        .from("reservations")
        .insert({
          customer_id: quote?.customer_id,
          vehicle_id: quote?.vehicle_id,
          start_datetime: new Date().toISOString(),
          end_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          total_amount: quote?.total_amount,
          pickup_location: "Main Office",
          return_location: "Main Office",
          status: "confirmed"
        })
        .select()
        .single();

      if (error) throw error;

      // Update quote status
      await supabase
        .from("quotes")
        .update({ status: "converted" })
        .eq("id", quoteId);

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quote", id] });
      toast({ title: "Success", description: "Quote converted to reservation" });
      navigate(`/reservations/${data.id}`);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to convert quote", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <FileText className="h-16 w-16 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Quote not found</h3>
        <Button onClick={() => navigate("/quotes")}>Back to Quotes</Button>
      </div>
    );
  }

  const statusInfo = statusConfig[quote.status as keyof typeof statusConfig] || statusConfig.draft;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{quote.quote_number}</h1>
            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {quote.customer?.full_name}
            </div>
            {quote.vehicle && (
              <div className="flex items-center gap-1">
                <Car className="h-4 w-4" />
                {quote.vehicle.year} {quote.vehicle.make} {quote.vehicle.model}
              </div>
            )}
            {quote.valid_until && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Expires {new Date(quote.valid_until).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/quotes")}>
            Back to Quotes
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast({ title: "Link copied to clipboard" });
            }}
          >
            <Share className="h-4 w-4 mr-1" />
            Share
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/quotes/new?duplicate=${quote.id}`)}
          >
            <Copy className="h-4 w-4 mr-1" />
            Duplicate
          </Button>
          {quote.status === "draft" && (
            <Button 
              size="sm"
              onClick={() => sendQuoteMutation.mutate(quote.id)}
              disabled={sendQuoteMutation.isPending}
            >
              <Send className="h-4 w-4 mr-1" />
              Send Quote
            </Button>
          )}
          {(quote.status === "accepted" || quote.status === "sent") && (
            <Button 
              size="sm"
              onClick={() => convertToReservationMutation.mutate(quote.id)}
              disabled={convertToReservationMutation.isPending}
            >
              <ArrowRight className="h-4 w-4 mr-1" />
              Convert to Reservation
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList id="quote-tabs">
              <TabsTrigger value="summary" id="tab-summary">Summary</TabsTrigger>
              <TabsTrigger value="customer" id="tab-customer">Customer</TabsTrigger>
              <TabsTrigger value="vehicles" id="tab-vehicles">Vehicles</TabsTrigger>
              <TabsTrigger value="activity" id="tab-activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quote Summary</CardTitle>
                  <CardDescription>Pricing breakdown and line items</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Line Items */}
                  <div className="space-y-3">
                    {quote.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.qty} × ${Number(item.rate).toFixed(2)}
                          </p>
                        </div>
                        <p className="font-semibold">${Number(item.qty * item.rate).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${Number(quote.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${Number(quote.tax_amount).toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${Number(quote.total_amount).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {quote.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{quote.notes}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="customer" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Contact Details</h4>
                    <div className="mt-2 space-y-1">
                      <p>{quote.customer?.full_name}</p>
                      <p className="text-muted-foreground">{quote.customer?.email}</p>
                      {quote.customer?.phone && (
                        <p className="text-muted-foreground">{quote.customer.phone}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vehicles" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {quote.vehicle ? (
                    <div className="space-y-2">
                      <h4 className="font-semibold">
                        {quote.vehicle.year} {quote.vehicle.make} {quote.vehicle.model}
                      </h4>
                      <p className="text-muted-foreground">
                        License Plate: {quote.vehicle.license_plate}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No specific vehicle assigned</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <div>
                        <p className="font-medium">Quote Created</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(quote.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {quote.status !== "draft" && (
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <div>
                          <p className="font-medium">Status Updated to {statusInfo.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(quote.updated_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">${Number(quote.total_amount).toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total Amount</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-center p-2 bg-muted rounded">
                  <p className="font-semibold">${Number(quote.subtotal).toFixed(2)}</p>
                  <p className="text-muted-foreground">Subtotal</p>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <p className="font-semibold">${Number(quote.tax_amount).toFixed(2)}</p>
                  <p className="text-muted-foreground">Tax</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                id="btn-revise"
                variant="outline" 
                className="w-full"
                onClick={() => navigate(`/quotes/new?revise=${quote.id}`)}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Revise Quote
              </Button>
              
              {quote.status === "accepted" && (
                <>
                  <Button 
                    id="btn-convert-reservation"
                    className="w-full"
                    onClick={() => convertToReservationMutation.mutate(quote.id)}
                    disabled={convertToReservationMutation.isPending}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Convert to Reservation
                  </Button>
                  <Button 
                    id="btn-collect-deposit"
                    variant="outline" 
                    className="w-full"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Collect Deposit
                  </Button>
                </>
              )}
              
              <Button 
                id="btn-expire"
                variant="outline" 
                className="w-full"
                onClick={() => {
                  // Implement expire functionality
                  toast({ title: "Feature coming soon" });
                }}
              >
                <Ban className="h-4 w-4 mr-2" />
                Expire Quote
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuoteDetails;