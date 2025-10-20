import { useState } from "react";
import { useVehicleOwnership } from "@/hooks/useVehicleOwnership";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { OwnershipFilters, OwnershipType } from "@/lib/api/vehicle-ownership";
import { format } from "date-fns";

export function VehicleOwnershipList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<OwnershipFilters>({});
  const { data: vehicles, isLoading } = useVehicleOwnership(filters);

  const updateFilter = (key: keyof OwnershipFilters, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const getOwnershipBadgeVariant = (type: string | null) => {
    switch (type) {
      case 'owned':
        return 'default';
      case 'leased':
        return 'secondary';
      case 'financed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'rented':
        return 'secondary';
      case 'maintenance':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const isExpiringSoon = (dateStr?: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return date <= thirtyDaysFromNow && date >= new Date();
  };

  const isExpired = (dateStr?: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Search</Label>
          <Input
            placeholder="Make, model, plate, VIN..."
            value={filters.search || ""}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Ownership Type</Label>
          <Select
            value={filters.ownership_type || "all"}
            onValueChange={(value) =>
              updateFilter("ownership_type", value === "all" ? undefined : (value as OwnershipType))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="owned">Owned</SelectItem>
              <SelectItem value="leased">Leased</SelectItem>
              <SelectItem value="financed">Financed</SelectItem>
              <SelectItem value="rental_pool">Rental Pool</SelectItem>
              <SelectItem value="consignment">Consignment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              updateFilter("status", value === "all" ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="rented">Rented</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="out_of_service">Out of Service</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={() => setFilters({})}
            className="w-full"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : !vehicles || vehicles.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No vehicles found
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>License Plate</TableHead>
                <TableHead>Ownership</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>License Expiry</TableHead>
                <TableHead>Insurance Expiry</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    <div className="font-medium">
                      {vehicle.make} {vehicle.model}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {vehicle.year}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {vehicle.license_plate}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getOwnershipBadgeVariant(vehicle.ownership_type)}>
                      {vehicle.ownership_type || 'Not Set'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(vehicle.status)}>
                      {vehicle.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {vehicle.license_expiry ? (
                      <div className="space-y-1">
                        <div className="text-sm">
                          {format(new Date(vehicle.license_expiry), 'dd MMM yyyy')}
                        </div>
                        {isExpired(vehicle.license_expiry) && (
                          <Badge variant="destructive" className="text-xs">Expired</Badge>
                        )}
                        {!isExpired(vehicle.license_expiry) && isExpiringSoon(vehicle.license_expiry) && (
                          <Badge variant="outline" className="text-xs">Expiring Soon</Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {vehicle.insurance_expiry ? (
                      <div className="space-y-1">
                        <div className="text-sm">
                          {format(new Date(vehicle.insurance_expiry), 'dd MMM yyyy')}
                        </div>
                        {isExpired(vehicle.insurance_expiry) && (
                          <Badge variant="destructive" className="text-xs">Expired</Badge>
                        )}
                        {!isExpired(vehicle.insurance_expiry) && isExpiringSoon(vehicle.insurance_expiry) && (
                          <Badge variant="outline" className="text-xs">Expiring Soon</Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {vehicle.categories?.name || (
                      <span className="text-muted-foreground">Uncategorized</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/vehicles/${vehicle.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
