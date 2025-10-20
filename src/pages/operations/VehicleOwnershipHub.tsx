import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Car, FileText, AlertCircle, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOwnershipStatistics } from "@/hooks/useVehicleOwnership";
import { VehicleOwnershipList } from "./components/VehicleOwnershipList";
import { Badge } from "@/components/ui/badge";

export default function VehicleOwnershipHub() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useOwnershipStatistics();

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Vehicle Ownership Master</h1>
          <p className="text-muted-foreground">
            Manage fleet ownership records, documentation, and compliance
          </p>
        </div>
        <Button onClick={() => navigate('/vehicles/new')} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Add Vehicle
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Fleet
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {statsLoading ? "..." : stats?.total_vehicles || 0}
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge variant="outline">
                {stats?.by_status.available || 0} Available
              </Badge>
              <Badge variant="secondary">
                {stats?.by_status.rented || 0} Rented
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ownership Types
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Owned:</span>
                <span className="font-medium">{stats?.by_ownership_type.owned || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Leased:</span>
                <span className="font-medium">{stats?.by_ownership_type.leased || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Financed:</span>
                <span className="font-medium">{stats?.by_ownership_type.financed || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              License Expiry
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {statsLoading ? "..." : stats?.expiring_licenses_30_days || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Expiring in next 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Insurance Expiry
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {statsLoading ? "..." : stats?.expiring_insurance_30_days || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Expiring in next 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle List */}
      <Card>
        <CardHeader>
          <CardTitle>Fleet Ownership Records</CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleOwnershipList />
        </CardContent>
      </Card>
    </div>
  );
}
