import { useState, useEffect } from "react";
import { FileText, Building2, Car, MapPin, Clock, StickyNote } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const REQUEST_TYPES = [
  "Contract-Related",
  "Internal",
  "Maintenance Transfer"
];

const SUBTYPES = {
  "Contract-Related": ["Vehicle Delivery", "Vehicle Pick-up"],
  "Internal": ["Wash", "Tires and Batteries", "Refuel"],
  "Maintenance Transfer": ["Maintenance Workshop"],
};

const EMIRATES = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain"
];

const BRANCHES_BY_EMIRATE: Record<string, string[]> = {
  "Dubai": [
    "Dubai Marina Branch",
    "Sheikh Zayed Road Branch",
    "Downtown Dubai Branch",
    "Business Bay Branch",
    "JBR Branch",
    "DIFC Branch",
    "Deira Branch",
    "Bur Dubai Branch"
  ],
  "Abu Dhabi": [
    "Corniche Branch",
    "Al Reem Island Branch",
    "Yas Island Branch",
    "Airport Road Branch"
  ],
  "Sharjah": [
    "Al Nahda Branch",
    "Rolla Branch",
    "Industrial Area Branch"
  ],
  "Ajman": [
    "City Center Branch",
    "Al Nuaimiya Branch"
  ],
  "Ras Al Khaimah": [
    "RAK City Branch",
    "Al Hamra Branch"
  ],
  "Fujairah": [
    "Fujairah City Branch",
    "Dibba Branch"
  ],
  "Umm Al Quwain": [
    "UAQ City Branch"
  ]
};

const DEPARTMENTS = [
  "Operations",
  "Sales",
  "Customer Service",
  "Fleet Management",
  "Maintenance",
  "Admin"
];

const MOCK_CONTRACT_LINES = [
  {
    value: "line1",
    label: "Line 1 - BMW X5 (DXB-12345) - 12 Months - Expires: 2025-12-31",
    customer: "ABC Company Ltd.",
    contractType: "Yearly",
    contractStatus: "Active",
    contractPeriod: "2024-06-01 to 2025-12-31",
    customerType: "Corporate",
    vehicle: {
      vin: 'WBADT4305RGZ12345',
      plate: 'DXB-12345',
      make: 'BMW',
      model: 'X5',
      year: 2024,
      vehicleClass: 'Luxury SUV',
      itemCode: 'VH-2024-001',
      description: '2024 BMW X5 xDrive40i - White',
      odometer: 1250,
    }
  },
  {
    value: "line2",
    label: "Line 2 - Toyota Camry (SHJ-98765) - 6 Months - Expires: 2025-09-15",
    customer: "XYZ Trading LLC",
    contractType: "Monthly",
    contractStatus: "Active",
    contractPeriod: "2025-03-15 to 2025-09-15",
    customerType: "Corporate",
    vehicle: {
      vin: 'JTDKBRFU5J3123456',
      plate: 'SHJ-98765',
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      vehicleClass: 'Sedan',
      itemCode: 'VH-2023-045',
      description: '2023 Toyota Camry SE - Silver',
      odometer: 8750,
    }
  },
  {
    value: "line3",
    label: "Line 3 - Mercedes S-Class (AUH-55555) - 24 Months - Expires: 2026-06-30",
    customer: "Premium Holdings",
    contractType: "Long-term",
    contractStatus: "Active",
    contractPeriod: "2024-07-01 to 2026-06-30",
    customerType: "VIP",
    vehicle: {
      vin: 'WDDUG8CB8LA123456',
      plate: 'AUH-55555',
      make: 'Mercedes-Benz',
      model: 'S-Class',
      year: 2024,
      vehicleClass: 'Luxury Sedan',
      itemCode: 'VH-2024-012',
      description: '2024 Mercedes S-Class AMG - Black',
      odometer: 2100,
    }
  }
];

export function NewLogisticsRequestSheet({
  open,
  onOpenChange,
  onSuccess,
}: NewLogisticsRequestSheetProps) {
  const [formData, setFormData] = useState({
    // Form Meta
    requestReference: "",
    requestedBy: "",
    requestorDepartment: "",
    requestorContact: "",
    type: "Contract-Related",
    subtype: "",
    priority: "Normal",
    emirate: "",
    owningBranch: "",
    
    // Contract
    contractNumber: "",
    contractLine: "",
    customer: "",
    contractType: "",
    contractStatus: "",
    contractPeriod: "",
    customerType: "",
    
    // Location
    deliveryLocationType: "Our Office",
    office: "",
    siteName: "",
    siteAddress: "",
    customerSiteEmirate: "",
    customerSiteArea: "",
    customerSiteBuilding: "",
    customerSiteLandmark: "",
    customerSiteFloor: "",
    customerSiteGPS: "",
    customerSiteBestAccessTime: "",
    customerSiteParkingNotes: "",
    siteContactName: "",
    siteContactMobile: "",
    siteAccessNotes: "",
    
    // Return Destination (Vehicle Pick-up)
    returnDestType: "Our Office",
    returnOffice: "",
    returnSiteEmirate: "",
    returnSiteArea: "",
    returnSiteName: "",
    returnSiteAddress: "",
    returnSiteBuilding: "",
    returnSiteLandmark: "",
    returnSiteFloor: "",
    returnSiteGPS: "",
    returnSiteBestAccessTime: "",
    returnSiteParkingNotes: "",
    returnSiteContactName: "",
    returnSiteContactMobile: "",
    returnSiteAccessNotes: "",
    
    // Time
    requestedDate: "",
    windowFrom: "",
    windowTo: "",
    targetTime: "",
    specialInstructions: "",
    
    // Notes
    internalNotes: "",
  });

  const [vehicleData, setVehicleData] = useState<any>(null);
  const [odometerOverride, setOdometerOverride] = useState(false);
  const [customOdometer, setCustomOdometer] = useState("");

  // Generate request reference on mount
  useEffect(() => {
    if (!formData.requestReference) {
      const refNumber = `LR-2025-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;
      setFormData(prev => ({ ...prev, requestReference: refNumber }));
    }
  }, []);

  const handleTypeChange = (value: string) => {
    setFormData({
      ...formData,
      type: value,
      subtype: "", // Reset subtype when type changes
    });
  };

  const handleContractLineChange = (value: string) => {
    const selectedLine = MOCK_CONTRACT_LINES.find(line => line.value === value);
    
    if (selectedLine) {
      setVehicleData(selectedLine.vehicle);
      setFormData({ 
        ...formData, 
        contractLine: value,
        customer: selectedLine.customer,
        contractType: selectedLine.contractType,
        contractStatus: selectedLine.contractStatus,
        contractPeriod: selectedLine.contractPeriod,
        customerType: selectedLine.customerType,
      });
    } else {
      setVehicleData(null);
      setFormData({
        ...formData,
        contractLine: value,
        customer: "",
        contractType: "",
        contractStatus: "",
        contractPeriod: "",
        customerType: "",
      });
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
      requestReference: "",
      requestedBy: "",
      requestorDepartment: "",
      requestorContact: "",
      type: "Contract-Related",
      subtype: "",
      priority: "Normal",
      emirate: "",
      owningBranch: "",
      contractNumber: "",
      contractLine: "",
      customer: "",
      contractType: "",
      contractStatus: "",
      contractPeriod: "",
      customerType: "",
      deliveryLocationType: "Our Office",
      office: "",
      siteName: "",
      siteAddress: "",
      customerSiteEmirate: "",
      customerSiteArea: "",
      customerSiteBuilding: "",
      customerSiteLandmark: "",
      customerSiteFloor: "",
      customerSiteGPS: "",
      customerSiteBestAccessTime: "",
      customerSiteParkingNotes: "",
      siteContactName: "",
      siteContactMobile: "",
      siteAccessNotes: "",
      returnDestType: "Our Office",
      returnOffice: "",
      returnSiteEmirate: "",
      returnSiteArea: "",
      returnSiteName: "",
      returnSiteAddress: "",
      returnSiteBuilding: "",
      returnSiteLandmark: "",
      returnSiteFloor: "",
      returnSiteGPS: "",
      returnSiteBestAccessTime: "",
      returnSiteParkingNotes: "",
      returnSiteContactName: "",
      returnSiteContactMobile: "",
      returnSiteAccessNotes: "",
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

  const availableBranches = formData.emirate ? BRANCHES_BY_EMIRATE[formData.emirate] || [] : [];

  const availableSubtypes = SUBTYPES[formData.type as keyof typeof SUBTYPES] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full h-screen m-0 rounded-none p-0">
        <div className="h-full overflow-y-auto">
          <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
            <DialogHeader>
              <DialogTitle>New Logistics Request</DialogTitle>
            </DialogHeader>
          </div>

          <div className="space-y-6 px-6 py-6">
          {/* Request Information Section */}
          <Card>
            <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Request Information
            </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Request Reference */}
              <div className="space-y-2">
                <Label>Request Reference</Label>
                <div className="p-2 bg-muted rounded-md text-sm font-mono">
                  {formData.requestReference}
                </div>
              </div>

              {/* Requested By & Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requestedBy">
                    Requested By <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="requestedBy"
                    value={formData.requestedBy}
                    onChange={(e) =>
                      setFormData({ ...formData, requestedBy: e.target.value })
                    }
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requestorDepartment">
                    Department <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.requestorDepartment}
                    onValueChange={(value) =>
                      setFormData({ ...formData, requestorDepartment: value })
                    }
                  >
                    <SelectTrigger id="requestorDepartment">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Requestor Contact */}
              <div className="space-y-2">
                <Label htmlFor="requestorContact">
                  Contact Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="requestorContact"
                  value={formData.requestorContact}
                  onChange={(e) =>
                    setFormData({ ...formData, requestorContact: e.target.value })
                  }
                  placeholder="+971 XX XXX XXXX"
                />
              </div>

              <div className="border-t my-4" />
              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">
                  Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REQUEST_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

              <div className="border-t my-4" />

              {/* Emirate & Owning Branch */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emirate">
                    Emirate <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.emirate}
                    onValueChange={(value) => {
                      setFormData({ ...formData, emirate: value, owningBranch: "" });
                    }}
                  >
                    <SelectTrigger id="emirate">
                      <SelectValue placeholder="Select emirate" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMIRATES.map((emirate) => (
                        <SelectItem key={emirate} value={emirate}>
                          {emirate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owningBranch">
                    Owning Branch/Office <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.owningBranch}
                    onValueChange={(value) =>
                      setFormData({ ...formData, owningBranch: value })
                    }
                    disabled={!formData.emirate}
                  >
                    <SelectTrigger id="owningBranch">
                      <SelectValue placeholder={formData.emirate ? "Select branch" : "Select emirate first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBranches.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Delivery & Pick-up Sections */}
          {formData.type === "Contract-Related" && (formData.subtype === "Vehicle Delivery" || formData.subtype === "Vehicle Pick-up") && (
            <>
              {/* Section B: Contract Linkage */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Contract Linkage
                  </CardTitle>
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
                        {MOCK_CONTRACT_LINES.map((line) => (
                          <SelectItem key={line.value} value={line.value}>
                            {line.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.customer && (
                    <>
                      <div className="space-y-2">
                        <Label>Customer</Label>
                        <div className="p-2 bg-muted rounded-md text-sm font-medium">
                          {formData.customer}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Contract Type</Label>
                          <Badge variant={
                            formData.contractType === "Yearly" ? "default" :
                            formData.contractType === "Long-term" ? "secondary" : "outline"
                          }>
                            {formData.contractType}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Contract Status</Label>
                          <Badge variant={
                            formData.contractStatus === "Active" ? "default" :
                            formData.contractStatus === "Expiring Soon" ? "destructive" : "outline"
                          }>
                            {formData.contractStatus}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Contract Period</Label>
                        <div className="text-sm">{formData.contractPeriod}</div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Customer Type</Label>
                        <Badge variant={
                          formData.customerType === "VIP" ? "secondary" :
                          formData.customerType === "Corporate" ? "default" : "outline"
                        }>
                          {formData.customerType}
                        </Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Section C: Vehicle Details */}
              {vehicleData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Car className="w-4 h-4" />
                      Vehicle Details
                    </CardTitle>
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

              {/* Section D: Delivery Location (Vehicle Delivery Only) */}
              {formData.subtype === "Vehicle Delivery" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Delivery Location
                    </CardTitle>
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
                          {Object.entries(BRANCHES_BY_EMIRATE).map(([emirate, branches]) => (
                            <optgroup key={emirate} label={emirate}>
                              {branches.map((branch) => (
                                <SelectItem key={branch} value={branch}>
                                  {branch}
                                </SelectItem>
                              ))}
                            </optgroup>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {formData.deliveryLocationType === "Customer Site" && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="customerSiteEmirate">
                            Emirate <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={formData.customerSiteEmirate}
                            onValueChange={(value) =>
                              setFormData({ ...formData, customerSiteEmirate: value })
                            }
                          >
                            <SelectTrigger id="customerSiteEmirate">
                              <SelectValue placeholder="Select emirate" />
                            </SelectTrigger>
                            <SelectContent>
                              {EMIRATES.map((emirate) => (
                                <SelectItem key={emirate} value={emirate}>
                                  {emirate}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customerSiteArea">
                            Area/District <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="customerSiteArea"
                            value={formData.customerSiteArea}
                            onChange={(e) =>
                              setFormData({ ...formData, customerSiteArea: e.target.value })
                            }
                            placeholder="e.g., Dubai Marina, Business Bay"
                          />
                        </div>
                      </div>

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
                          Street Address <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="siteAddress"
                          value={formData.siteAddress}
                          onChange={(e) =>
                            setFormData({ ...formData, siteAddress: e.target.value })
                          }
                          placeholder="Enter complete street address"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="customerSiteBuilding">Building/Complex Name</Label>
                          <Input
                            id="customerSiteBuilding"
                            value={formData.customerSiteBuilding}
                            onChange={(e) =>
                              setFormData({ ...formData, customerSiteBuilding: e.target.value })
                            }
                            placeholder="e.g., Marina Plaza Tower"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customerSiteLandmark">Landmark</Label>
                          <Input
                            id="customerSiteLandmark"
                            value={formData.customerSiteLandmark}
                            onChange={(e) =>
                              setFormData({ ...formData, customerSiteLandmark: e.target.value })
                            }
                            placeholder="e.g., Near Mall of the Emirates"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="customerSiteFloor">Floor/Office Number</Label>
                          <Input
                            id="customerSiteFloor"
                            value={formData.customerSiteFloor}
                            onChange={(e) =>
                              setFormData({ ...formData, customerSiteFloor: e.target.value })
                            }
                            placeholder="e.g., 12th Floor, Office 1205"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customerSiteGPS">GPS Coordinates (Optional)</Label>
                          <Input
                            id="customerSiteGPS"
                            value={formData.customerSiteGPS}
                            onChange={(e) =>
                              setFormData({ ...formData, customerSiteGPS: e.target.value })
                            }
                            placeholder="25.0760, 55.1328"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customerSiteBestAccessTime">Best Access Time</Label>
                        <Input
                          id="customerSiteBestAccessTime"
                          value={formData.customerSiteBestAccessTime}
                          onChange={(e) =>
                            setFormData({ ...formData, customerSiteBestAccessTime: e.target.value })
                          }
                          placeholder="e.g., 8 AM - 6 PM weekdays"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customerSiteParkingNotes">Parking Notes</Label>
                        <Input
                          id="customerSiteParkingNotes"
                          value={formData.customerSiteParkingNotes}
                          onChange={(e) =>
                            setFormData({ ...formData, customerSiteParkingNotes: e.target.value })
                          }
                          placeholder="e.g., Basement parking, security clearance needed"
                        />
                      </div>

                      <div className="border-t my-4" />

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
                        <Label htmlFor="siteAccessNotes">Access Instructions</Label>
                        <Textarea
                          id="siteAccessNotes"
                          value={formData.siteAccessNotes}
                          onChange={(e) =>
                            setFormData({ ...formData, siteAccessNotes: e.target.value })
                          }
                          placeholder="Gate pass requirements, security procedures, special access instructions..."
                          rows={3}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              )}

              {/* Section D: Pick-up Location (Vehicle Pick-up Only) */}
              {formData.subtype === "Vehicle Pick-up" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Pick-up Location
                    </CardTitle>
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
                          <RadioGroupItem value="Our Office" id="office-pickup" />
                          <Label htmlFor="office-pickup" className="font-normal cursor-pointer">
                            Our Office
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Customer Site" id="customer-site-pickup" />
                          <Label htmlFor="customer-site-pickup" className="font-normal cursor-pointer">
                            Customer Site
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.deliveryLocationType === "Our Office" && (
                      <div className="space-y-2">
                        <Label htmlFor="office-pickup-select">
                          Office <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.office}
                          onValueChange={(value) =>
                            setFormData({ ...formData, office: value })
                          }
                        >
                          <SelectTrigger id="office-pickup-select">
                            <SelectValue placeholder="Select office" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(BRANCHES_BY_EMIRATE).map(([emirate, branches]) => (
                              <optgroup key={emirate} label={emirate}>
                                {branches.map((branch) => (
                                  <SelectItem key={branch} value={branch}>
                                    {branch}
                                  </SelectItem>
                                ))}
                              </optgroup>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {formData.deliveryLocationType === "Customer Site" && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="customerSiteEmirate-pickup">
                              Emirate <span className="text-destructive">*</span>
                            </Label>
                            <Select
                              value={formData.customerSiteEmirate}
                              onValueChange={(value) =>
                                setFormData({ ...formData, customerSiteEmirate: value })
                              }
                            >
                              <SelectTrigger id="customerSiteEmirate-pickup">
                                <SelectValue placeholder="Select emirate" />
                              </SelectTrigger>
                              <SelectContent>
                                {EMIRATES.map((emirate) => (
                                  <SelectItem key={emirate} value={emirate}>
                                    {emirate}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="customerSiteArea-pickup">
                              Area/District <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="customerSiteArea-pickup"
                              value={formData.customerSiteArea}
                              onChange={(e) =>
                                setFormData({ ...formData, customerSiteArea: e.target.value })
                              }
                              placeholder="e.g., Dubai Marina, Business Bay"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="siteName-pickup">
                            Site Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="siteName-pickup"
                            value={formData.siteName}
                            onChange={(e) =>
                              setFormData({ ...formData, siteName: e.target.value })
                            }
                            placeholder="Enter site name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="siteAddress-pickup">
                            Street Address <span className="text-destructive">*</span>
                          </Label>
                          <Textarea
                            id="siteAddress-pickup"
                            value={formData.siteAddress}
                            onChange={(e) =>
                              setFormData({ ...formData, siteAddress: e.target.value })
                            }
                            placeholder="Enter complete street address"
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="customerSiteBuilding-pickup">Building/Complex Name</Label>
                            <Input
                              id="customerSiteBuilding-pickup"
                              value={formData.customerSiteBuilding}
                              onChange={(e) =>
                                setFormData({ ...formData, customerSiteBuilding: e.target.value })
                              }
                              placeholder="e.g., Marina Plaza Tower"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="customerSiteLandmark-pickup">Landmark</Label>
                            <Input
                              id="customerSiteLandmark-pickup"
                              value={formData.customerSiteLandmark}
                              onChange={(e) =>
                                setFormData({ ...formData, customerSiteLandmark: e.target.value })
                              }
                              placeholder="e.g., Near Mall of the Emirates"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="customerSiteFloor-pickup">Floor/Office Number</Label>
                            <Input
                              id="customerSiteFloor-pickup"
                              value={formData.customerSiteFloor}
                              onChange={(e) =>
                                setFormData({ ...formData, customerSiteFloor: e.target.value })
                              }
                              placeholder="e.g., 12th Floor, Office 1205"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="customerSiteGPS-pickup">GPS Coordinates (Optional)</Label>
                            <Input
                              id="customerSiteGPS-pickup"
                              value={formData.customerSiteGPS}
                              onChange={(e) =>
                                setFormData({ ...formData, customerSiteGPS: e.target.value })
                              }
                              placeholder="25.0760, 55.1328"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="customerSiteBestAccessTime-pickup">Best Access Time</Label>
                          <Input
                            id="customerSiteBestAccessTime-pickup"
                            value={formData.customerSiteBestAccessTime}
                            onChange={(e) =>
                              setFormData({ ...formData, customerSiteBestAccessTime: e.target.value })
                            }
                            placeholder="e.g., 8 AM - 6 PM weekdays"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="customerSiteParkingNotes-pickup">Parking Notes</Label>
                          <Input
                            id="customerSiteParkingNotes-pickup"
                            value={formData.customerSiteParkingNotes}
                            onChange={(e) =>
                              setFormData({ ...formData, customerSiteParkingNotes: e.target.value })
                            }
                            placeholder="e.g., Basement parking, security clearance needed"
                          />
                        </div>

                        <div className="border-t my-4" />

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="siteContactName-pickup">Contact Name</Label>
                            <Input
                              id="siteContactName-pickup"
                              value={formData.siteContactName}
                              onChange={(e) =>
                                setFormData({ ...formData, siteContactName: e.target.value })
                              }
                              placeholder="Contact person"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="siteContactMobile-pickup">Contact Mobile</Label>
                            <Input
                              id="siteContactMobile-pickup"
                              value={formData.siteContactMobile}
                              onChange={(e) =>
                                setFormData({ ...formData, siteContactMobile: e.target.value })
                              }
                              placeholder="+971 XX XXX XXXX"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="siteAccessNotes-pickup">
                            Access Instructions
                          </Label>
                          <Textarea
                            id="siteAccessNotes-pickup"
                            value={formData.siteAccessNotes}
                            onChange={(e) =>
                              setFormData({ ...formData, siteAccessNotes: e.target.value })
                            }
                            placeholder="Gate pass requirements, security procedures, special access instructions..."
                            rows={3}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Section E: Return Destination (Vehicle Pick-up Only) */}
              {formData.subtype === "Vehicle Pick-up" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Return Destination
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>
                        Destination Type <span className="text-destructive">*</span>
                      </Label>
                      <RadioGroup
                        value={formData.returnDestType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, returnDestType: value })
                        }
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Our Office" id="return-office" />
                          <Label htmlFor="return-office" className="font-normal cursor-pointer">
                            Our Office
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Customer Site" id="return-customer-site" />
                          <Label htmlFor="return-customer-site" className="font-normal cursor-pointer">
                            Customer Site
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.returnDestType === "Our Office" && (
                      <div className="space-y-2">
                        <Label htmlFor="return-office-select">
                          Office <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.returnOffice}
                          onValueChange={(value) =>
                            setFormData({ ...formData, returnOffice: value })
                          }
                        >
                          <SelectTrigger id="return-office-select">
                            <SelectValue placeholder="Select office" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(BRANCHES_BY_EMIRATE).map(([emirate, branches]) => (
                              <optgroup key={emirate} label={emirate}>
                                {branches.map((branch) => (
                                  <SelectItem key={branch} value={branch}>
                                    {branch}
                                  </SelectItem>
                                ))}
                              </optgroup>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {formData.returnDestType === "Customer Site" && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="returnSiteEmirate">
                              Emirate <span className="text-destructive">*</span>
                            </Label>
                            <Select
                              value={formData.returnSiteEmirate}
                              onValueChange={(value) =>
                                setFormData({ ...formData, returnSiteEmirate: value })
                              }
                            >
                              <SelectTrigger id="returnSiteEmirate">
                                <SelectValue placeholder="Select emirate" />
                              </SelectTrigger>
                              <SelectContent>
                                {EMIRATES.map((emirate) => (
                                  <SelectItem key={emirate} value={emirate}>
                                    {emirate}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="returnSiteArea">
                              Area/District <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="returnSiteArea"
                              value={formData.returnSiteArea}
                              onChange={(e) =>
                                setFormData({ ...formData, returnSiteArea: e.target.value })
                              }
                              placeholder="e.g., Dubai Marina, Business Bay"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="returnSiteName">
                            Site Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="returnSiteName"
                            value={formData.returnSiteName}
                            onChange={(e) =>
                              setFormData({ ...formData, returnSiteName: e.target.value })
                            }
                            placeholder="Enter site name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="returnSiteAddress">
                            Street Address <span className="text-destructive">*</span>
                          </Label>
                          <Textarea
                            id="returnSiteAddress"
                            value={formData.returnSiteAddress}
                            onChange={(e) =>
                              setFormData({ ...formData, returnSiteAddress: e.target.value })
                            }
                            placeholder="Enter complete street address"
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="returnSiteBuilding">Building/Complex Name</Label>
                            <Input
                              id="returnSiteBuilding"
                              value={formData.returnSiteBuilding}
                              onChange={(e) =>
                                setFormData({ ...formData, returnSiteBuilding: e.target.value })
                              }
                              placeholder="e.g., Marina Plaza Tower"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="returnSiteLandmark">Landmark</Label>
                            <Input
                              id="returnSiteLandmark"
                              value={formData.returnSiteLandmark}
                              onChange={(e) =>
                                setFormData({ ...formData, returnSiteLandmark: e.target.value })
                              }
                              placeholder="e.g., Near Mall of the Emirates"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="returnSiteFloor">Floor/Office Number</Label>
                            <Input
                              id="returnSiteFloor"
                              value={formData.returnSiteFloor}
                              onChange={(e) =>
                                setFormData({ ...formData, returnSiteFloor: e.target.value })
                              }
                              placeholder="e.g., 12th Floor, Office 1205"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="returnSiteGPS">GPS Coordinates (Optional)</Label>
                            <Input
                              id="returnSiteGPS"
                              value={formData.returnSiteGPS}
                              onChange={(e) =>
                                setFormData({ ...formData, returnSiteGPS: e.target.value })
                              }
                              placeholder="25.0760, 55.1328"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="returnSiteBestAccessTime">Best Access Time</Label>
                          <Input
                            id="returnSiteBestAccessTime"
                            value={formData.returnSiteBestAccessTime}
                            onChange={(e) =>
                              setFormData({ ...formData, returnSiteBestAccessTime: e.target.value })
                            }
                            placeholder="e.g., 8 AM - 6 PM weekdays"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="returnSiteParkingNotes">Parking Notes</Label>
                          <Input
                            id="returnSiteParkingNotes"
                            value={formData.returnSiteParkingNotes}
                            onChange={(e) =>
                              setFormData({ ...formData, returnSiteParkingNotes: e.target.value })
                            }
                            placeholder="e.g., Basement parking, security clearance needed"
                          />
                        </div>

                        <div className="border-t my-4" />

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="returnSiteContactName">Contact Name</Label>
                            <Input
                              id="returnSiteContactName"
                              value={formData.returnSiteContactName}
                              onChange={(e) =>
                                setFormData({ ...formData, returnSiteContactName: e.target.value })
                              }
                              placeholder="Contact person"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="returnSiteContactMobile">Contact Mobile</Label>
                            <Input
                              id="returnSiteContactMobile"
                              value={formData.returnSiteContactMobile}
                              onChange={(e) =>
                                setFormData({ ...formData, returnSiteContactMobile: e.target.value })
                              }
                              placeholder="+971 XX XXX XXXX"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="returnSiteAccessNotes">Access Instructions</Label>
                          <Textarea
                            id="returnSiteAccessNotes"
                            value={formData.returnSiteAccessNotes}
                            onChange={(e) =>
                              setFormData({ ...formData, returnSiteAccessNotes: e.target.value })
                            }
                            placeholder="Gate pass requirements, security procedures, special access instructions..."
                            rows={3}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Section F: Requested Time Window */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Requested Time Window
                  </CardTitle>
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

              {/* Section G: Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <StickyNote className="w-4 h-4" />
                    Internal Notes
                  </CardTitle>
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
          <div className="sticky bottom-0 bg-background border-t px-6 py-4">
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  !formData.type || 
                  !formData.subtype || 
                  !formData.requestedBy || 
                  !formData.requestorDepartment || 
                  !formData.requestorContact || 
                  !formData.emirate || 
                  !formData.owningBranch
                }
              >
                Save Request
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
