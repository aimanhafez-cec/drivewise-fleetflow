import { Button } from "@/components/ui/button";
import { FileText, Building2 } from "lucide-react";

interface ViewToggleProps {
  currentView: "integration" | "contract";
  onViewChange: (view: "integration" | "contract") => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-background p-1">
      <Button
        variant={currentView === "integration" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("integration")}
        className={
          currentView === "integration"
            ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
            : "text-muted-foreground hover:text-foreground"
        }
      >
        <FileText className="h-4 w-4 mr-2" />
        Integration View
      </Button>
      <Button
        variant={currentView === "contract" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("contract")}
        className={
          currentView === "contract"
            ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
            : "text-muted-foreground hover:text-foreground"
        }
      >
        <Building2 className="h-4 w-4 mr-2" />
        Contract View
      </Button>
    </div>
  );
}
