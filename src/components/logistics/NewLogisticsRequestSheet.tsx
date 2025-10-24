import { useState } from "react";
import { X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface NewLogisticsRequestSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (newRequest: any) => void;
}

const SUBTYPES = {
  "Contract-Related": ["Vehicle Delivery", "Vehicle Pick-up"],
  "Internal": ["Wash", "Tires and Batteries", "Refuel"],
  "Maintenance Transfer": ["Maintenance Workshop"],
};

export function NewLogisticsRequestSheet({
  open,
  onOpenChange,
  onSuccess,
}: NewLogisticsRequestSheetProps) {
  const [formData, setFormData] = useState({
    type: "Contract-Related",
    subtype: "",
    priority: "Normal",
    owningBranch: "",
    contractNumber: "",
    contractLine: "",
    customer: "",
    deliveryLocationType: "Our Office",
    office: "",
    siteName: "",
    siteAddress: "",
    siteContactName: "",
    siteContactMobile: "",
    siteAccessNotes: "",
    requestedDate: "",
    windowFrom: "",
    windowTo: "",
    targetTime: "",
    specialInstructions: "",
    internalNotes: "",
  });

  const [vehicleData, setVehicleData] = useState<any>(null);
  const [odometerOverride, setOdometerOverride] = useState(false);
  const [customOdometer, setCustomOdometer] = useState("");

  const handleTypeChange = (value: string) => {
    setFormData({
      ...formData,
      type: value,
      subtype: "", // Reset subtype when type changes
    });
  };

  const handleContractLineChange = (value: string) => {
    setFormData({ ...formData, contractLine: value });
    
    // Mock vehicle data when contract line is selected
    if (value) {
      const mockVehicle = {
        vin: 'WBADT4305RGZ12345',
        plate: 'DXB-12345',
        make: 'BMW',
        model: 'X5',
        year: 2024,
        vehicleClass: 'Luxury SUV',
        itemCode: 'VH-2024-001',
        description: '2024 BMW X5 xDrive40i - White',
        odometer: 1250,
      };
      setVehicleData(mockVehicle);
      setFormData({ ...formData, contractLine: value, customer: "ABC Company Ltd." });
    }
  };

  const handleSave = () => {
    const newRequest = {
      id: `LR-2025-${String(Math.floor(Math.random() * 1000)).padStart(5, "0")}`,
      type: formData.type,
      subtype: formData.subtype,
      status: "pending",
      location: formData.owningBranch || "N/A",
      date: new Date().toISOString().split("T")[0],
      priority: formData.priority.toLowerCase(),
    };

    onSuccess?.(newRequest);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      type: "Contract-Related",
      subtype: "",
      priority: "Normal",
      owningBranch: "",
      contractNumber: "",
      contractLine: "",
      customer: "",
      deliveryLocationType: "Our Office",
      office: "",
      siteName: "",
      siteAddress: "",
      siteContactName: "",
      siteContactMobile: "",
      siteAccessNotes: "",
      requestedDate: "",
      windowFrom: "",
      windowTo: "",
      targetTime: "",
      specialInstructions: "",
      internalNotes: "",
    });
    setVehicleData(null);
    setOdometerOverride(false);
    setCustomOdometer("");
    onOpenChange(false);
  };

  const availableSubtypes = SUBTYPES[formData.type as keyof typeof SUBTYPES] || [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New Logistics Request</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Form Meta Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Form Meta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Type */}
              <div className="space-y-2">
                <Label>
                  Type <span className="text-destructive">*</span>
                </Label>
                <RadioGroup
                  value={formData.type}
                  onValueChange={handleTypeChange}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Contract-Related" id="type-contract" />
                    <Label htmlFor="type-contract" className="font-normal cursor-pointer">
                      Contract-Related
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Internal" id="type-internal" />
                    <Label htmlFor="type-internal" className="font-normal cursor-pointer">
                      Internal
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Maintenance Transfer" id="type-maintenance" />
                    <Label htmlFor="type-maintenance" className="font-normal cursor-pointer">
                      Maintenance Transfer
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Subtype */}
              <div className="space-y-2">
                <Label htmlFor="subtype">
                  Subtype <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.subtype}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subtype: value })
                  }
                >
                  <SelectTrigger id="subtype">
                    <SelectValue placeholder="Select subtype" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubtypes.map((subtype) => (
                      <SelectItem key={subtype} value={subtype}>
                        {subtype}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <div>
                  <Badge variant="outline">New</Badge>
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Owning Branch */}
              <div className="space-y-2">
                <Label htmlFor="owningBranch">
                  Owning Branch/Office <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="owningBranch"
                  value={formData.owningBranch}
                  onChange={(e) =>
                    setFormData({ ...formData, owningBranch: e.target.value })
                  }
                  placeholder="Enter branch or office name"
                />
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Delivery Sections */}
          {formData.type === "Contract-Related" && formData.subtype === "Vehicle Delivery" && (
            <>
              {/* Section B: Contract Linkage */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Contract Linkage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contractNumber">
                      Contract Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="contractNumber"
                      value={formData.contractNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, contractNumber: e.target.value })
                      }
                      placeholder="Enter contract number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractLine">
                      Contract Line <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.contractLine}
                      onValueChange={handleContractLineChange}
                    >
                      <SelectTrigger id="contractLine">
                        <SelectValue placeholder="Select contract line" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Line 1">Line 1</SelectItem>
                        <SelectItem value="Line 2">Line 2</SelectItem>
                        <SelectItem value="Line 3">Line 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.customer && (
                    <div className="space-y-2">
                      <Label>Customer</Label>
                      <div className="p-2 bg-muted rounded-md text-sm">
                        {formData.customer}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Section C: Vehicle Details */}
              {vehicleData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Vehicle Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">VIN</Label>
                        <div className="text-sm font-medium">{vehicleData.vin}</div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Plate Number</Label>
                        <div className="text-sm font-medium">{vehicleData.plate}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Make</Label>
                        <div className="text-sm font-medium">{vehicleData.make}</div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Model</Label>
                        <div className="text-sm font-medium">{vehicleData.model}</div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Year</Label>
                        <div className="text-sm font-medium">{vehicleData.year}</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Vehicle Class</Label>
                      <div className="text-sm font-medium">{vehicleData.vehicleClass}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Item Code</Label>
                        <div className="text-sm font-medium">{vehicleData.itemCode}</div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Description</Label>
                        <div className="text-sm font-medium">{vehicleData.description}</div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="odometer-override" className="text-xs text-muted-foreground">
                          Current Odometer: {odometerOverride ? customOdometer || vehicleData.odometer : vehicleData.odometer} km
                        </Label>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="odometer-override" className="text-xs cursor-pointer">
                            Override
                          </Label>
                          <Switch
                            id="odometer-override"
                            checked={odometerOverride}
                            onCheckedChange={setOdometerOverride}
                          />
                        </div>
                      </div>
                      {odometerOverride && (
                        <Input
                          type="number"
                          placeholder="Enter odometer reading"
                          value={customOdometer}
                          onChange={(e) => setCustomOdometer(e.target.value)}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section D: Delivery Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Delivery Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>
                      Location Type <span className="text-destructive">*</span>
                    </Label>
                    <RadioGroup
                      value={formData.deliveryLocationType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, deliveryLocationType: value })
                      }
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Our Office" id="office" />
                        <Label htmlFor="office" className="font-normal cursor-pointer">
                          Our Office
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Customer Site" id="customer-site" />
                        <Label htmlFor="customer-site" className="font-normal cursor-pointer">
                          Customer Site
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.deliveryLocationType === "Our Office" && (
                    <div className="space-y-2">
                      <Label htmlFor="office">
                        Office <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.office}
                        onValueChange={(value) =>
                          setFormData({ ...formData, office: value })
                        }
                      >
                        <SelectTrigger id="office">
                          <SelectValue placeholder="Select office" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Marina Office">Marina Office</SelectItem>
                          <SelectItem value="Downtown Office">Downtown Office</SelectItem>
                          <SelectItem value="Business Bay Office">Business Bay Office</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {formData.deliveryLocationType === "Customer Site" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="siteName">
                          Site Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="siteName"
                          value={formData.siteName}
                          onChange={(e) =>
                            setFormData({ ...formData, siteName: e.target.value })
                          }
                          placeholder="Enter site name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="siteAddress">
                          Address <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="siteAddress"
                          value={formData.siteAddress}
                          onChange={(e) =>
                            setFormData({ ...formData, siteAddress: e.target.value })
                          }
                          placeholder="Enter complete address"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="siteContactName">Contact Name</Label>
                          <Input
                            id="siteContactName"
                            value={formData.siteContactName}
                            onChange={(e) =>
                              setFormData({ ...formData, siteContactName: e.target.value })
                            }
                            placeholder="Contact person"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="siteContactMobile">Contact Mobile</Label>
                          <Input
                            id="siteContactMobile"
                            value={formData.siteContactMobile}
                            onChange={(e) =>
                              setFormData({ ...formData, siteContactMobile: e.target.value })
                            }
                            placeholder="+971 XX XXX XXXX"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="siteAccessNotes">Access Notes</Label>
                        <Textarea
                          id="siteAccessNotes"
                          value={formData.siteAccessNotes}
                          onChange={(e) =>
                            setFormData({ ...formData, siteAccessNotes: e.target.value })
                          }
                          placeholder="Gate pass, parking instructions, landmarks..."
                          rows={2}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Section E: Requested Time Window */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Requested Time Window</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="requestedDate">
                      Requested Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="requestedDate"
                      type="date"
                      value={formData.requestedDate}
                      onChange={(e) =>
                        setFormData({ ...formData, requestedDate: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="windowFrom">
                        Window From <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="windowFrom"
                        type="time"
                        value={formData.windowFrom}
                        onChange={(e) =>
                          setFormData({ ...formData, windowFrom: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="windowTo">
                        Window To <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="windowTo"
                        type="time"
                        value={formData.windowTo}
                        onChange={(e) =>
                          setFormData({ ...formData, windowTo: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetTime">Target Time</Label>
                    <Input
                      id="targetTime"
                      type="time"
                      value={formData.targetTime}
                      onChange={(e) =>
                        setFormData({ ...formData, targetTime: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialInstructions">Special Instructions</Label>
                    <Textarea
                      id="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={(e) =>
                        setFormData({ ...formData, specialInstructions: e.target.value })
                      }
                      placeholder="e.g., Wait max 15 minutes"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Section F: Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Internal Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    id="internalNotes"
                    value={formData.internalNotes}
                    onChange={(e) =>
                      setFormData({ ...formData, internalNotes: e.target.value })
                    }
                    placeholder="Add internal notes or special instructions..."
                    rows={3}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.type || !formData.subtype || !formData.owningBranch}
          >
            Save Request
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
