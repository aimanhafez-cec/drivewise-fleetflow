import { useState, useEffect } from "react";
import { FileText, Building2, Car, MapPin, Clock, StickyNote, Droplets, Fuel, Wrench, Users, DollarSign, Paperclip } from "lucide-react";
import { VehicleSelect } from "@/components/ui/select-components";
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
  mode?: "create" | "view";
  requestData?: any;
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

// Phase 2: Subtype-specific constants
const WASH_TYPES = ["Exterior", "Interior", "Full", "Detailing"];
const WASH_PROVIDERS = ["In-house", "External Vendor"];
const PREP_ITEMS = ["Floor mats", "Perfume", "Wipes", "Windows"];

const REFUEL_TARGETS = ["Full Tank", "Half Tank", "Specific Liters"];
const FUEL_TYPES = ["E-Plus 91", "Special 95", "Super 98", "Diesel"];
const PAYMENT_METHODS = ["Fleet Card", "Cash", "Other"];

const TB_ACTION_TYPES = [
  "Tire Change",
  "Tire Repair",
  "Tire Rotation",
  "Battery Replace",
  "Battery Jumpstart",
  "Battery Test"
];
const WORKSHOP_PROVIDERS = ["In-house Bay", "External Vendor"];
const TIRE_POSITIONS = ["FL", "FR", "RL", "RR", "Spare"];

// Phase 3: Operational constants
const ASSIGNMENT_MODES = ["Auto-Assign", "Specific Driver", "Specific Origin Branch"];

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
  mode = "create",
  requestData = null,
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
    
    // Internal Request Fields
    associateWithContract: false,
    vehicleId: "",
    startLocationType: "Our Office",
    startOffice: "",
    startAddress: "",
    endLocationType: "Our Office",
    endOffice: "",
    endAddress: "",
    locationNotes: "",
    
    // Phase 2: Wash fields
    washType: "",
    washProvider: "",
    washVendorName: "",
    washPrepItems: [] as string[],
    washNotes: "",
    
    // Phase 2: Refuel fields
    refuelTarget: "",
    targetLiters: "",
    fuelType: "",
    fuelStation: "",
    paymentMethod: "",
    refuelNotes: "",
    
    // Phase 2: Tires & Batteries fields
    tbActionType: "",
    tbWorkshopProvider: "",
    tbVendorName: "",
    tireQuantity: "",
    tireSize: "",
    tireBrandModel: "",
    tirePositions: [] as string[],
    tireOldNotes: "",
    batteryTypeCapacity: "",
    batteryBrandModel: "",
    batterySerial: "",
    batteryWarranty: "",
    batteryOldNotes: "",
    tbNotes: "",
    
    // Phase 3: Operational fields
    assignmentMode: "Auto-Assign",
    preferredDriverId: "",
    preferredOriginBranch: "",
    internalRunFee: "",
    partsMaterialsEst: "",
    attachments: [] as File[],
  });

  const [vehicleData, setVehicleData] = useState<any>(null);
  const [odometerOverride, setOdometerOverride] = useState(false);
  const [customOdometer, setCustomOdometer] = useState("");

  // Generate request reference on mount
  useEffect(() => {
    if (!formData.requestReference && mode === "create") {
      const refNumber = `LR-2025-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;
      setFormData(prev => ({ ...prev, requestReference: refNumber }));
    }
  }, [mode]);

  // Populate form data from requestData in view mode
  useEffect(() => {
    if (mode === "view" && requestData && open) {
      setFormData(requestData);
      if (requestData.vehicleDetails) {
        setVehicleData(requestData.vehicleDetails);
      }
    }
  }, [mode, requestData, open]);

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
    // Validate Internal requests
    if (formData.type === "Internal") {
      // Validate vehicle selection
      if (!formData.vehicleId) {
        alert("Please select a vehicle for Internal request");
        return;
      }
      
      // Validate start location
      if (formData.startLocationType === "Our Office" && !formData.startOffice) {
        alert("Please select start office location");
        return;
      }
      if (formData.startLocationType === "Address" && !formData.startAddress) {
        alert("Please enter start address");
        return;
      }
      
      // Validate end location
      if (formData.endLocationType === "Our Office" && !formData.endOffice) {
        alert("Please select end office location");
        return;
      }
      if (formData.endLocationType === "Address" && !formData.endAddress) {
        alert("Please enter end address");
        return;
      }
      
      // Validate time window
      if (!formData.requestedDate || !formData.windowFrom || !formData.windowTo) {
        alert("Please complete the requested time window");
        return;
      }
      
      // Validate subtype-specific fields
      if (formData.subtype === "Wash") {
        if (!formData.washType) {
          alert("Please select a wash type");
          return;
        }
      }
      
      if (formData.subtype === "Refuel") {
        if (!formData.refuelTarget || !formData.fuelType) {
          alert("Please complete refuel target and fuel type");
          return;
        }
        if (formData.refuelTarget === "Specific Liters" && !formData.targetLiters) {
          alert("Please enter target liters for refueling");
          return;
        }
      }
      
      if (formData.subtype === "Tires and Batteries") {
        if (!formData.tbActionType) {
          alert("Please select an action type");
          return;
        }
      }
    }
    
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
      associateWithContract: false,
      vehicleId: "",
      startLocationType: "Our Office",
      startOffice: "",
      startAddress: "",
      endLocationType: "Our Office",
      endOffice: "",
      endAddress: "",
      locationNotes: "",
      washType: "",
      washProvider: "",
      washVendorName: "",
      washPrepItems: [],
      washNotes: "",
      refuelTarget: "",
      targetLiters: "",
      fuelType: "",
      fuelStation: "",
      paymentMethod: "",
      refuelNotes: "",
      tbActionType: "",
      tbWorkshopProvider: "",
      tbVendorName: "",
      tireQuantity: "",
      tireSize: "",
      tireBrandModel: "",
      tirePositions: [],
      tireOldNotes: "",
      batteryTypeCapacity: "",
      batteryBrandModel: "",
      batterySerial: "",
      batteryWarranty: "",
      batteryOldNotes: "",
      tbNotes: "",
      assignmentMode: "Auto-Assign",
      preferredDriverId: "",
      preferredOriginBranch: "",
      internalRunFee: "",
      partsMaterialsEst: "",
      attachments: [],
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
              <DialogTitle>
                {mode === "view" ? `View Logistics Request - ${formData.requestReference || 'Loading...'}` : "New Logistics Request"}
              </DialogTitle>
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
                    disabled={mode === "view"}
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
                    disabled={mode === "view"}
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
                  disabled={mode === "view"}
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
                  disabled={mode === "view"}
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
                  disabled={mode === "view"}
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
                  disabled={mode === "view"}
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
                    disabled={mode === "view"}
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
                    disabled={!formData.emirate || mode === "view"}
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

          {/* Optional Contract Association Toggle for Internal */}
          {formData.type === "Internal" && (
            <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
              <Switch 
                id="associate-contract"
                checked={formData.associateWithContract}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, associateWithContract: checked })
                }
                disabled={mode === "view"}
              />
              <Label htmlFor="associate-contract" className="cursor-pointer">
                Associate with Contract? (Optional)
              </Label>
            </div>
          )}

          {/* Vehicle Delivery & Pick-up Sections + Internal Contract Association */}
          {((formData.type === "Contract-Related" && (formData.subtype === "Vehicle Delivery" || formData.subtype === "Vehicle Pick-up")) ||
            (formData.type === "Internal" && formData.associateWithContract)) && (
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
                      disabled={mode === "view"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractLine">
                      Contract Line <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.contractLine}
                      onValueChange={handleContractLineChange}
                      disabled={mode === "view"}
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

              {/* Section: Vehicle Selection (Internal Only) */}
              {formData.type === "Internal" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Car className="w-4 h-4" />
                      Vehicle
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>
                        Vehicle (VIN or Plate) <span className="text-destructive">*</span>
                      </Label>
                      <VehicleSelect
                        value={formData.vehicleId}
                        onChange={(value) => {
                          setFormData({ ...formData, vehicleId: value as string });
                          // TODO: Fetch and set vehicle data when backend is ready
                        }}
                        placeholder="Search by VIN or license plate..."
                        disabled={mode === "view"}
                      />
                    </div>

                    {/* Read-only vehicle details (when vehicle is selected) */}
                    {vehicleData && (
                      <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                        <div>
                          <Label className="text-xs text-muted-foreground">Make / Model</Label>
                          <p className="text-sm font-medium">{vehicleData.make} {vehicleData.model}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Year</Label>
                          <p className="text-sm font-medium">{vehicleData.year}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Vehicle Class</Label>
                          <p className="text-sm font-medium">{vehicleData.vehicleClass}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Current Odometer</Label>
                          <p className="text-sm font-medium">{vehicleData.odometer} km</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Section: Start & End Locations (Internal Only - Simplified) */}
              {formData.type === "Internal" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Start &amp; End Locations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* START LOCATION */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Start Location</h4>
                      
                      <RadioGroup
                        value={formData.startLocationType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, startLocationType: value })
                        }
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Our Office" id="start-office" />
                          <Label htmlFor="start-office" className="font-normal cursor-pointer">
                            Our Office
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Address" id="start-address" />
                          <Label htmlFor="start-address" className="font-normal cursor-pointer">
                            Address
                          </Label>
                        </div>
                      </RadioGroup>

                      {formData.startLocationType === "Our Office" && (
                        <div className="space-y-2">
                          <Label>
                            Office <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={formData.startOffice}
                            onValueChange={(value) =>
                              setFormData({ ...formData, startOffice: value })
                            }
                          >
                            <SelectTrigger>
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

                      {formData.startLocationType === "Address" && (
                        <div className="space-y-2">
                          <Label>
                            Address <span className="text-destructive">*</span>
                          </Label>
                          <Textarea
                            value={formData.startAddress}
                            onChange={(e) =>
                              setFormData({ ...formData, startAddress: e.target.value })
                            }
                            placeholder="e.g., Workshop Bay 3, Industrial Area 1, Sharjah"
                            rows={2}
                          />
                        </div>
                      )}
                    </div>

                    <div className="border-t" />

                    {/* END LOCATION */}
                    <div className="space-y-4">
                      <h4 className="font-medium">End Location</h4>
                      
                      <RadioGroup
                        value={formData.endLocationType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, endLocationType: value })
                        }
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Our Office" id="end-office" />
                          <Label htmlFor="end-office" className="font-normal cursor-pointer">
                            Our Office
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Address" id="end-address" />
                          <Label htmlFor="end-address" className="font-normal cursor-pointer">
                            Address
                          </Label>
                        </div>
                      </RadioGroup>

                      {formData.endLocationType === "Our Office" && (
                        <div className="space-y-2">
                          <Label>
                            Office <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={formData.endOffice}
                            onValueChange={(value) =>
                              setFormData({ ...formData, endOffice: value })
                            }
                          >
                            <SelectTrigger>
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

                      {formData.endLocationType === "Address" && (
                        <div className="space-y-2">
                          <Label>
                            Address <span className="text-destructive">*</span>
                          </Label>
                          <Textarea
                            value={formData.endAddress}
                            onChange={(e) =>
                              setFormData({ ...formData, endAddress: e.target.value })
                            }
                            placeholder="e.g., Shell Fuel Station, Sheikh Zayed Road, Dubai"
                            rows={2}
                          />
                        </div>
                      )}
                    </div>

                    {/* Optional: Location Notes */}
                    <div className="space-y-2">
                      <Label>Location Notes (Optional)</Label>
                      <Textarea
                        value={formData.locationNotes}
                        onChange={(e) =>
                          setFormData({ ...formData, locationNotes: e.target.value })
                        }
                        placeholder="Any special instructions for accessing these locations..."
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section C: Vehicle Details (Contract-Related only) */}
              {formData.type === "Contract-Related" && vehicleData && (
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
              {formData.type === "Contract-Related" && formData.subtype === "Vehicle Delivery" && (
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
              {formData.type === "Contract-Related" && formData.subtype === "Vehicle Pick-up" && (
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

            </>
          )}

          {/* Phase 2: Subtype-Specific Sections for Internal Requests */}
          
          {/* Wash Details Section */}
          {formData.type === "Internal" && formData.subtype === "Wash" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Droplets className="w-4 h-4" />
                  Wash Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Wash Type - Required */}
                <div className="space-y-2">
                  <Label>Wash Type <span className="text-destructive">*</span></Label>
                  <Select value={formData.washType} onValueChange={(value) => setFormData({ ...formData, washType: value })}>
                    <SelectTrigger><SelectValue placeholder="Select wash type" /></SelectTrigger>
                    <SelectContent>
                      {WASH_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Wash Provider */}
                <div className="space-y-2">
                  <Label>Wash Provider</Label>
                  <Select value={formData.washProvider} onValueChange={(value) => setFormData({ ...formData, washProvider: value })}>
                    <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                    <SelectContent>
                      {WASH_PROVIDERS.map(provider => <SelectItem key={provider} value={provider}>{provider}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* External Vendor Name - conditional */}
                {formData.washProvider === "External Vendor" && (
                  <div className="space-y-2">
                    <Label>External Vendor Name</Label>
                    <Input value={formData.washVendorName} onChange={(e) => setFormData({ ...formData, washVendorName: e.target.value })} placeholder="Enter vendor name" />
                  </div>
                )}

                {/* Customer-Facing Prep - Multi-select checkboxes */}
                <div className="space-y-2">
                  <Label>Customer-Facing Prep (Optional)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PREP_ITEMS.map(item => (
                      <div key={item} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id={`prep-${item}`} 
                          checked={formData.washPrepItems.includes(item)} 
                          onChange={(e) => {
                            const newItems = e.target.checked ? [...formData.washPrepItems, item] : formData.washPrepItems.filter(i => i !== item);
                            setFormData({ ...formData, washPrepItems: newItems });
                          }} 
                        />
                        <Label htmlFor={`prep-${item}`} className="font-normal cursor-pointer">{item}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea value={formData.washNotes} onChange={(e) => setFormData({ ...formData, washNotes: e.target.value })} placeholder="Any additional wash instructions..." rows={3} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Refuel Details Section */}
          {formData.type === "Internal" && formData.subtype === "Refuel" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Fuel className="w-4 h-4" />
                  Refuel Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Refuel Target - Required */}
                <div className="space-y-2">
                  <Label>Refuel Target <span className="text-destructive">*</span></Label>
                  <Select value={formData.refuelTarget} onValueChange={(value) => setFormData({ ...formData, refuelTarget: value })}>
                    <SelectTrigger><SelectValue placeholder="Select target" /></SelectTrigger>
                    <SelectContent>
                      {REFUEL_TARGETS.map(target => <SelectItem key={target} value={target}>{target}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Target Liters - conditional & required */}
                {formData.refuelTarget === "Specific Liters" && (
                  <div className="space-y-2">
                    <Label>Target Liters <span className="text-destructive">*</span></Label>
                    <Input type="number" value={formData.targetLiters} onChange={(e) => setFormData({ ...formData, targetLiters: e.target.value })} placeholder="Enter liters" />
                  </div>
                )}

                {/* Fuel Type - Required */}
                <div className="space-y-2">
                  <Label>Fuel Type <span className="text-destructive">*</span></Label>
                  <Select value={formData.fuelType} onValueChange={(value) => setFormData({ ...formData, fuelType: value })}>
                    <SelectTrigger><SelectValue placeholder="Select fuel type" /></SelectTrigger>
                    <SelectContent>
                      {FUEL_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Fuel Station */}
                <div className="space-y-2">
                  <Label>Fuel Station (Optional)</Label>
                  <Input value={formData.fuelStation} onChange={(e) => setFormData({ ...formData, fuelStation: e.target.value })} placeholder="e.g., ENOC Sheikh Zayed Road" />
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                    <SelectTrigger><SelectValue placeholder="Select payment method" /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map(method => <SelectItem key={method} value={method}>{method}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea value={formData.refuelNotes} onChange={(e) => setFormData({ ...formData, refuelNotes: e.target.value })} placeholder="Any additional refueling instructions..." rows={3} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tires & Batteries Details Section */}
          {formData.type === "Internal" && formData.subtype === "Tires and Batteries" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Tires & Batteries Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Action Type - Required */}
                <div className="space-y-2">
                  <Label>Action Type <span className="text-destructive">*</span></Label>
                  <Select value={formData.tbActionType} onValueChange={(value) => setFormData({ ...formData, tbActionType: value })}>
                    <SelectTrigger><SelectValue placeholder="Select action" /></SelectTrigger>
                    <SelectContent>
                      {TB_ACTION_TYPES.map(action => <SelectItem key={action} value={action}>{action}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Workshop/Provider */}
                <div className="space-y-2">
                  <Label>Workshop/Provider</Label>
                  <Select value={formData.tbWorkshopProvider} onValueChange={(value) => setFormData({ ...formData, tbWorkshopProvider: value })}>
                    <SelectTrigger><SelectValue placeholder="Select workshop" /></SelectTrigger>
                    <SelectContent>
                      {WORKSHOP_PROVIDERS.map(provider => <SelectItem key={provider} value={provider}>{provider}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* External Vendor Name - conditional */}
                {formData.tbWorkshopProvider === "External Vendor" && (
                  <div className="space-y-2">
                    <Label>External Vendor Name</Label>
                    <Input value={formData.tbVendorName} onChange={(e) => setFormData({ ...formData, tbVendorName: e.target.value })} placeholder="Enter vendor name" />
                  </div>
                )}

                {/* Tire Details Section - show if action contains "Tire" */}
                {formData.tbActionType && formData.tbActionType.includes("Tire") && (
                  <div className="space-y-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium">Tire Details</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input type="number" value={formData.tireQuantity} onChange={(e) => setFormData({ ...formData, tireQuantity: e.target.value })} placeholder="e.g., 4" />
                      </div>
                      <div className="space-y-2">
                        <Label>Size</Label>
                        <Input value={formData.tireSize} onChange={(e) => setFormData({ ...formData, tireSize: e.target.value })} placeholder="e.g., 235/55 R18" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Brand/Model</Label>
                      <Input value={formData.tireBrandModel} onChange={(e) => setFormData({ ...formData, tireBrandModel: e.target.value })} placeholder="e.g., Michelin Primacy 4" />
                    </div>

                    <div className="space-y-2">
                      <Label>Position Map (Optional)</Label>
                      <div className="flex gap-2">
                        {TIRE_POSITIONS.map(pos => (
                          <div key={pos} className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id={`tire-pos-${pos}`} 
                              checked={formData.tirePositions.includes(pos)} 
                              onChange={(e) => {
                                const newPositions = e.target.checked ? [...formData.tirePositions, pos] : formData.tirePositions.filter(p => p !== pos);
                                setFormData({ ...formData, tirePositions: newPositions });
                              }} 
                            />
                            <Label htmlFor={`tire-pos-${pos}`} className="font-normal cursor-pointer">{pos}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Old Tire Notes</Label>
                      <Textarea value={formData.tireOldNotes} onChange={(e) => setFormData({ ...formData, tireOldNotes: e.target.value })} placeholder="Notes about old tires being removed..." rows={2} />
                    </div>
                  </div>
                )}

                {/* Battery Details Section - show if action contains "Battery" */}
                {formData.tbActionType && formData.tbActionType.includes("Battery") && (
                  <div className="space-y-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium">Battery Details</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type/Capacity</Label>
                        <Input value={formData.batteryTypeCapacity} onChange={(e) => setFormData({ ...formData, batteryTypeCapacity: e.target.value })} placeholder="e.g., 70Ah AGM" />
                      </div>
                      <div className="space-y-2">
                        <Label>Brand/Model</Label>
                        <Input value={formData.batteryBrandModel} onChange={(e) => setFormData({ ...formData, batteryBrandModel: e.target.value })} placeholder="e.g., Bosch S4" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Serial No.</Label>
                        <Input value={formData.batterySerial} onChange={(e) => setFormData({ ...formData, batterySerial: e.target.value })} placeholder="Battery serial number" />
                      </div>
                      <div className="space-y-2">
                        <Label>Warranty Info</Label>
                        <Input value={formData.batteryWarranty} onChange={(e) => setFormData({ ...formData, batteryWarranty: e.target.value })} placeholder="e.g., 2 years" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Old Battery Notes</Label>
                      <Textarea value={formData.batteryOldNotes} onChange={(e) => setFormData({ ...formData, batteryOldNotes: e.target.value })} placeholder="Notes about old battery being removed..." rows={2} />
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea value={formData.tbNotes} onChange={(e) => setFormData({ ...formData, tbNotes: e.target.value })} placeholder="Any additional instructions..." rows={3} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Phase 3: Operational Details for Internal Requests */}
          
          {/* Driver Assignment Preference Section */}
          {formData.type === "Internal" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Driver Assignment Preference (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Assignment Mode</Label>
                  <Select value={formData.assignmentMode} onValueChange={(value) => setFormData({ ...formData, assignmentMode: value })}>
                    <SelectTrigger><SelectValue placeholder="Select assignment mode" /></SelectTrigger>
                    <SelectContent>
                      {ASSIGNMENT_MODES.map(mode => <SelectItem key={mode} value={mode}>{mode}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {formData.assignmentMode === "Specific Driver" && (
                  <div className="space-y-2">
                    <Label>Preferred Driver ID</Label>
                    <Input 
                      value={formData.preferredDriverId} 
                      onChange={(e) => setFormData({ ...formData, preferredDriverId: e.target.value })} 
                      placeholder="Enter driver ID or name" 
                    />
                  </div>
                )}

                {formData.assignmentMode === "Specific Origin Branch" && (
                  <div className="space-y-2">
                    <Label>Preferred Origin Branch</Label>
                    <Select 
                      value={formData.preferredOriginBranch} 
                      onValueChange={(value) => setFormData({ ...formData, preferredOriginBranch: value })}
                    >
                      <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
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
              </CardContent>
            </Card>
          )}

          {/* Fees Section (Optional, Informational) */}
          {formData.type === "Internal" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Fees (Optional, Informational)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Internal Run Fee (AED)</Label>
                    <Input 
                      type="number" 
                      value={formData.internalRunFee} 
                      onChange={(e) => setFormData({ ...formData, internalRunFee: e.target.value })} 
                      placeholder="0.00" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Parts/Materials Est. (AED)</Label>
                    <Input 
                      type="number" 
                      value={formData.partsMaterialsEst} 
                      onChange={(e) => setFormData({ ...formData, partsMaterialsEst: e.target.value })} 
                      placeholder="0.00" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Estimated Total (AED)</Label>
                  <div className="p-2 bg-muted rounded-md text-sm font-medium">
                    {(parseFloat(formData.internalRunFee || "0") + parseFloat(formData.partsMaterialsEst || "0")).toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attachments Section (Optional) */}
          {formData.type === "Internal" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  Attachments (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Upload Files</Label>
                  <Input 
                    type="file" 
                    multiple 
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      const validFiles = files.filter(f => f.size <= 10 * 1024 * 1024); // 10MB limit
                      setFormData({ ...formData, attachments: [...formData.attachments, ...validFiles] });
                    }} 
                  />
                  <p className="text-xs text-muted-foreground">Max 10MB per file</p>
                </div>

                {formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    <Label>Attached Files</Label>
                    <div className="space-y-1">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                          <span>{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              const newAttachments = formData.attachments.filter((_, i) => i !== index);
                              setFormData({ ...formData, attachments: newAttachments });
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Show Time Window and Internal Notes for all types */}
          {(formData.type === "Contract-Related" || formData.type === "Internal") && (
            <>
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
                      disabled={mode === "view"}
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
                        disabled={mode === "view"}
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
                        disabled={mode === "view"}
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
                      disabled={mode === "view"}
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
                      disabled={mode === "view"}
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
                    disabled={mode === "view"}
                  />
                </CardContent>
              </Card>
            </>
          )}
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-background border-t px-6 py-4">
            <div className="flex justify-end gap-3">
              {mode === "create" ? (
                <>
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
                </>
              ) : (
                <Button onClick={handleClose}>Close</Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
