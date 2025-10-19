import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Clock, DollarSign } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const LocationSettings = () => {
  // Mock location data - replace with actual API call when locations table is available
  const locations = [
    {
      id: '1',
      name: 'Dubai Main Branch',
      address: 'Sheikh Zayed Road, Dubai',
      is_active: true,
    },
    {
      id: '2',
      name: 'Abu Dhabi Airport',
      address: 'Abu Dhabi International Airport',
      is_active: true,
    },
    {
      id: '3',
      name: 'Sharjah Branch',
      address: 'Al Khan, Sharjah',
      is_active: true,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Location Management</CardTitle>
              <CardDescription>
                Manage pickup and return locations for instant bookings
              </CardDescription>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Location
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {locations && locations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Operating Hours</TableHead>
                  <TableHead>Instant Booking</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium">{location.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {location.address || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3" />
                        <span>24/7</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-emerald-100 text-emerald-800">
                        Enabled
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={location.is_active ? 'default' : 'outline'}
                        className={
                          location.is_active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {location.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Locations Found</h3>
              <p className="text-muted-foreground mb-4">
                Add your first location to enable instant bookings
              </p>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Location
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location Fees</CardTitle>
          <CardDescription>Configure delivery and collection fees per location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {locations?.slice(0, 3).map((location) => (
              <div
                key={location.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{location.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Delivery & collection charges
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Delivery Fee</p>
                    <p className="font-semibold">AED 0</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Collection Fee</p>
                    <p className="font-semibold">AED 0</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationSettings;
