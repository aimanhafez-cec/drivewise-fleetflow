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
  });

  const handleTypeChange = (value: string) => {
    setFormData({
      ...formData,
      type: value,
      subtype: "", // Reset subtype when type changes
    });
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
    });
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

          {/* Placeholder for future sections */}
          {formData.type === "Contract-Related" && formData.subtype === "Vehicle Delivery" && (
            <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-md">
              Vehicle Delivery sections will be added in Phase 2
            </div>
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
