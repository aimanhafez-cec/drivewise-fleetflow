import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MovementWizard } from "./components/MovementWizard";

export default function NewMovement() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/operations/fleet")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Vehicle Movement</h1>
          <p className="text-muted-foreground mt-1">
            Create a vehicle ownership transfer or inter-branch movement
          </p>
        </div>
      </div>

      {/* Wizard */}
      <Card>
        <CardContent className="pt-6">
          <MovementWizard />
        </CardContent>
      </Card>
    </div>
  );
}
