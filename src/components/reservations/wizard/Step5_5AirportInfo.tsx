import React from 'react';
import { useReservationWizard } from './ReservationWizardContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Plane, ArrowDown, ArrowUp } from 'lucide-react';

export const Step5_5AirportInfo: React.FC = () => {
  const { wizardData, updateWizardData } = useReservationWizard();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Airport Information</h2>
        <p className="text-muted-foreground">
          Add flight details if pickup or drop-off involves airport transfer
        </p>
      </div>

      {/* Enable Airport Info Toggle */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableAirport" className="text-base font-semibold">
                Include Airport Transfer
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable this if pickup/drop-off involves airport transfer
              </p>
            </div>
            <Switch
              id="enableAirport"
              checked={wizardData.enableAirportInfo}
              onCheckedChange={(checked) => updateWizardData({ enableAirportInfo: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {wizardData.enableAirportInfo && (
        <>
          {/* Arrival Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDown className="h-5 w-5" />
                Arrival Information
              </CardTitle>
              <CardDescription>
                Flight arrival details for vehicle pickup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="arrivalFlight">Flight Number</Label>
                  <Input
                    id="arrivalFlight"
                    placeholder="EK123"
                    value={wizardData.arrivalFlightNo || ''}
                    onChange={(e) => updateWizardData({ arrivalFlightNo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arrivalAirline">Airline</Label>
                  <Input
                    id="arrivalAirline"
                    placeholder="Emirates"
                    value={wizardData.arrivalAirline || ''}
                    onChange={(e) => updateWizardData({ arrivalAirline: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="arrivalAirport">Airport</Label>
                  <Input
                    id="arrivalAirport"
                    placeholder="Dubai International (DXB)"
                    value={wizardData.arrivalAirport || ''}
                    onChange={(e) => updateWizardData({ arrivalAirport: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arrivalCity">City</Label>
                  <Input
                    id="arrivalCity"
                    placeholder="Dubai"
                    value={wizardData.arrivalCity || ''}
                    onChange={(e) => updateWizardData({ arrivalCity: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="arrivalDateTime">Arrival Date & Time</Label>
                  <Input
                    id="arrivalDateTime"
                    type="datetime-local"
                    value={wizardData.arrivalDateTime || ''}
                    onChange={(e) => updateWizardData({ arrivalDateTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arrivalTerminal">Terminal</Label>
                  <Input
                    id="arrivalTerminal"
                    placeholder="Terminal 3"
                    value={wizardData.arrivalTerminal || ''}
                    onChange={(e) => updateWizardData({ arrivalTerminal: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="arrivalPassengers">Number of Passengers</Label>
                <Input
                  id="arrivalPassengers"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={wizardData.arrivalPassengers || ''}
                  onChange={(e) => updateWizardData({ arrivalPassengers: parseInt(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Departure Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUp className="h-5 w-5" />
                Departure Information
              </CardTitle>
              <CardDescription>
                Flight departure details for vehicle drop-off
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departureFlight">Flight Number</Label>
                  <Input
                    id="departureFlight"
                    placeholder="EK456"
                    value={wizardData.departureFlightNo || ''}
                    onChange={(e) => updateWizardData({ departureFlightNo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departureAirline">Airline</Label>
                  <Input
                    id="departureAirline"
                    placeholder="Emirates"
                    value={wizardData.departureAirline || ''}
                    onChange={(e) => updateWizardData({ departureAirline: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departureAirport">Airport</Label>
                  <Input
                    id="departureAirport"
                    placeholder="Dubai International (DXB)"
                    value={wizardData.departureAirport || ''}
                    onChange={(e) => updateWizardData({ departureAirport: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departureCity">City</Label>
                  <Input
                    id="departureCity"
                    placeholder="Dubai"
                    value={wizardData.departureCity || ''}
                    onChange={(e) => updateWizardData({ departureCity: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="departureDateTime">Departure Date & Time</Label>
                  <Input
                    id="departureDateTime"
                    type="datetime-local"
                    value={wizardData.departureDateTime || ''}
                    onChange={(e) => updateWizardData({ departureDateTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departureTerminal">Terminal</Label>
                  <Input
                    id="departureTerminal"
                    placeholder="Terminal 3"
                    value={wizardData.departureTerminal || ''}
                    onChange={(e) => updateWizardData({ departureTerminal: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="departurePassengers">Number of Passengers</Label>
                <Input
                  id="departurePassengers"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={wizardData.departurePassengers || ''}
                  onChange={(e) => updateWizardData({ departurePassengers: parseInt(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
