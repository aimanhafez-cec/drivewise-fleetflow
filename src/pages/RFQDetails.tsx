import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calculator, Ban, FileText } from "lucide-react";
import { format } from "date-fns";

const RFQDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = "RFQ Details | CEC Car Rental";
  }, []);

  const { data: rfq, isLoading } = useQuery({
    queryKey: ["rfq", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rfqs")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      
      // Fetch related data
      const [customerResult, categoryResult] = await Promise.all([
        supabase.from("profiles").select("full_name, email, phone").eq("id", data.customer_id).single(),
        data.vehicle_type_id ? supabase.from("categories").select("name, description").eq("id", data.vehicle_type_id).single() : Promise.resolve({ data: null })
      ]);
      
      return {
        ...data,
        customer: customerResult.data,
        vehicle_type: categoryResult.data
      } as any;
    },
    enabled: !!id,
  });

  const cancelRFQMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("rfqs")
        .update({ status: "cancelled" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfq", id] });
      toast({ title: "Success", description: "RFQ cancelled successfully" });
    },
    onError: (error) => {
      console.error("Failed to cancel RFQ:", error);
      toast({ title: "Error", description: "Failed to cancel RFQ", variant: "destructive" });
    },
  });

  const handlePrepareQuote = () => {
    navigate(`/quotes/new?fromRfq=${id}`);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      new: "default",
      under_review: "secondary",
      quoted: "outline",
      cancelled: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading RFQ details...</div>
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">RFQ not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/rfqs")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">RFQ {rfq.rfq_no}</h1>
            <div className="flex items-center gap-2 mt-2">
              {getStatusBadge(rfq.status)}
              <span className="text-muted-foreground">
                Created {format(new Date(rfq.created_at), "MMM dd, yyyy")}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {rfq.status === "new" || rfq.status === "under_review" ? (
            <>
              <Button id="btn-prepare-quote" onClick={handlePrepareQuote}>
                <Calculator className="h-4 w-4 mr-2" />
                Prepare Quote
              </Button>
              <Button
                variant="outline"
                onClick={() => cancelRFQMutation.mutate()}
                disabled={cancelRFQMutation.isPending}
              >
                <Ban className="h-4 w-4 mr-2" />
                Cancel RFQ
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rfq.customer?.full_name}</div>
            <p className="text-sm text-muted-foreground">{rfq.customer?.email}</p>
            {rfq.customer?.phone && (
              <p className="text-sm text-muted-foreground">{rfq.customer.phone}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Trip Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.ceil(
                (new Date(rfq.return_at).getTime() - new Date(rfq.pickup_at).getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{" "}
              days
            </div>
            <p className="text-sm text-muted-foreground">
              {format(new Date(rfq.pickup_at), "MMM dd")} - {format(new Date(rfq.return_at), "MMM dd, yyyy")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Vehicle Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rfq.vehicle_type?.name || "Any"}</div>
            <p className="text-sm text-muted-foreground">{rfq.vehicle_type?.description}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="request" className="space-y-4">
        <TabsList>
          <TabsTrigger id="tab-request" value="request">Request Details</TabsTrigger>
          <TabsTrigger id="tab-customer" value="customer">Customer Info</TabsTrigger>
          <TabsTrigger id="tab-activity" value="activity">Activity</TabsTrigger>
          <TabsTrigger id="tab-documents" value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Trip Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Pickup</label>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(rfq.pickup_at), "MMM dd, yyyy 'at' h:mm a")}
                  </div>
                  <div className="text-sm">{rfq.pickup_loc_id}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Return</label>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(rfq.return_at), "MMM dd, yyyy 'at' h:mm a")}
                  </div>
                  <div className="text-sm">{rfq.return_loc_id}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Vehicle Type Requested</label>
                  <div className="text-sm">{rfq.vehicle_type?.name || "Any vehicle type"}</div>
                </div>
                {rfq.notes && (
                  <div>
                    <label className="text-sm font-medium">Special Requests</label>
                    <div className="text-sm whitespace-pre-wrap">{rfq.notes}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <div className="text-sm">{rfq.customer?.full_name}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <div className="text-sm">{rfq.customer?.email}</div>
                </div>
                {rfq.customer?.phone && (
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <div className="text-sm">{rfq.customer.phone}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div>
                    <span className="font-medium">RFQ Created</span>
                    <span className="text-muted-foreground ml-2">
                      {format(new Date(rfq.created_at), "MMM dd, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                </div>
                {rfq.status === "cancelled" && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-destructive rounded-full" />
                    <div>
                      <span className="font-medium">RFQ Cancelled</span>
                      <span className="text-muted-foreground ml-2">
                        {format(new Date(rfq.updated_at), "MMM dd, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2" />
                <p>No documents attached</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RFQDetails;